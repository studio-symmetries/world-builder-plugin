# world-builder plugin

Codifies the Studio World Builder agent team as Claude Code agents, skills, and rules. This plugin runs against a `world-builder` checkout and operates on the caller's working tree via `process.cwd()`.

Published as `world-builder` on the `world-builder-plugins` marketplace (repo: `studio-symmetries/world-builder-plugin`).

## What's loaded

### Phase 1 agents

- `@world-builder:navigator` — end-to-end driver, only agent with the `Agent` tool. Holds milestone state, runs the six-step orchestration loop, presents 1–3 numbered options every turn, dispatches through `/dispatch-worker`, appends to the dispatch log.
- `@world-builder:canon-memory` — strategy specialist for narrative inventory, canon entities, provenance, inspectable story truth.
- `@world-builder:api-engineer` — builder for the Express API, Mongo collection logic, route contracts, validation rules, backend canonical/continuity behavior.

Phase 2 adds `integration-engineer` and `app-engineer`. Phase 3 adds the remaining four. Until then the navigator handles step 5 of the loop (cross-surface verification) itself.

### Skills

- `/dispatch-worker` — assemble the eight-field dispatch payload, validate against `docs/board/worker-dispatch-contract.md`, check `docs/board/approval-dispatch-log.md` for an open dispatch on the same task fingerprint, and on success have the navigator spawn the right agents and append a dispatch record. Mirrors the approval-watch command vocabulary.

### Rules (always-on)

- `approval-gate` — navigator must verify a task is `approved` before invoking any builder
- `delivery-standard` — branch / commit / PR conventions for milestone-scoped work
- `no-ai-attribution` — absolute: no `Co-Authored-By: Claude`, no "Generated with Claude" footer, no robot emoji in any authored content
- `story-first-priority` — when work competes, prefer canon memory > continuity governance > constrained storytelling > artifact proof
- `specialist-builder-boundary` — strategy specialists define product truth; execution engineers implement; the boundary does not cross

### Hooks

- PostToolUse on `Bash` — branch-name check after checkout / branch creation
- Stop — handoff prompt (uncommitted state, dispatch log staleness, approval queue freshness)

## Ground truth

The world-builder governance system lives at:

```bash
docs/board/founder-approval-queue.md         # human-facing approval surface
docs/board/approval-dispatch-log.md          # dispatch idempotency record (append-only)
docs/board/worker-dispatch-contract.md       # the eight required fields
docs/board/team-delivery-standard.md         # branch / commit / PR conventions
docs/agents/thoughts/<specialist>-thoughts.tsv
docs/agents/backlogs/<specialist>.md
docs/plans/claude-code-team/                 # this plan triple
```

The navigator reads the first three on every turn before responding. The strategy specialists each read their own thought log and backlog at invocation start.

## Working directory

All skills and agents assume the operator invokes Claude Code from a world-builder checkout root. Skills use `process.cwd()` rather than `${CLAUDE_PROJECT_DIR}` or `${PWD}` in their bodies — the latter do not expand reliably across Claude Code hosts. Hook command strings in `settings.json` are the documented exception, since Claude Code itself expands `${CLAUDE_PROJECT_DIR}` for those.

## Naming convention

- Plugin namespace `world-builder:*` for agent invocations
- Branch names `feat/m<N>-s<N>-<desc>`
- Commit subjects `[M<N>:S<N>] <subject>`
- PR titles `M<N> / S<N>: <subject>`

The `studio-` prefix from the existing Codex skill names is dropped as redundant inside a project-scoped plugin namespace.

## Phase 1 boundaries

The first deliverable is not a 10-agent system. It is a 3-agent system where the loop demonstrably works.

What Phase 1 explicitly does **not** ship:

- The other six agents (`integration-engineer`, `app-engineer`, `continuity-governance`, `storytelling-workflow`, `publishing-proof`, `ai-engineer`, `publishing-engineer`)
- Codex skill deprecation — all 11 Codex skills remain installed and usable
- Codex Automation retargeting — the four `~/.codex/automations/world-builder-*` cron jobs continue to run unchanged
- The PreToolUse owned-scope hook (Phase 2)
- The PostToolUse type-check hook (Phase 2)
- The `milestone-check` and `integration-verify` skills (Phase 2 / 3)
- Any MCP wiring

If a session's work falls outside Phase 1 scope, run it through the existing Codex skills directly — that path stays open until Phase 3 ships and the deprecated skills are removed.
