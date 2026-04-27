# world-builder plugin

The Studio World Builder agent team as a Claude Code plugin. Codifies the navigator-driven six-step orchestration loop, the dispatch protocol that gates builder work behind founder approval, and the five rules that hold the line.

Published on the `world-builder-plugins` marketplace as `world-builder`.

## Phase 1 scope

Three-agent loop proof. Builds the smallest configuration that demonstrably runs the orchestration loop end-to-end on one milestone slice.

### Agents

| Agent | Role |
| --- | --- |
| `navigator` | End-to-end driver. Holds milestone state, runs the six-step loop, presents 1–3 numbered options every turn, dispatches through `/dispatch-worker`, appends to the dispatch log. Only agent with the `Agent` tool. |
| `canon-memory` | Strategy specialist for narrative inventory, canon entities, provenance, inspectable story truth. Reads `docs/agents/thoughts/canon-memory-thoughts.tsv` and `docs/agents/backlogs/canon-memory.md`; appends after producing analysis. |
| `api-engineer` | Builder for the Express API, Mongo collection logic, route contracts, validation rules, backend canonical/continuity behavior. Owns `apps/world-builder-api/` and `libs/`. |

Phase 2 adds `integration-engineer` and `app-engineer`. Phase 3 adds the remaining four. Until then the navigator handles step 5 (loop verification) itself.

### Skills

| Skill | Purpose |
| --- | --- |
| `/dispatch-worker` | Assemble the eight-field dispatch payload, validate against `docs/board/worker-dispatch-contract.md`, check `docs/board/approval-dispatch-log.md` for an open record on the same task fingerprint, and on success have the navigator spawn the right agents and append a dispatch record. Mirrors the `approve item N` / `defer all` / `reject item N` / `approve item N with conditions: <text>` command vocabulary from the existing `world-builder-approval-watch` Codex Automation. |

### Rules

| Rule | Always-on guidance |
| --- | --- |
| `approval-gate` | Navigator must verify a task is `approved` in `docs/board/founder-approval-queue.md` before invoking any builder. |
| `delivery-standard` | Branch names match `feat/m<N>-s<N>-<desc>`. Commit subjects start with `[M<N>:S<N>]`. PR titles carry `M<N> / S<N>:`. |
| `no-ai-attribution` | Absolute: no `Co-Authored-By: Claude`, no "Generated with Claude" footer, no robot emoji in any commit, PR, tag, or release note. |
| `story-first-priority` | When work competes, prefer canon memory > continuity governance > constrained storytelling > artifact proof. |
| `specialist-builder-boundary` | Strategy specialists define product truth; execution engineers implement; the boundary does not cross. |

### Hooks (Phase 1 minimum)

- **PostToolUse on `Bash`** — after branch creation or checkout, check `git branch --show-current` matches `feat/m<N>-s<N>-*` and warn on mismatch.
- **Stop** — prompt the navigator to check uncommitted state, dispatch log staleness, and approval queue freshness.

The PreToolUse owned-scope hook and the PostToolUse type-check hook land in Phase 2 when builders begin writing code through the plugin path in earnest.

## Naming convention

Plugin namespace: `world-builder:*` — for example `@world-builder:navigator`, `@world-builder:canon-memory`, `@world-builder:api-engineer`. The `studio-` prefix from the existing Codex skill names is dropped as redundant inside a project-scoped plugin namespace.

## Working directory

All hooks and skills assume the operator invokes Claude Code from a `world-builder` checkout root. Skills use `process.cwd()` rather than `${CLAUDE_PROJECT_DIR}` or `${PWD}` — the latter do not expand reliably across Claude Code hosts. The one exception is `settings.json` hooks, which Claude Code itself expands.

## Installation

Add to your world-builder `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "world-builder-plugins": {
      "source": {
        "source": "github",
        "repo": "studio-symmetries/world-builder-plugin"
      }
    }
  },
  "enabledPlugins": {
    "world-builder@world-builder-plugins": true
  }
}
```

Then restart Claude Code. `@world-builder:navigator`, the three agents, the `/dispatch-worker` skill, the five rules, and `CLAUDE.md` become available.

## Local development

While iterating on the plugin locally before publishing, point the marketplace at the local directory instead of the GitHub repo:

```json
{
  "extraKnownMarketplaces": {
    "world-builder-plugins": {
      "source": {
        "source": "directory",
        "path": "/Users/nileswhite/Studio/Code/Codebox/world-builder-plugin"
      }
    }
  },
  "enabledPlugins": {
    "world-builder@world-builder-plugins": true
  }
}
```

Claude Code's schema for a local marketplace uses `"source": "directory"` with a `"path"` pointing at the repo root (the directory that contains `marketplace.json`). `"source": "local"` is **not** valid and will produce a settings error.

## Phase roadmap

| Phase | Adds | Operating mode |
| --- | --- | --- |
| **Phase 1 — three-agent loop proof** | `navigator`, `canon-memory`, `api-engineer`, `/dispatch-worker`, the five rules, the two minimum hooks. | Operator drives the navigator interactively. The four `world-builder-*` Codex Automations and all 11 Codex skills run unchanged in parallel. |
| Phase 2 — integration, surface, heartbeat retarget | `integration-engineer`, `app-engineer`, the PreToolUse owned-scope hook, the PostToolUse type-check hook, retarget of the four Codex Automations to shell out to the navigator. | Heartbeat exists. `claude-code-team-automation.md` plan doc lands. |
| Phase 3 — full roster + Codex cleanup | `storytelling-workflow`, `publishing-proof`, `ai-engineer`, `publishing-engineer`. Removal of deprecated Codex skills after two clean weeks. | Full roster running through the plugin path. |

## Distribution notes

Hard-won lessons from the matey-crew-plugin precedent:

- Plugin lives in a **dedicated repo**, separate from the application code it serves. The world-builder Nx monorepo cannot host this plugin directly — Claude Code's `git-subdir` loader does not resolve a marketplace manifest that self-references its containing repo, and plugin versions must move independently of the application's release cycle.
- `marketplace.json` sits at repo root. Plugin content under `packages/plugin/`. The marketplace's `source.path` is `./packages/plugin`.
- No `mcpServers` in v0.1. Thought logs and per-specialist backlogs stay file-based at `docs/agents/thoughts/` and `docs/agents/backlogs/` in the world-builder repo. When trf or another memory MCP becomes load-bearing, add it to `plugin.json` — not to a separate `.mcp.json` file.
- `${CLAUDE_PROJECT_DIR}` and `${PWD}` do not expand reliably across Claude Code hosts in skill bodies. Skills assume Claude Code spawns them from the world-builder checkout root and use `process.cwd()`. Hook command strings in `settings.json` are the documented exception — those expand `${CLAUDE_PROJECT_DIR}` correctly.
- **Plugin content changes require a version bump.** Claude Code's marketplace cache is version-keyed; editing `rules/`, `skills/`, `agents/`, or `CLAUDE.md` without bumping `plugin.json` and `marketplace.json` in lockstep leaves clients loading stale content from cache indefinitely.

## License

MIT
