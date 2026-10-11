# world-builder plugin

The Studio World Builder agent team as a Claude Code plugin. Codifies the navigator-driven six-step orchestration loop, the dispatch protocol that gates builder work behind founder approval, and eight governing rules.

Published on the `world-builder-plugins` marketplace as `world-builder`.

## Wired-agent scope (through v0.1.4)

Nine-agent loop. Phase 1 proved the chain (navigator → canon-memory → api-engineer); Phase 1.5 added `continuity-governance`; Phase 1.7 added `app-engineer`; v0.1.4 adds four cross-functional strategy specialists (`business-strategist`, `marketing-strategist`, `product-strategist`, `ai-thinker`) for v2 surface deliberation and feature-inclusion gating.

### Agents

| Agent | Role |
| --- | --- |
| `navigator` | End-to-end decision-maker. Holds milestone state, runs the orchestration loop, presents 1–3 numbered options every turn, returns dispatch directives, appends to the dispatch log. |
| `canon-memory` | Story-truth specialist for narrative inventory, canon entities, provenance, inspectable story truth. |
| `continuity-governance` | Story-truth specialist for narrative validation, issue taxonomies, severity rules, structural validation, publish gating. |
| `business-strategist` | Cross-functional strategy: positioning, audience, market fit, competitive thinking, monetization shape. |
| `marketing-strategist` | Cross-functional strategy: voice, tone, microcopy register, naming, content strategy, audience comms. |
| `product-strategist` | Cross-functional strategy: feature prioritization, MVP scoping, the v2 inclusion gate. |
| `ai-thinker` | Cross-functional strategy: AI trend awareness, durable patterns vs fad patterns, anticipatory architecture for the AI surface. |
| `api-engineer` | Builder for the Express API, Mongo, route contracts, validation rules. Owns `apps/world-builder-api/` and `libs/`. |
| `app-engineer` | Builder for product surfaces. Owns `apps/world-builder-ui/`. Turns backend truth into usable product behavior. |

All specialists read their own `docs/agents/thoughts/<name>-thoughts.tsv` and `docs/agents/backlogs/<name>-backlog.md` at invocation start, and append after producing analysis.

Phase 2 adds `integration-engineer` (cross-surface verifier — navigator handles step 5 itself until then). Phase 3 adds `storytelling-workflow`, `publishing-proof` (specialists), `ai-engineer`, `publishing-engineer` (engineers).

### Operating model — brain / hand

Claude Code's runtime gates the `Agent` tool to top-level orchestrators. The navigator runs as a Claude Code subagent and **does not have `Agent` at runtime** despite declaring it in frontmatter. The plugin's working model splits dispatch across two contexts:

- **Navigator (brain).** State-read, decision, option-surface, judgment, dispatch-log appends. Returns dispatch directives — structured blocks naming the agent to spawn and the prompt to pass it.
- **Top-level Claude Code session (hand).** Reads the navigator's directives, runs the actual `Agent({subagent_type: "world-builder:<agent>", prompt: ..., ...})` calls, captures results, reinvokes the navigator with the result as input.
- **Operator (driver).** Picks between the navigator's numbered options at every transition; the top-level executes only after a pick.

This is a real architectural constraint, not a workaround — the runtime enforces it for all plugin agents. v0.1.2 acknowledges it in the navigator's prompt and the docs; the chain works correctly within this split.

### Skills

| Skill | Purpose |
| --- | --- |
| `/dispatch-worker` | Assemble the eight-field dispatch payload, validate against `docs/board/worker-dispatch-contract.md`, check `docs/board/approval-dispatch-log.md` for an open record on the same task fingerprint, and on success have the navigator spawn the right agents and append a dispatch record. Mirrors the `approve item N` / `defer all` / `reject item N` / `approve item N with conditions: <text>` command vocabulary from the existing `world-builder-approval-watch` Codex Automation. |

### Rules

| Rule | Always-on guidance | Phase |
| --- | --- | --- |
| `approval-gate` | Navigator must verify a task is `approved` in `docs/board/founder-approval-queue.md` before invoking any builder. | 1 |
| `delivery-standard` | Branch names match `feat/m<N>-s<N>-<desc>`. Commit subjects start with `[M<N>:S<N>]`. PR titles carry `M<N> / S<N>:`. | 1 |
| `no-ai-attribution` | Absolute: no `Co-Authored-By: Claude`, no "Generated with Claude" footer, no robot emoji in any commit, PR, tag, or release note. | 1 |
| `story-first-priority` | When work competes, prefer canon memory > continuity governance > constrained storytelling > artifact proof. | 1 |
| `specialist-builder-boundary` | Strategy specialists define product truth; execution engineers implement; the boundary does not cross. | 1 |
| `closing-notes-bundle` | When a dispatch ships, fold its closing note into the NEXT dispatch's docs trail PR rather than opening a separate closing-notes PR per dispatch. | 1.7 |
| `payload-preview-skip` | `/dispatch-worker` auto-fires when the assembled payload matches the approved queue row exactly with no scope or constraint drift; preview only shows on drift. | 1.7 |
| `ci-test-infra-fix-lane` | Trivial fixes confined to test-support, `*.int.test.ts`, jest/playwright config files run a fast-path: no specialist sharpening, single dispatch record covering full lifecycle, single PR. | 1.7 |

### Hooks

- **PostToolUse on `Bash`** (Phase 1) — after branch creation or checkout, check `git branch --show-current` matches `feat/m<N>-s<N>-*` and warn on mismatch.
- **Stop** (Phase 1) — prompt the navigator to check uncommitted state, dispatch log staleness, and approval queue freshness.
- **PreToolUse on `Edit|Write`** (Phase 1.7) — owned-scope check, currently scoped to `apps/world-builder-ui/`. Warns when an edit target is in app-engineer's lane so the operator can verify the dispatch context is correct (or that an override is logged). Phase 2 broadens this hook across all builder lanes.

