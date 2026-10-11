---
name: dispatch-worker
description: Assemble and validate the eight-field dispatch payload for a world-builder task, check the dispatch log for an open record on the same task fingerprint, and return navigator directives for the top-level session to execute. Mirrors the approval-watch command vocabulary.
---

# Dispatch Worker

Bridges "founder approved" and "agents start working." The single highest-value skill in the plugin — the eight required payload fields are easy to miss when assembled by hand, and the dispatch log idempotency check is the load-bearing protection against re-dispatching the same task twice.

This skill is invoked by the navigator when the operator picks an option that would launch builder work. It is also invocable directly when the operator wants to construct a dispatch packet without the full navigator turn.

## Invocation

```text
/dispatch-worker <command>
```

The command vocabulary mirrors the existing `world-builder-approval-watch` Codex Automation so that the Phase 2 retarget hands off cleanly. Supported commands:

- `approve item N` — dispatch the Nth approval-queue item with the standard payload
- `approve item N with conditions: <text>` — dispatch with the additional `conditions` constraint appended to the payload's `Constraints` field
- `defer all` — record a deferral line in the dispatch log; do not dispatch anything
- `reject item N` — record a rejection line in the dispatch log; do not dispatch anything

If the user invokes without a command, ask which command before proceeding.

## Working directory

The skill operates against `process.cwd()` and assumes the operator invoked Claude Code from a `world-builder` checkout root. It does not resolve `${CLAUDE_PROJECT_DIR}` or `${PWD}` — those do not expand reliably across Claude Code hosts.

Confirm the working tree is a world-builder checkout before any state read:

- `docs/board/founder-approval-queue.md` exists
- `docs/board/approval-dispatch-log.md` exists
- `docs/board/worker-dispatch-contract.md` exists

If any of these is missing, stop and report — the operator invoked from the wrong directory.

## The eight required fields

Every dispatch payload contains all eight, in this order:

1. **Milestone** — `M<N>` from the approval-queue item
2. **Approved Task** — the slice descriptor, `M<N> / S<N>: <title>`
3. **Owning Specialist** — the current strategy specialist responsible for the product truth: `canon-memory`, `continuity-governance`, `business-strategist`, `marketing-strategist`, `product-strategist`, or `ai-thinker`.
4. **Execution Team** — the current engineer or engineers that will implement: `api-engineer`, `app-engineer`, or both.
5. **Proof Artifact** — the concrete deliverable, almost always a PR titled `M<N> / S<N>: <subject>`
6. **Constraints** — must-not-violate conditions: scope boundaries, performance budgets, schema commitments, anything the operator added via `with conditions: <text>`
7. **Acceptance Gate** — the verification step that closes the loop, e.g., "integration-engineer verdict on the API/UI contract" once Phase 2 lands; in Phase 1 the navigator runs this step itself
8. **Required First Checkpoint** — the first thing the dispatched agents must produce before continuing — typically the contract sharpened by the specialist, before the engineer writes code

A payload with any field empty or marked `tbd` is invalid and must not be dispatched.

The planned roles `storytelling-workflow`, `publishing-proof`, `ai-engineer`, `publishing-engineer`, and `integration-engineer` are not implemented in this candidate. If a payload requires any unavailable role, stop and surface that dependency; do not substitute another role or dispatch a nonexistent agent. Naming a current role here does not approve a task or expand its scope.

## Optional model override

The dispatch payload may carry a `model` hint that overrides the agent's default model:

```yaml
model: opus
```

or, equivalently:

```yaml
task_complexity: deep
```

When present, the navigator includes the override in its directive; the top-level session passes it into the actual `Agent({subagent_type: ..., model: ...})` call. The navigator does not invoke Agent from its subagent context. A model hint does not change approval, scope or checkpoint requirements.

In Phase 1 the only Sonnet-default agent is `canon-memory`. Adding `model: opus` to a `canon-memory` invocation is the canonical reason to use the override. The other Phase 1 agent (`api-engineer`) defaults to Opus already.

## Validation procedure

Before dispatching:

### 1. Resolve the approval-queue item

Read `docs/board/founder-approval-queue.md`. Find item `N` from the command. If `N` is out of range or the item is not in `approved` status, stop and report.

### 2. Confirm milestone alignment

The approval-queue item must declare a milestone slice (`M<N> / S<N>`). If it does not, the queue is malformed — surface this back to the operator rather than guess.

### 3. Assemble the eight fields

Pull each field from the approval-queue item plus the dispatch contract template at `docs/board/worker-dispatch-contract.md`. For `approve item N with conditions: <text>`, append `<text>` to the `Constraints` field with a `;` plus space as separator after the existing constraints.

### 4. Resolve or generate the Assignment Artifact

Read the approval-queue item for an existing Assignment Artifact reference. If one is named (a path to `docs/board/...-assignment-packet.md`), use that path verbatim — the operator already curated it.

