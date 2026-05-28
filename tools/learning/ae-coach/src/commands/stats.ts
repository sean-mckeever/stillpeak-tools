import { loadConfig } from "../config";
import { loadStats } from "../db";

export function runStats() {
  const config = loadConfig();
  if (!config) {
    console.error("ae-coach not initialized. Run `ae-coach init` first.");
    process.exit(1);
  }

  const s = loadStats();

  console.log(`\n  ${config.user_name} — AE Coach Stats\n`);

  if (s.total_attempts === 0 && s.total_skipped === 0) {
    console.log("  No challenges logged yet. Run some dbt commands to get started.\n");
    return;
  }

  // Summary line
  const streakStr = s.streak > 1 ? ` · ${s.streak} streak 🔥` : "";
  console.log(
    `  ${s.total_correct}/${s.total_attempts} correct · ${s.accuracy}% accuracy · ${s.total_skipped} skipped${streakStr}\n`
  );

  // Per-type breakdown
  if (Object.keys(s.by_type).length > 0) {
    console.log("  By type:\n");
    for (const [type, t] of Object.entries(s.by_type)) {
      const bar = accuracyBar(t.accuracy);
      const label = type.replace(/_/g, " ").padEnd(22);
      const counts = `${t.correct}/${t.attempts}`.padEnd(7);
      const acc = `${t.accuracy}%`.padEnd(5);
      const skipped = t.skipped > 0 ? `  ${t.skipped} skipped` : "";
      console.log(`    ${label} ${counts} ${acc} ${bar}${skipped}`);
    }
    console.log();
  }

  // Recent activity
  if (s.recent.length > 0) {
    console.log("  Recent:\n");
    for (const r of s.recent) {
      const icon = r.result === "correct" ? "✓" : r.result === "skip" ? "·" : "✗";
      const type = r.challenge_type.replace(/_/g, " ");
      const date = new Date(r.ts * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      console.log(`    ${icon}  ${type.padEnd(22)} ${date}`);
    }
    console.log();
  }
}

function accuracyBar(pct: number): string {
  const filled = Math.round(pct / 10);
  return "[" + "█".repeat(filled) + "░".repeat(10 - filled) + "]";
}