The PostToolUse type-check hook lands in Phase 2 when builders run typecheck consistently through the plugin path.

## Naming convention

Plugin namespace: `world-builder:*` — for example `@world-builder:navigator`, `@world-builder:canon-memory`, `@world-builder:api-engineer`. The `studio-` prefix from the existing Codex skill names is dropped as redundant inside a project-scoped plugin namespace.

## Branch and deploy flow

The world-builder repo uses a three-trunk flow:

```text
feat/m<N>-s<N>-<desc>  →  preview  →  main
                          (via PR)    (separate periodic PR)
```

Feature branches off `preview`, open PRs against `preview` (never directly against `main`). The `preview → main` cut is a separate, periodic PR managed outside the plugin's dispatch flow.

Vercel domain mapping:

- **`main`** → `www.friendoftilly.com` (production)
- **`preview`** → `preview.friendoftilly.com` (staging — what reviewers see between feature merge and production cut)
- **feature branch** → auto-generated `world-builder-ui-pr-<N>.vercel.app`; can be aliased to `review.friendoftilly.com` for a stable operator-handoff URL via `npx vercel alias <deployment-url> review.friendoftilly.com` from `apps/world-builder-ui/`

The `delivery-standard` rule enforces feature PRs targeting `preview`. A feature PR accidentally opened against `main` should be re-targeted with `gh pr edit <N> --base preview` before merge.

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

Then restart Claude Code. The nine agents listed above (including `@world-builder:navigator`), the `/dispatch-worker` skill, eight rules, and `CLAUDE.md` become available. This describes the candidate's intended Claude Code loading behavior; it is not evidence of Symmetries Studio import or runtime validation.

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
| Phase 1 — three-agent loop proof | `navigator`, `canon-memory`, `api-engineer`, `/dispatch-worker`, the five Phase 1 rules, the PostToolUse Bash hook + Stop hook. | Operator drives the navigator interactively. Operator-override allowed for mechanical edits in unwired agent lanes; logged in dispatch record. |
| Phase 1.5 — continuity-governance + brain/hand prompt | `continuity-governance` specialist; navigator prompt rewritten to reflect that `Agent` is unavailable at runtime in subagents and the top-level session is the dispatch hand. | M1 Slice 2 (structural validation) runs plugin-native. |
| **Phase 1.7 — app-engineer + cadence rules** (current) | `app-engineer` builder; PreToolUse owned-scope hook scoped to `apps/world-builder-ui/`; three new cadence rules (`closing-notes-bundle`, `payload-preview-skip`, `ci-test-infra-fix-lane`). | M1 Slice 2 PR2 (PublishView wiring) and M1 Slice 3 (UI proof surfaces) run plugin-native. Cadence improvements save ~1 PR + ~1 turn per dispatch on substantive work; ~3 turns + 1 PR + 2 records per ci-test-infra-fix dispatch. |
| Phase 2 — integration and heartbeat retarget | `integration-engineer`; broadened PreToolUse owned-scope hook for all builders; PostToolUse type-check hook; retarget of the four Codex Automations to shell out to the navigator. | Heartbeat exists. `claude-code-team-automation.md` plan doc lands. |
| Phase 3 — full roster + Codex cleanup | `storytelling-workflow`, `publishing-proof`, `ai-engineer`, `publishing-engineer`. Removal of deprecated Codex skills after two clean weeks. | Full roster running through the plugin path. |

## Distribution notes

Hard-won lessons from the matey-crew-plugin precedent:

- Plugin lives in a **dedicated repo**, separate from the application code it serves. The world-builder Nx monorepo cannot host this plugin directly — Claude Code's `git-subdir` loader does not resolve a marketplace manifest that self-references its containing repo, and plugin versions must move independently of the application's release cycle.
- `marketplace.json` sits at `.claude-plugin/marketplace.json` (NOT at repo root). The plugin content lives under `packages/plugin/` with its own `.claude-plugin/plugin.json`. The marketplace's `source.path` is `./packages/plugin`. v0.1.0 had `marketplace.json` at repo root and the plugin's other agents failed to register as subagents — moving the manifest into `.claude-plugin/` was the v0.1.1 fix.
- **`Agent` tool is unavailable inside subagents at runtime.** Claude Code's runtime gates `Agent` to top-level orchestrators only, regardless of what the agent's frontmatter declares. Plugin agents that orchestrate other plugin agents must do so via dispatch directives that the top-level session executes — see the brain/hand operating model section above. The `world-builder:navigator` prompt was rewritten in v0.1.2 to reflect this.
- No `mcpServers` in v0.1. Thought logs and per-specialist backlogs stay file-based at `docs/agents/thoughts/` and `docs/agents/backlogs/` in the world-builder repo. When trf or another memory MCP becomes load-bearing, add it to `plugin.json` — not to a separate `.mcp.json` file.
- `${CLAUDE_PROJECT_DIR}` and `${PWD}` do not expand reliably across Claude Code hosts in skill bodies. Skills assume Claude Code spawns them from the world-builder checkout root and use `process.cwd()`. Hook command strings in `settings.json` are the documented exception — those expand `${CLAUDE_PROJECT_DIR}` correctly.
- **Plugin content changes require a version bump.** Claude Code's marketplace cache is version-keyed; editing `rules/`, `skills/`, `agents/`, or `CLAUDE.md` without bumping `plugin.json` and `marketplace.json` in lockstep leaves clients loading stale content from cache indefinitely.

## License

MIT
