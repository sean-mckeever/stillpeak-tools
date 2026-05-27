# stillpeak-tools

Curated AI tools for analytics and data teams — organized by process node, filterable by role.

Every process node has at least one forever-free option. First-party Stillpeak tools are always free.

## Registry

All tools (first-party and third-party) are catalogued in [`registry.yaml`](registry.yaml). The Stillpeak website reads this file to power the tools marketplace pages.

### Schema

| Field | Description |
|---|---|
| `id` | Unique kebab-case identifier |
| `name` | Display name |
| `developer` | Company or individual |
| `category` | Process node: `planning`, `reviewing`, `prioritizing`, `analyzing`, `documenting`, etc. |
| `type` | Tool format: `cli`, `mcp`, `slash-command` |
| `description` | What it does and why it exists |
| `pricing` | `free`, `freemium`, or `paid` |
| `install` | One-line install command |
| `repo` | Source repository URL |
| `docs` | Documentation URL (if separate from repo) |
| `roles` | Roles this tool is relevant to |
| `stillpeak_endorsed` | Whether Stillpeak recommends this tool |
| `stillpeak_free_alternative` | ID of the free Stillpeak alternative (if any) |

## First-party tools

| Tool | Category | Type | Install |
|---|---|---|---|
| [StillPlan](tools/planning/stillplan/) | Planning | Slash command | See tool README |

## Adding a tool to the registry

Edit `registry.yaml` and open a PR (or push directly if you're Sean).
