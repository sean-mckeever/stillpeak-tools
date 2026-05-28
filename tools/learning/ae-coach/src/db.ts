import { Database } from "bun:sqlite";
import { existsSync, mkdirSync } from "fs";
import { CONFIG_DIR, DB_PATH } from "./config";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  challenge_type TEXT NOT NULL,
  result TEXT NOT NULL,   -- 'correct' | 'wrong' | 'skip'
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
`;

function openDb(): Database {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.exec(SCHEMA);
  return db;
}

function eventId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function logResult(challengeType: string, result: "correct" | "wrong" | "skip"): void {
  const db = openDb();
  db.prepare("INSERT INTO events (id, challenge_type, result) VALUES (?, ?, ?)").run(
    eventId(),
    challengeType,
    result
  );
  db.close();
}

export interface TypeStats {
  attempts: number;
  correct: number;
  skipped: number;
  accuracy: number;
}

export interface Stats {
  total_attempts: number;
  total_correct: number;
  total_skipped: number;
  accuracy: number;
  streak: number;
  by_type: Record<string, TypeStats>;
  recent: { challenge_type: string; result: string; ts: number }[];
}

export function loadStats(): Stats {
  const db = openDb();

  const rows = db
    .prepare("SELECT challenge_type, result, created_at FROM events ORDER BY created_at ASC")
    .all() as { challenge_type: string; result: string; created_at: number }[];

  db.close();

  const by_type: Record<string, TypeStats> = {};
  let total_attempts = 0;
  let total_correct = 0;
  let total_skipped = 0;

  for (const row of rows) {
    if (!by_type[row.challenge_type]) {
      by_type[row.challenge_type] = { attempts: 0, correct: 0, skipped: 0, accuracy: 0 };
    }
    const t = by_type[row.challenge_type];

    if (row.result === "skip") {
      total_skipped++;
      t.skipped++;
    } else {
      total_attempts++;
      t.attempts++;
      if (row.result === "correct") {
        total_correct++;
        t.correct++;
      }
    }
  }

  for (const t of Object.values(by_type)) {
    t.accuracy = t.attempts > 0 ? Math.round((t.correct / t.attempts) * 100) : 0;
  }

  const accuracy = total_attempts > 0 ? Math.round((total_correct / total_attempts) * 100) : 0;
  const streak = computeStreak(rows);
  const recent = rows.slice(-10).reverse().map((r) => ({
    challenge_type: r.challenge_type,
    result: r.result,
    ts: r.created_at,
  }));

  return { total_attempts, total_correct, total_skipped, accuracy, streak, by_type, recent };
}

function computeStreak(rows: { result: string }[]): number {
  let streak = 0;
  for (let i = rows.length - 1; i >= 0; i--) {
    if (rows[i].result === "correct") streak++;
    else break;
  }
  return streak;
}