If no packet is referenced, generate a minimal one at `docs/board/<YYYY-MM-DD>-<fingerprint>-assignment-packet.md`. The generated packet should contain:

- the assembled eight-field payload from step 3, in a `## Dispatch Payload` section
- a one-paragraph slice context lifted from the queue item's "why this is the next task" or equivalent section
- a `## Required First Output` section reflecting the payload's Required First Checkpoint
- a `## Constraints` section reflecting the payload's Constraints

The generated packet is the operator's to refine — the skill writes a workable starting shape, not a final document. Existing assignment packets in `docs/board/` (for example `2026-04-22-slice-1-assignment-packet.md`) are the reference for tone and depth when refining.

The dispatch record's Assignment Artifact field will link to whichever path resolves here.

### 5. Check the dispatch log for an active record on the same task fingerprint

The task fingerprint is the canonical hyphenated form of the Approved Task slice descriptor (e.g., `m1-s1-inventory-contract-checkpoint`, `m1-s1-provenance-wiring`). Read `docs/board/approval-dispatch-log.md` and grep for the fingerprint.

If a record exists with `Worker Status` in any active state (`proposed`, `approved`, `dispatched`, `in progress`, `checkpoint returned`), **stop and report**. Idempotency is non-negotiable. The operator must explicitly mark the prior record `blocked`, `closed` (operator extension), or `superseded` (operator extension) before a new dispatch can land on the same fingerprint.

If a record exists with `Worker Status: blocked`, surface it to the operator and ask whether to supersede or pick a different task — do not silently re-dispatch.

### 6. Validate the payload

If any of the eight payload fields is empty, ambiguous, or `tbd`, stop and ask the operator to clarify. Do not silently fill defaults.

### 7. Compare the payload with the approved selection

Apply `rules/payload-preview-skip.md` only after the approval-queue and dispatch-log checks above pass. If the operator's selection and all eight resolved fields match the approved queue item with no scope or constraint drift, return the dispatch directive without a second confirmation. Compare Owning Specialist, Execution Team, Constraints, Acceptance Gate, Required First Checkpoint and Proof Artifact explicitly; milestone and task must still match step 2. This does not waive later checkpoint, push or merge approvals.

If any field is unresolved, stop at step 6. If any scope or constraint has drifted (including `with conditions`), print the assembled payload and require explicit confirmation before returning a directive:

```yaml
---
Milestone: M1
Approved Task: M1 / S1: provenance wiring for inventory output
Owning Specialist: canon-memory
Execution Team: api-engineer
Proof Artifact: PR titled "M1 / S1: provenance wiring for inventory output"
Constraints: do not change inventory output schema; preserve existing route paths; no migration this slice
Acceptance Gate: navigator verifies the PR diff matches the sharpened contract before the operator merges
Required First Checkpoint: canon-memory delivers the provenance contract sharpening (fields, source attribution, confidence shape) before api-engineer starts
---
```

Ask: "Dispatch this payload? (yes / edit / cancel)"

For a drifted payload, do not proceed without an affirmative. A rejected or deferred queue item cannot become dispatchable by skipping the preview.

## Dispatch — what the navigator does on confirm

After the unchanged approved selection, or explicit confirmation of a drifted payload:

The navigator returns directives; the top-level Claude Code session executes actual Agent calls. Do not assume the navigator can spawn agents when it is itself a subagent. Follow the narrow `rules/ci-test-infra-fix-lane.md` exception only for its qualifying work; otherwise use this full cadence.

1. The navigator returns a directive for the Owning Specialist; the top-level session calls `Agent({subagent_type: "<specialist>"})` with the payload as input. If the payload carries a `model` override, pass it to the call.
2. When the specialist returns the Required First Checkpoint output, the navigator surfaces it to the operator and asks for green light to proceed.
3. On green light, the navigator returns Execution Team directives. The top-level session invokes each member in turn (or in parallel when the dispatch payload says so) with the sharpened contract as input.
4. The navigator runs the Acceptance Gate — in Phase 1 by reading the produced diff and verifying alignment with the sharpened contract. Phase 2 delegates this step to `integration-engineer`.
5. On gate success, the navigator appends a record to `docs/board/approval-dispatch-log.md`. On gate failure, the navigator surfaces the failure and presents the operator with options.

## Dispatch log record shape

The shape matches the existing world-builder convention in `docs/board/approval-dispatch-log.md`. Append-only. One record per dispatch. The next record number (`Record N`) is one greater than the highest existing record number in the log.

```text
### Record N

Task Fingerprint:

- `<canonical-fingerprint>`

Approved At:

- `<YYYY-MM-DD HH:MM:SS TZ>`

Task:

- `<approved task title>`

Source Automation:

- `world-builder:navigator (manual via /dispatch-worker)`

Assignment Artifact:

- [`<filename>.md`](./<filename>.md)

Dispatch Target:

- `<owning-specialist>`
- `<execution-engineer>`

Worker Thread:

- `<thread-id or human-readable description of the dispatch context>`

Worker Status:

- `dispatched`

Conditions:

- `<condition 1 from payload Constraints>`
- `<condition 2>`
```

