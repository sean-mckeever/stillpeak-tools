import { loadConfig } from "../config";
import { selectChallenge } from "../challenges";

interface HookPayload {
  tool_name: string;
  tool_input: { command?: string };
}

export async function runHook() {
  const config = loadConfig();
  if (!config) process.exit(0);

  // Read hook JSON from stdin
  const raw = await readStdin();
  let payload: HookPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const command = payload.tool_input?.command ?? "";
  if (!isDbtTrigger(command)) process.exit(0);

  const challenge = selectChallenge(config, command);
  if (!challenge) process.exit(0);

  const output = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      additionalContext: buildChallengePrompt(challenge, command),
    },
  };

  process.stdout.write(JSON.stringify(output));
}

function isDbtTrigger(command: string): boolean {
  return /\bdbt\s+(run|build|test)\b/.test(command);
}

function buildChallengePrompt(
  challenge: { type: string; question: string; hint: string },
  command: string
): string {
  return `
🎯 AE COACH CHALLENGE

Before running \`${command}\`, ask the user this challenge question:

"${challenge.question}"

Wait for their answer. Evaluate it using this guidance: ${challenge.hint}

Then log the result by running:
  ae-coach log --type ${challenge.type} --result [correct|wrong|skip]

If the user says "skip" or doesn't want to answer, run:
  ae-coach log --type ${challenge.type} --result skip

After logging, proceed to run the dbt command as originally requested.
`.trim();
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf-8");
}
