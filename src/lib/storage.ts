/**
 * Storage layer with versioning and migration support
   This module handles:
  - localStorage persistence
  - Schema versioning
  - Data migrations between versions
 */

import type { Task } from "../types";

const STORAGE_KEY = 'collab-space-data';
const CURRENT_VERSION = 2;


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
 * Migrate from V1 to V2
 * Changes:
 * - Rename 'desc' field to 'description'
 * - Add empty 'tags' array
 */
function migrateV1ToV2(data: StorageSchemaV1): StorageSchema {
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
    lastMigrated: Date.now(),
  }
}

//  Migrate data to current version
function migrate(data: any): StorageSchema {
  if (!data.version || data.version === 1) {
    console.log('[Storage] Migrating from V1 to V2')
    return migrateV1ToV2(data)
  }

  if (data.version === CURRENT_VERSION) {
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
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      console.log('[Storage] No existing data, starting new')
      migrationHappened = false
      return []
    }
    const parsed = JSON.parse(raw);
    const migrated = migrate(parsed);
    migrationHappened = parsed.version !== CURRENT_VERSION
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
    return migrated.tasks || [];
  } catch (err) {
    console.error('[Storage] Failed to load tasks:', err)
    return []
  }
}


// Save tasks to localStorage
export function saveTasks(tasks: Task[]): boolean {
  try {
    const data: StorageSchema = {
      version: CURRENT_VERSION,
      tasks,
      lastMigrated: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
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
