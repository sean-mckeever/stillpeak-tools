# ae-doc

Generate a complete, accurate dbt YAML documentation block for a model.

## Usage

```
/ae-doc <path-to-model.sql>
```

Example: `/ae-doc models/staging/stg_players.sql`

---

## Instructions

You are generating a dbt `schema.yml` entry for the model at the path provided in $ARGUMENTS.

Follow these steps in order:

### 1. Read the model

Read the SQL file at the specified path. Understand:
- Every column being selected or computed
- Any renaming (aliases)
- Any joins — what tables are joined and on what keys
- Any filters in WHERE clauses (what rows are excluded and why)
- Any transformations: casts, calculations, CASE statements, coalesces
- The grain of the model (what does one row represent?)

### 2. Gather context

- If the model references `{{ source(...) }}`, read the `sources.yml` in the same directory to understand the source table.
- If the model references `{{ ref(...) }}`, read that model's SQL file too.
- If a `schema.yml` already exists in this directory, read it so you don't duplicate entries.

### 3. Generate the YAML

Produce a `schema.yml` block (or an addition to the existing one) using this structure:

```yaml
version: 2

models:
  - name: <model_name>
    description: >
      <2-3 sentence description. Cover: what the model represents (grain), where the
      data comes from, any significant filtering or transformation applied, and what
      downstream use cases it supports.>

    columns:
      - name: <column_name>
        description: <what this column contains — be specific, not generic>
        tests:
          - <test>
          - <test>
```

### 4. Test selection rules

Apply tests using this logic — don't add a test unless it genuinely applies:

| Situation | Tests to add |
|---|---|
| Primary key (column named `*_id` that uniquely identifies a row) | `unique`, `not_null` |
| Foreign key (column named `*_id` that references another model/source) | `not_null`, `relationships` |
| Any other required/non-nullable column | `not_null` |
| Column with a known fixed set of values (status, type, role, position, severity) | `accepted_values` — list the actual values |
| Numeric column that should always be positive (counts, amounts, durations) | none by default unless business logic demands it |

For `relationships` tests, use the correct `to:` reference:
- Source table: `to: source('schema_name', 'table_name')`
- dbt model: `to: ref('model_name')`

### 5. Output format

- Output ONLY the YAML block — no explanation, no markdown fences, no preamble.
- Indent with 2 spaces throughout.
- Wrap long descriptions with `>` (block scalar) for readability.
- Column descriptions should be specific to this model's context, not generic. "Unique identifier for the player" is better than "ID column".
- If you're unsure of an `accepted_values` list, omit that test rather than guessing.

$ARGUMENTS
