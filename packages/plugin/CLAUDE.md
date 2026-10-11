# world-builder plugin

Codifies the Studio World Builder agent team as Claude Code agents, skills, and rules. This plugin runs against a `world-builder` checkout and operates on the caller's working tree via `process.cwd()`.

Published as `world-builder` on the `world-builder-plugins` marketplace (repo: `studio-symmetries/world-builder-plugin`).

## What's loaded

### Wired agents (through v0.1.4)

- `@world-builder:navigator` — end-to-end decision-maker. Holds milestone state, runs the orchestration loop, presents 1–3 numbered options every turn, returns dispatch directives that the top-level session executes, appends to the dispatch log.

Story-truth specialists:

- `@world-builder:canon-memory` — strategy specialist for narrative inventory, canon entities, provenance, inspectable story truth.
- `@world-builder:continuity-governance` — strategy specialist for narrative validation, issue taxonomies, severity rules, structural validation, publish gating.

Cross-functional strategy specialists (added v0.1.4 for v2 surface deliberation and feature-inclusion gating):

- `@world-builder:business-strategist` — positioning, audience, market fit, competitive thinking, monetization shape.
- `@world-builder:marketing-strategist` — voice, tone, microcopy register, naming, content strategy, audience comms.
- `@world-builder:product-strategist` — feature prioritization, MVP scoping, the v2 inclusion gate that decides which engineer-shipped functionality surfaces in the redesigned UI.
- `@world-builder:ai-thinker` — AI trend awareness, durable patterns vs fad patterns, anticipatory architecture for the AI surface.

Execution engineers:

- `@world-builder:api-engineer` — builder for the Express API, Mongo collection logic, route contracts, validation rules, backend canonical/continuity behavior. Owns `apps/world-builder-api/` and `libs/`.
- `@world-builder:app-engineer` — builder for product surfaces. Owns `apps/world-builder-ui/`. Turns backend truth into usable product behavior.

Phase 2 adds `integration-engineer` (cross-surface verifier — navigator handles step 5 itself until then). Phase 3 adds `storytelling-workflow`, `publishing-proof` (specialists), `ai-engineer`, `publishing-engineer` (engineers).

### Operating model — brain / hand

The navigator runs as a Claude Code subagent. Claude Code's runtime gates the `Agent` tool to top-level orchestrators only — even though the navigator's frontmatter declares it, **the navigator cannot call `Agent` at runtime when invoked as a subagent**.

The plugin's actual operating model is:

- **Navigator is the brain.** Reads state, presents options, makes decisions, judges results, returns dispatch directives.
- **The top-level Claude Code session is the hand.** Reads the navigator's directives and executes the actual `Agent({subagent_type: ..., prompt: ..., ...})` calls.
- **The operator stays in the loop** — the top-level surfaces navigator-options-then-pick at every transition, so dispatches happen on operator approval.

When the navigator's prompt or this doc says "the navigator dispatches," read that as "the navigator returns a dispatch directive that the top-level session executes." The dispatch chain works; it is just split across two contexts.

### Skills

- `/dispatch-worker` — assemble the eight-field dispatch payload, validate against `docs/board/worker-dispatch-contract.md`, check `docs/board/approval-dispatch-log.md` for an open dispatch on the same task fingerprint, and return navigator directives for the top-level session to execute. Mirrors the approval-watch command vocabulary.

### Rules (always-on)

Phase 1 rules:

- `approval-gate` — navigator must verify a task is `approved` before invoking any builder
- `delivery-standard` — branch / commit / PR conventions for milestone-scoped work
- `no-ai-attribution` — absolute: no `Co-Authored-By: Claude`, no "Generated with Claude" footer, no robot emoji in any authored content
- `story-first-priority` — when work competes, prefer canon memory > continuity governance > constrained storytelling > artifact proof
- `specialist-builder-boundary` — strategy specialists define product truth; execution engineers implement; the boundary does not cross

Phase 1.7 cadence rules (added 2026-04-27 from cadence reflection):

- `closing-notes-bundle` — fold a dispatch's closing note into the next dispatch's docs trail PR, not a separate closing-notes PR per dispatch
- `payload-preview-skip` — `/dispatch-worker` auto-fires when the assembled payload matches the approved queue row exactly with no scope or constraint drift; preview only shows on drift
- `ci-test-infra-fix-lane` — trivial test-infra fixes (test-support, `*.int.test.ts`, jest/playwright config) run a fast-path: no specialist sharpening, single dispatch record, single PR

### Hooks

- PostToolUse on `Bash` — branch-name check after checkout / branch creation (Phase 1)
- Stop — handoff prompt (Phase 1)
- PreToolUse on `Edit|Write` — owned-scope check, currently scoped to `apps/world-builder-ui/` for app-engineer's lane (Phase 1.7; broadens across all builder lanes in Phase 2)

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
- Branch names `feat/m<N>-s<N>-<desc>` (also `fix/`, `docs/`, `chore/`)
- Commit subjects `[M<N>:S<N>] <subject>`
- PR titles `M<N> / S<N>: <subject>`

The `studio-` prefix from the existing Codex skill names is dropped as redundant inside a project-scoped plugin namespace.

## Branch and deploy flow

Three-trunk flow. Feature branches off `preview`, PRs against `preview`, never directly to `main`.

```text
feat/m<N>-s<N>-<desc>  →  preview  →  main
                          (via PR)    (separate periodic PR)
```

Vercel domain mapping:

- `main` → `www.friendoftilly.com` (production)
- `preview` → `preview.friendoftilly.com` (staging)
- feature branch → auto-generated `world-builder-ui-pr-<N>.vercel.app`; can be aliased to `review.friendoftilly.com` via `npx vercel alias <deployment-url> review.friendoftilly.com`

When the navigator dispatches builder work, the PR opened by the dispatched engineer must target `preview`, not `main`. The `delivery-standard` rule enforces this. A PR opened against `main` is a violation — re-target with `gh pr edit <N> --base preview` before merge.

## Wired-roster boundaries

The v0.1.4 candidate contains nine agent definitions: navigator, six strategy specialists, and two execution engineers. The additional Phase 2/3 roles listed below are not implemented. File presence does not establish successful runtime loading.

What is **not** yet shipped:

- `integration-engineer` (Phase 2 — cross-surface verification stays inline in the navigator until then)
- `ai-engineer`, `publishing-engineer` (Phase 3 engineers)
- `storytelling-workflow`, `publishing-proof` (Phase 3 specialists)
- Codex skill deprecation — all 11 Codex skills remain installed and usable
- Codex Automation retargeting — the four `~/.codex/automations/world-builder-*` cron jobs continue to run unchanged (Phase 2)
- Generalized PreToolUse owned-scope hook for all builders — Phase 1.7 ships it scoped to `apps/world-builder-ui/` only; Phase 2 broadens it
- The PostToolUse type-check hook (Phase 2)
- The `milestone-check` and `integration-verify` skills (Phase 2 / 3)
- Any MCP wiring

If a session's work needs an unwired agent, the navigator surfaces the gap explicitly. Two recovery paths: (a) invoke the corresponding Codex skill at `~/.codex/skills/studio-world-builder-<name>/SKILL.md` directly, outside the navigator loop; (b) operator-override the navigator's owned-write boundary for genuinely mechanical edits, with the override logged in the dispatch record.
