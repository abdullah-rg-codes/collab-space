# Architecture & Design Notes

---

## Component Hierarchy

```
App
├── ErrorBoundary
├── Header (inline in App.tsx)
│   └── Button ("+ New Task")
├── ToastContainer
│   └── Toast (multiple, stacked)
├── BoardView
│   ├── Toolbar
│   │   ├── TextInput (search, debounced 300ms)
│   │   ├── Button[] (priority filters: High, Medium, Low)
│   │   ├── Button[] (status filters: Backlog, In Progress, Done)
│   │   ├── Select (sort: Created, Updated, Priority)
│   │   └── Button (Clear Filters, conditional)
│   ├── Column (×3: Backlog, In Progress, Done)
│   │   └── TaskCard (×N per column)
│   │       └── Tag[] (task tags)
│   └── Empty States (no tasks / no filter results)
├── Modal (Create/Edit)
│   └── TaskForm
│       ├── TextInput (title)
│       ├── TextArea (description)
│       ├── Select (priority)
│       ├── TextInput (assignee)
│       ├── DateInput (due date)
│       ├── Tag input + Tag list
│       └── Button[] (Cancel, Submit)
└── Modal (Delete Confirmation)
    └── Button[] (Cancel, Delete)
```

**Data flow:** State lives in the `useTasks` hook (called in App.tsx). Filtered tasks flow down as props through BoardView → Column → TaskCard. Actions (create, edit, delete, move) bubble up via callbacks. Filters and sort sync to the URL via `useUrlFilters` so they're shareable and survive refresh.

---

## Storage Versioning & Migration

Tasks persist in localStorage under the key `collab-space-data`. The stored object has a `version` field that tells the app what shape the data is in.

**Schema versions:**

```
V1 (original):
{
  version: 1,
  tasks: [{ id, title, desc, status, priority, assignee, createdAt, updatedAt }]
}

V2 (current):
{
  version: 2,
  tasks: [{ id, title, description, status, priority, assignee, tags, createdAt, updatedAt, dueDate }],
  lastMigrated: <timestamp>
}
```

**What changed V1 → V2:**
- `desc` renamed to `description` (clearer naming)
- Added `tags: []` (empty array for existing tasks)
- Added `dueDate` (defaults to createdAt + 7 days for old tasks)

**How it works:**

On app load, `loadTasks()` reads localStorage, checks the version number, and runs the appropriate migration function if needed. After migration, it writes the upgraded data back and sets a `migrationHappened` flag. App.tsx checks that flag on mount and shows a toast: "Your data has been automatically upgraded to the latest version."

The migration is one-way and non-destructive — old fields are transformed, not deleted blindly. If we ever need a V3, we'd add a `migrateV2ToV3()` function and chain it: V1 → V2 → V3.

**Why this approach?** It's simple, predictable, and testable. Each version transition is a pure function (old shape in, new shape out). No ORM, no abstract migration framework — just an if-chain in `migrate()` that handles each version step.

---

## Refactor Example: localStorage Hydration

**The problem:**

Originally, `useTasks` loaded data from localStorage in a `useEffect`:

```tsx
// Initial approach (broken)
const [state, dispatch] = useReducer(tasksReducer, initialState) // empty

useEffect(() => {
  const tasks = loadTasks()
  dispatch({ type: 'LOAD_TASKS', payload: tasks })
}, [])

useEffect(() => {
  saveTasks(getAllTasks(state))  // saves whenever state changes
}, [state.tasks, state.ids])
```

This had a race condition. On mount, React queues both effects. The save effect sees the initial empty state and calls `saveTasks([])` — overwriting the actual stored data before `LOAD_TASKS` even processes. Result: data vanishes on every refresh.

I first tried a `useRef(false)` guard — set it to `true` after load, check it before save. That also failed because refs update synchronously within the same render cycle, so the save effect still ran with stale (empty) state in that first pass.

**The fix:**

Read localStorage synchronously in the reducer's initializer:

```tsx
function createInitialState(): TasksState {
  const tasks = loadTasks()  // sync read from localStorage
  // normalize into Record<id, Task> + ids array
  return { tasks: tasksMap, ids, filters: {...}, sortBy: 'createdAt' }
}

const [state, dispatch] = useReducer(tasksReducer, undefined, createInitialState)
```

Now state is never empty. The first render already has the correct data. The save effect uses a skip-first-render ref so it doesn't redundantly write what was just read:

```tsx
const isFirstRender = useRef(true)

useEffect(() => {
  if (isFirstRender.current) { isFirstRender.current = false; return }
  saveTasks(getAllTasks(state))
}, [state.tasks, state.ids])
```

**Why this is better:**
- No race condition — state starts correct
- No flash of empty content on mount
- Simpler code — removed the LOAD_TASKS action entirely
- The save effect only fires on actual user-driven state changes
