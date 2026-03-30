import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export interface SyncHistoryEntry {
  readonly id: string;
  readonly skillName: string;
  readonly targetAgents: readonly string[];
  readonly mode: "symlink" | "copy";
  readonly successCount: number;
  readonly failCount: number;
  readonly timestamp: number;
}

const HISTORY_FILE = path.join(os.homedir(), ".vibe-rules", "sync-history.json");
const MAX_ENTRIES = 100;

/**
 * Load sync history from disk.
 */
export async function loadSyncHistory(): Promise<readonly SyncHistoryEntry[]> {
  try {
    const raw = await fs.promises.readFile(HISTORY_FILE, "utf-8");
    const data = JSON.parse(raw) as SyncHistoryEntry[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Save a sync history entry.
 */
export async function addSyncHistoryEntry(
  entry: Omit<SyncHistoryEntry, "id">
): Promise<SyncHistoryEntry> {
  const history = [...(await loadSyncHistory())];
  const newEntry: SyncHistoryEntry = {
    ...entry,
    id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };

  history.unshift(newEntry);

  // Keep only the latest MAX_ENTRIES
  const trimmed = history.slice(0, MAX_ENTRIES);

  await fs.promises.mkdir(path.dirname(HISTORY_FILE), { recursive: true });
  await fs.promises.writeFile(HISTORY_FILE, JSON.stringify(trimmed, null, 2), "utf-8");

  return newEntry;
}

/**
 * Clear all sync history.
 */
export async function clearSyncHistory(): Promise<void> {
  try {
    await fs.promises.unlink(HISTORY_FILE);
  } catch {
    // File doesn't exist — that's fine
  }
}