### Worker Status vocabulary

The values match the existing world-builder convention. The navigator updates `Worker Status` as the dispatch progresses:

- `proposed` — task surfaced but not yet approved
- `approved` — operator approved, dispatch pending
- `dispatched` — agents launched (the navigator writes this when the record is appended)
- `in progress` — engineer is implementing
- `checkpoint returned` — first checkpoint delivered (e.g., specialist returned the sharpened contract)
- `blocked` — work stalled; operator must clear the block before re-dispatch
- `deferred` — extension for `/dispatch-worker defer all` paths
- `rejected` — extension for `/dispatch-worker reject item N` paths

The operator may also extend with `closed` (work fully landed and dispatch is done) or `superseded` (a later record replaces this one) when curating the log by hand. The navigator does not write those values automatically.

### Source Automation values

- `world-builder:navigator (manual via /dispatch-worker)` — operator-driven dispatch through the navigator and this skill
- `world-builder:navigator (via <automation-name>)` — Phase 2 retargeted Codex Automation invoking the navigator (e.g., `world-builder:navigator (via world-builder-approval-watch)`)
- One of the four legacy Codex Automation names for records created before the plugin was wired:
  - `world-builder-approval-watch`
  - `world-builder-board`
  - `world-builder-chief-of-staff`
  - `world-builder-work-activity-watch`

### Idempotency rule

A re-dispatch attempt against an existing record is blocked when `Worker Status` is in any active state (`proposed`, `approved`, `dispatched`, `in progress`, `checkpoint returned`). It is also blocked when `Worker Status: blocked` — the operator must clear the block first.

Re-dispatch is allowed when no record exists for the fingerprint, or when the existing record's `Worker Status` is a terminal state the operator has set (`closed`, `superseded`, `deferred`, `rejected`).

This is the load-bearing protection. Phase 1 success criteria explicitly call for at least one verified idempotency catch.

## On `defer all`

Append a deferral record in the same shape, with `Worker Status: deferred`:

```text
### Record N

Task Fingerprint:

- `defer-all-<YYYY-MM-DD-HHMM>`

Approved At:

- `<YYYY-MM-DD HH:MM:SS TZ>`

Task:

- `Operator deferred all current approval-queue items`

Source Automation:

- `world-builder:navigator (manual via /dispatch-worker)`

Assignment Artifact:

- `none`

Dispatch Target:

- `none`

Worker Thread:

- `none`

Worker Status:

- `deferred`

Conditions:

- `<reason if operator gave one, otherwise "no reason given">`
```

Do not dispatch anything. Do not modify `docs/board/founder-approval-queue.md` — that edit is the operator's.

## On `reject item N`

Append a rejection record in the same shape, with `Worker Status: rejected`:

```text
### Record N

Task Fingerprint:

- `reject:<canonical-fingerprint>`

Approved At:

- `<YYYY-MM-DD HH:MM:SS TZ>`

Task:

- `<approved task title>`

Source Automation:

- `world-builder:navigator (manual via /dispatch-worker)`

Assignment Artifact:

- `none`

Dispatch Target:

- `none`

Worker Thread:

- `none`

Worker Status:

- `rejected`

Conditions:

- `<reason if operator gave one, otherwise "no reason given">`
```

Do not dispatch anything. The approval-queue item should be moved out of `approved` by a separate edit to `docs/board/founder-approval-queue.md` — that edit is the operator's, not the skill's.

## Failure handling

- **Validation failure (any of the eight fields empty / ambiguous)**: stop, surface the missing field, ask the operator to clarify or amend the queue item.
- **Idempotency conflict (open record exists for the same fingerprint)**: stop, print the existing record, ask the operator to close, supersede, or pick a different task.
- **Specialist returns a contract that conflicts with the approval-queue item**: stop after the Required First Checkpoint, surface the conflict, ask the operator whether to update the queue item or re-invoke the specialist with sharpened constraints.
- **Engineer's proof artifact does not match the sharpened contract**: dispatch log gets `acceptance-gate: failed` in the notes, the operator decides whether to re-invoke or re-scope.

## Notes

- This skill does **not** edit `docs/board/founder-approval-queue.md`. The queue is the operator's surface; status changes are the operator's edits.
- The dispatch log is markdown today. The "remaining open question" in the proposal flagged that JSON / YAML may become necessary as volume grows; that is a Phase 2-or-later concern.
- The skill does **not** push commits, open PRs, or merge anything. It assembles, validates, dispatches, and records. Mutations to git remotes are the engineers' work, gated by the operator's explicit approval at each push step.
