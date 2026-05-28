import type { Config } from "./config";

export interface Challenge {
  type: string;
  question: string;
  hint: string; // guidance for Claude on how to evaluate the answer
}

// Stub question banks — easy to expand later
const SCHEMA_QUIZ_QUESTIONS: { question: string; hint: string }[] = [
  {
    question: "What does 'grain' mean for a fact table, and why does it matter?",
    hint: "correct if they mention: one row per [some event], and that the grain determines what you can and can't aggregate",
  },
  {
    question: "What's the difference between a slowly changing dimension and a snapshot table?",
    hint: "correct if they distinguish type 1/2 SCDs from periodic snapshots",
  },
  {
    question: "When would you use a surrogate key instead of a natural key?",
    hint: "correct if they mention: source system changes, composites, or deduplication across sources",
  },
  {
    question: "What's the risk of a LEFT JOIN where you expect all rows to match?",
    hint: "correct if they mention nulls appearing unexpectedly, or fan-out from duplicate matches",
  },
  {
    question: "What does ref() do in dbt that raw table references don't?",
    hint: "correct if they mention: dependency graph, environment targeting, and lineage tracking",
  },
];

const OUTCOME_PREDICTOR_QUESTIONS: { question: string; hint: string }[] = [
  {
    question:
      "Before this runs — what's your best guess at the row count the model will produce, and what assumption are you basing it on?",
    hint: "any specific guess with a stated assumption counts as correct — vague answers like 'some rows' don't",
  },
  {
    question:
      "What's the most likely shape of the output — what does one row represent, and roughly how many do you expect?",
    hint: "correct if they state the grain and give an order-of-magnitude estimate",
  },
  {
    question:
      "Is there any join in this model that could cause row fan-out? What would be the signal if it did?",
    hint: "correct if they identify the risky join or correctly say there isn't one",
  },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function selectChallenge(config: Config, _context: string): Challenge | null {
  // Gather enabled types and roll against their rates
  const candidates: string[] = [];

  for (const [type, cfg] of Object.entries(config.interventions)) {
    if (cfg.enabled && Math.random() < cfg.rate) {
      candidates.push(type);
    }
  }

  if (candidates.length === 0) return null;

  // Pick one at random from those that fired
  const type = pick(candidates);

  if (type === "schema_quiz") {
    const q = pick(SCHEMA_QUIZ_QUESTIONS);
    return { type, ...q };
  }

  if (type === "outcome_predictor") {
    const q = pick(OUTCOME_PREDICTOR_QUESTIONS);
    return { type, ...q };
  }

  if (type === "sql_write") {
    return {
      type,
      question:
        "Before I write the SQL — can you sketch the subquery or join logic for this yourself first?",
      hint: "correct if they make a genuine attempt at the structure, even if imperfect",
    };
  }

  return null;
}
