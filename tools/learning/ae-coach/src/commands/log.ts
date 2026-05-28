import { loadConfig } from "../config";
import { logResult } from "../db";

export function runLog(args: string[]) {
  if (!loadConfig()) {
    console.error("ae-coach not initialized. Run `ae-coach init` first.");
    process.exit(1);
  }

  const type = getArg(args, "--type") ?? "unknown";
  const result = getArg(args, "--result");

  if (result !== "correct" && result !== "wrong" && result !== "skip") {
    console.error("--result must be correct, wrong, or skip");
    process.exit(1);
  }

  try {
    logResult(type, result);
  } catch (err) {
    process.stderr.write(`ae-coach log failed: ${err}\n`);
  }
}

function getArg(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
}
