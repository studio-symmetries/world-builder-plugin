# Closing Notes Bundle

When a dispatch ships, fold its closing note into the **next dispatch's docs trail PR** rather than opening a separate closing-notes PR per dispatch.

## What this means

A dispatch's lifecycle ends when its proof artifact (typically a code PR) merges. The closing note that captures the verdict — closing commit SHA, surface verification, carry-forward caveats, status advance from `checkpoint returned` → `closed` — is recorded in `docs/board/approval-dispatch-log.md`.

Without this rule, each dispatch produces three PRs:
1. The dispatch's docs trail PR (Records, sharpening artifact, queue evolution at dispatch start)
2. The dispatch's code PR (the engineer's deliverable)
3. A separate closing-notes PR after the code merges, advancing the record to `closed`

With this rule, the third PR collapses into the next dispatch's docs trail PR. Each dispatch ships in two PRs (docs trail + code), and the prior dispatch's closure rides on the next dispatch's trail.

## Why

Three PRs per dispatch is a lot of GitHub history for one piece of work. The closing note is small, deterministic, and natural to bundle with the next dispatch's record-keeping turn.

The audit trail stays clean because the closing note still lands on `preview` — just on a different PR than its own dispatch's code.

## When the rule yields

There is no next dispatch in flight, or the operator wants the prior dispatch's closure to land before the next dispatch's trail is even drafted. In that case the closing note ships in a standalone docs PR. This is the exception, not the default.

## Pairing

This rule pairs with the navigator's interaction contract. After a code PR merges, the navigator's next state-read sees the prior record at `checkpoint returned` and naturally proposes "advance to `closed` as part of the next docs trail" rather than "open a closing-notes PR now."

## Adopted

2026-04-27, ratified during the cadence reflection turn captured at `docs/concepts/cadence-reflection.md`. Partly in practice since M1/S2 PR1's close — formalized here.
