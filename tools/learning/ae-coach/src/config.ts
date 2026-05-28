import { homedir } from "os";
import { join } from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

export const CONFIG_DIR = join(homedir(), ".ae-coach");
export const CONFIG_PATH = join(CONFIG_DIR, "config.json");
export const DB_PATH = join(CONFIG_DIR, "db.sqlite");

export interface InterventionConfig {
  enabled: boolean;
  rate: number;
}

export interface Config {
  user_name: string;
  interventions: Record<string, InterventionConfig>;
  notion_sync: false; // not yet built — placeholder for team Notion sync
}

export const DEFAULT_INTERVENTIONS: Record<string, InterventionConfig> = {
  outcome_predictor: { enabled: true, rate: 0.4 },
  schema_quiz: { enabled: true, rate: 0.3 },
  sql_write: { enabled: false, rate: 0.2 },
};

export function configExists(): boolean {
  return existsSync(CONFIG_PATH);
}

export function loadConfig(): Config | null {
  if (!existsSync(CONFIG_PATH)) return null;
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf-8")) as Config;
  } catch {
    return null;
  }
}

export function saveConfig(config: Config): void {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}
