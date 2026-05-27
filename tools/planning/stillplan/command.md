# StillPlan

Structure a project or feature into a clear, reviewable plan before any implementation begins.

## Usage

Run `/stillplan` and describe what you want to build or change. StillPlan will produce:

1. **Goal** — one sentence on what success looks like
2. **Scope** — what's in and explicitly what's out
3. **Steps** — ordered, discrete tasks with enough detail to review and approve each one
4. **Open questions** — anything that needs a decision before work starts
5. **Risks** — dependencies, assumptions, or things that could go wrong

Review the plan, push back on any step, and only proceed once you're satisfied.

## Prompt

$ARGUMENTS

Produce a structured plan using the format above. Be specific about each step — vague steps are not reviewable. Flag any open questions or risks rather than making silent assumptions.
