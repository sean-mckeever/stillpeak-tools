import { runInit } from "./commands/init";
import { runHook } from "./commands/hook";
import { runLog } from "./commands/log";
import { runStats } from "./commands/stats";

const [, , command, ...args] = process.argv;

switch (command) {
  case "init":
    runInit().catch(console.error);
    break;
  case "hook":
    runHook().catch(console.error);
    break;
  case "log":
    runLog(args);
    break;
  case "stats":
    runStats();
    break;
  default:
    console.log(`ae-coach — learning friction for AE teams

Commands:
  init    Set up ae-coach (name, installs Claude Code hook)
  stats   Show your personal progress
  log     Log a challenge result (called by Claude after a challenge)
  hook    Hook handler (called by Claude Code — not for direct use)
`);
}
