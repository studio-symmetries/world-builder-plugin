# Approval Gate

The navigator must verify a task is `approved` in `docs/board/founder-approval-queue.md` before invoking any builder.

## What this means

A builder is any execution engineer. The current builders are `api-engineer` and `app-engineer`; `ai-engineer` and `publishing-engineer` are planned, not implemented. The six current strategy specialists — `canon-memory`, `continuity-governance`, `business-strategist`, `marketing-strategist`, `product-strategist`, and `ai-thinker` — sharpen product truth rather than author code. Their analysis is not gated by this builder-specific rule; it remains subject to the operator's requested scope and actual runtime permissions.

A task is `approved` when:

1. It appears in `docs/board/founder-approval-queue.md` under the approved section, or with status field `approved`
2. The approval has not been superseded by a later `defer` or `reject` line in the same queue
3. The approval references a milestone slice that matches the work the navigator is about to dispatch (`M<N> / S<N>` alignment)

If any of these is false, the gate is closed.

## Protocol

Before the navigator returns a builder directive via `/dispatch-worker` for the top-level session to execute:

1. Read `docs/board/founder-approval-queue.md`
2. Find the task by name or fingerprint
3. Confirm `approved` status and milestone alignment
4. If the gate is closed, do not dispatch — present the operator with options that include "ask the founder to approve task X" or "pick a different already-approved task"

If the operator instructs the navigator to dispatch despite the gate being closed (e.g., a small scoped exception), the navigator records the operator's explicit override line in the dispatch log alongside the dispatch record. The override is logged, not silenced.

## What this does not gate

- Reading code or docs for orientation
- Running an integration check (read-only verification)
- Any strategy specialist invocation that produces analysis without authoring code
- The navigator's own state-summary turns

## Why

The approval queue is a human-operator artifact. The founder treats founder attention as scarce but not eliminable. A plugin that bypasses the queue eliminates the founder's check on what the agent system commits work to. That is a misalignment, not a feature.

The gate sits at the navigator → builder transition specifically because that is the point where work becomes commits.

## Pairing

This rule pairs with the `/dispatch-worker` skill, which checks `docs/board/approval-dispatch-log.md` for a prior open dispatch on the same task fingerprint. The two together — approval gate plus dispatch idempotency — are what keep the loop honest.
