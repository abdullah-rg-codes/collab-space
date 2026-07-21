/**
 * Storage layer with versioning and migration support
   This module handles:
  - localStorage persistence
  - Schema versioning
  - Data migrations between versions
 */

import type { Task } from "../types";

const STORAGE_KEY = 'collab-space-data';
const CURRENT_VERSION = 3;

// * Storage schema interface - versioned
interface StorageSchema {
  version: number
  tasks: Task[]
  lastMigrated?: number
}

/**
 * V1 schema (old format) - for migration purposes
 */
interface StorageSchemaV1 {
  version: 1
  tasks: Array<{
    id: string
    title: string
    desc?: string
    status: string
    priority: string
    assignee: string
    createdAt: number
    updatedAt: number
  }>
}

/**
 * V2 schema (old format) - for migration purposes
 */
interface StorageSchemaV2 {
  version: 2
  tasks: Array<{
    id: string
    title: string
    description: string
    status: string
    priority: string
    assignee: string
    tags: string[]
    createdAt: number
    updatedAt: number
  }>
}

/**
 * Migrate from V1 to V2
 * Changes:
 * - Rename 'desc' field to 'description'
 * - Add empty 'tags' array
 */
function migrateV1ToV2(data: StorageSchemaV1): StorageSchemaV2 {
  console.log('[Storage] Migrating V1 → V2: Adding tags field')
  return {
    version: 2,
    tasks: data.tasks.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.desc || '',
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      tags: [],
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    })),
  }
}

/**
 * Migrate from V2 to V3
 * Changes:
 * - Add 'dueDate' field (set to createdAt + 7 days by default)
 */
function migrateV2ToV3(data: StorageSchemaV2): StorageSchema {
  console.log('[Storage] Migrating V2 → V3: Adding dueDate field')
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000
  return {
    version: 3,
    tasks: data.tasks.map((task: any) => ({
      ...task,
      dueDate: task.dueDate || task.createdAt + ONE_WEEK_MS,
    })),
    lastMigrated: Date.now(),
  }
}

//  Migrate data to current version
function migrate(data: any): StorageSchema {
  if (!data.version || data.version === 1) {
    console.log('[Storage] Detected V1 schema, starting migration chain')
    const v2 = migrateV1ToV2(data)
    return migrateV2ToV3(v2)
  }

  if (data.version === 2) {
    console.log('[Storage] Detected V2 schema, migrating to V3')
    return migrateV2ToV3(data)
  }

  if (data.version === CURRENT_VERSION) {
    console.log('[Storage] Data already at current version (V3)')
    return data
  }

  console.warn(`[Storage] Unknown schema version: ${data.version}, using current`)
  return {
    version: CURRENT_VERSION,
    tasks: Array.isArray(data.tasks) ? data.tasks : [],
    lastMigrated: Date.now(),
  }
}

let migrationHappened = false

// * Load tasks from localStorage
export function loadTasks(): Task[] {
  try {
    console.log('[Storage] loadTasks() called')
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      console.log('[Storage] No existing data, starting new')
      migrationHappened = false
      return []
    }
    const parsed = JSON.parse(raw);
    console.log('[Storage] Parsed data:', parsed)
    const migrated = migrate(parsed);
    console.log('[Storage] Migrated data:', migrated)
    migrationHappened = parsed.version !== CURRENT_VERSION
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
    console.log('[Storage] Loaded tasks count:', migrated.tasks?.length)
    return migrated.tasks || [];
  } catch (err) {
    console.error('[Storage] Failed to load tasks:', err)
    return []
  }
}


// Save tasks to localStorage
export function saveTasks(tasks: Task[]): boolean {
  try {
    console.log('[Storage] saveTasks() called with', tasks.length, 'tasks')
    console.log('[Storage] Tasks to save:', tasks)
    const data: StorageSchema = {
      version: CURRENT_VERSION,
      tasks,
      lastMigrated: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    console.log('[Storage] Successfully saved to localStorage')
    return true
  } catch (error) {
    console.error('[Storage] Failed to save tasks:', error)
    return false
  }
}

// Clear all tasks from storage
export function clearTasks(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('[Storage] Failed to clear tasks:', error)
    return false
  }
}

// Get storage info and version
export function getStorageInfo(): {
  version: number
  taskCount: number
  lastMigrated?: number
} {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { version: CURRENT_VERSION, taskCount: 0 }
    }

    const parsed = JSON.parse(raw)
    return {
      version: parsed.version || 1,
      taskCount: Array.isArray(parsed.tasks) ? parsed.tasks.length : 0,
      lastMigrated: parsed.lastMigrated,
    }
  } catch (error) {
    console.error('[Storage] Failed to get info:', error)
    return { version: CURRENT_VERSION, taskCount: 0 }
  }
}

// Check if migration happened on load
export function didMigrationHappen(): boolean {
  return migrationHappened
}
