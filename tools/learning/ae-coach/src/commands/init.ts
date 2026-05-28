import { createInterface } from "readline";
import { homedir } from "os";
import { join } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { saveConfig, loadConfig, DEFAULT_INTERVENTIONS, type Config } from "../config";

const CLAUDE_SETTINGS_PATH = join(homedir(), ".claude", "settings.json");

function ask(rl: ReturnType<typeof createInterface>, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

export async function runInit() {
  console.log("\nae-coach — learning friction for AE teams\n");

  const existing = loadConfig();
  if (existing) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await ask(rl, `Already configured as ${existing.user_name}. Re-run init? [y/N] `);
    rl.close();
    if (!answer.trim().toLowerCase().startsWith("y")) return;
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const userName = (await ask(rl, "Your name: ")).trim();
  const notionAnswer = (await ask(rl, "Sync results to a shared Notion database? (not built yet) [y/N] ")).trim();
  rl.close();

  if (!userName) {
    console.error("Name is required.");
    process.exit(1);
  }

  if (notionAnswer.toLowerCase().startsWith("y")) {
    console.log("\n  Notion sync is on the roadmap but not available yet.\n  For now, results are stored locally at ~/.ae-coach/db.sqlite.\n");
  }

  const config: Config = {
    user_name: userName,
    interventions: DEFAULT_INTERVENTIONS,
    notion_sync: false,
  };

  saveConfig(config);
  installHook();

  console.log(`
Config saved to ~/.ae-coach/config.json
Results stored locally at ~/.ae-coach/db.sqlite
Claude Code hook installed in ~/.claude/settings.json

Challenges will fire randomly during dbt runs.
Run \`ae-coach stats\` to see your progress.
`);
}

function installHook() {
  let settings: Record<string, unknown> = {};
  if (existsSync(CLAUDE_SETTINGS_PATH)) {
    try {
      settings = JSON.parse(readFileSync(CLAUDE_SETTINGS_PATH, "utf-8"));
    } catch {
      settings = {};
    }
  }

  const hookEntry = {
    hooks: [
      {
        type: "command",
        command: "ae-coach hook",
        if: "Bash(dbt *)",
      },
    ],
  };

  const existing = (settings.hooks as Record<string, unknown[]>) ?? {};
  const preToolUse: unknown[] = (existing.PreToolUse as unknown[]) ?? [];

  const filtered = preToolUse.filter((h) => !JSON.stringify(h).includes("ae-coach hook"));
  filtered.push(hookEntry);

  settings.hooks = { ...existing, PreToolUse: filtered };
  writeFileSync(CLAUDE_SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf-8");
}
