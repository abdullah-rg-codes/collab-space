# CollabSpace

A team workflow board for managing tasks across statuses — built with React, TypeScript, and Vite.

Think of it as a simplified Trello/Jira where you can create tasks, drag them between columns, filter/sort, and everything persists in your browser's localStorage.

---

## Running the project

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm run test:run

# Build for production
npm run build
```

The app runs at `http://localhost:5173` by default.

---

## Tech stack

- React 19 + TypeScript
- Vite (build tool)
- Vitest + React Testing Library (testing)
- dayjs (relative time formatting)
- CSS Modules + CSS custom properties (styling)
- localStorage (persistence)

No UI libraries (Material UI, Ant Design, etc.) — all components are hand-built.

---

## How it works

The app has three main layers:

**UI Components** (`src/components/ui/`) — Reusable, stateless building blocks. Button, TextInput, TextArea, Select, Modal, Tag, Card, Toast, DateInput. Each has its own CSS file and accepts props for variants/states.

**Features** (`src/features/`) — The actual app logic. BoardView renders three columns (Backlog, In Progress, Done). TaskCard displays individual tasks. TaskForm handles create/edit with validation.

**Hooks** (`src/hooks/`) — Where the business logic lives. `useTasks` manages all task state with a reducer pattern + localStorage sync. `useUrlFilters` keeps filters in the URL so they survive refresh. `useDirtyState` warns you before losing unsaved form changes.

**Storage** (`src/lib/storage.ts`) — Handles reading/writing localStorage with a versioned schema. If the app detects old data (v1), it migrates it to v2 format automatically and shows a toast notification.

---

## Key decisions

**Why `useReducer` instead of a state library?** The task state has multiple related actions (add, update, delete, filter, sort). A reducer keeps those predictable without adding a dependency like Zustand or Redux. For an app this size, it's the right balance.

**Why normalized state?** Tasks are stored as `Record<id, Task>` with a separate `ids` array. This gives O(1) lookups for updates/deletes instead of scanning arrays. It also makes the filtered view a simple derivation via `useMemo`.

**Why synchronous hydration?** I initially used a `useEffect` to load from localStorage, but that caused a race condition where the save effect would fire with empty state on mount and wipe the stored data. The fix was to read localStorage directly in the reducer's initializer function — state is never empty on first render.

**Why CSS Modules + custom properties?** Scoped styles prevent naming collisions. CSS variables give a consistent design token system (colors, spacing, radii) that's easy to theme. The monochrome palette is defined once in `index.css` and consumed everywhere.

---

## What's tested

14 tests across two files:

- `src/App.test.tsx` — Core CRUD workflow: create task, multiple tasks sorted correctly, update status (simulating drag-drop), delete task + verify localStorage
- `src/features/board/BoardView.test.tsx` — Filtering and sorting: default sort, priority filter (single + multi), text search, status filter, sort by priority/updatedAt, combined filters, empty results, clear filters

Tests use `renderHook` to test the `useTasks` hook directly. This validates all the logic (CRUD, filtering, sorting, persistence) without fighting React 19's concurrent renderer in jsdom.

---

## Known limitations and trade-offs

- **No backend** — Everything is localStorage. If you clear browser data, tasks are gone. Fine for this scope but obviously not production-ready.
- **Drag-and-drop is native HTML5** — Works but isn't as polished as react-beautiful-dnd or dnd-kit. No drag preview customization or smooth animations. Chose simplicity over adding another dependency.
- **No virtual scrolling** — If you had hundreds of tasks per column, performance would degrade. For the expected scale (dozens of tasks), it's fine.
- **No debounce on search** — ~~The text filter runs on every keystroke.~~ Fixed: search is debounced (300ms) so the filter only fires after the user stops typing. The input remains responsive since it uses local state for the display value.
- **Due date allows today** — The date picker prevents past dates but allows today. Depending on timezone edge cases, "today" might technically be past by the time someone finishes the task.
- **No rich text** — Description is plain text (textarea). If this grew, you'd want a markdown editor or similar.

---

## AI assistance

I used AI (Kiro/Claude) as a coding assistant during development. Here's how:

**Where I used it:**
- CSS theming — generating the monochrome color palette and applying it consistently across 14+ CSS files
- Debugging the localStorage persistence bug — helped trace the race condition between useEffect load/save
- SVG icons — generating inline SVG markup for edit, delete, calendar, and empty-state icons
- Boilerplate reduction — initial component scaffolding and repetitive CSS rewrites during the redesign

**What I changed from suggestions:**
- Rewrote the `useTasks` hydration approach — AI's first fix (useRef guard) didn't work because both effects run in the same render cycle. I identified the real issue (effects fire with stale initial state) and switched to synchronous initialization via the reducer's lazy initializer
- Adjusted the Select component — removed the placeholder option entirely instead of the suggested "make it optional via prop" approach, since both dropdowns (sort + priority) always have a valid default
- Modified focus management — AI suggested autoFocus on the input directly, but that was overridden by the Modal's focus trap. I fixed the Modal to prefer inputs over buttons, and added a conditional `autoFocus={!isEditing}` so it only fires for new task creation

The architecture decisions (normalized state, reducer pattern, URL filter sync, storage migration strategy) were my own design choices made before and during implementation.

---

## Project structure

```
src/
├── components/
│   ├── ui/                 Design system (Button, Modal, TextInput, etc.)
│   └── ErrorBoundary.tsx   App-level error recovery
├── features/
│   ├── board/              BoardView, Column
│   └── tasks/              TaskCard, TaskForm
├── hooks/                  useTasks, useUrlFilters, useDirtyState, useToast
├── lib/                    Storage layer (localStorage + migration)
├── types/                  TypeScript interfaces
├── test/                   Test setup
├── App.tsx                 Root component
├── App.css                 App-level styles
├── index.css               Global tokens + reset
└── main.tsx                Entry point
```
