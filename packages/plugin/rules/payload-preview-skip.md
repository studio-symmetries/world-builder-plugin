# Payload Preview Skip

`/dispatch-worker` auto-fires the dispatch when the assembled payload matches the approved queue row exactly with no scope or constraint drift. The `yes / edit / cancel` preview only fires when scope or constraints have drifted from the queue row.

## What this means

Before this rule, every dispatch produced a payload preview turn — even when the operator had just picked an option whose triggered-agents and proof-artifact matched the queue row exactly. Confirming `yes` to a payload that hadn't changed was ceremony.

With this rule:

- The skill assembles the eight-field payload from the approved queue row
- The skill compares the assembled payload to the queue row's source data:
  - Same Owning Specialist
  - Same Execution Team
  - Same Constraints (no `with conditions: <text>` override)
  - Same Acceptance Gate
  - Same Required First Checkpoint
  - Same Proof Artifact
- If all six match: auto-fire. The navigator returns the dispatch directive directly without a confirmation turn.
- If any drift: show the preview, ask `yes / edit / cancel`. Operator picks deliberately because something has changed.

The operator's first pick (the option from the navigator's numbered list) is the approval. The preview was a second redundant confirmation when nothing had changed.

## When the preview still fires

- Operator added `with conditions: <text>` when picking — those conditions are drift; preview fires so the operator can see them in the assembled payload
- Operator picked an option whose Owning Specialist or Execution Team doesn't match the queue row's named lanes
- Operator picked an option that names a different Acceptance Gate or Proof Artifact than the queue row
- The Required First Checkpoint differs (e.g., the queue says "first checkpoint return with diff," but the operator's pick implies a different checkpoint)
- Any of the eight payload fields can't be cleanly resolved from the queue row alone

In any drift case, preview is mandatory. Operator's `yes` is a deliberate confirmation that the drift is intentional.

## Why

The operator-pick gate is real and stays real: the operator picks the option from the navigator's numbered list, and that pick is the approval. The preview was added as a second gate to catch operator mistakes — but mistakes only show up as drift from the queue row. When there's no drift, the second gate is friction without payoff.

This rule preserves the gate where it adds value (drift) and removes it where it doesn't (no drift).

## Pairing

This rule pairs with `approval-gate` (which checks the founder approval status) and the dispatch-log idempotency check. Skip-on-no-drift only happens AFTER both of those have passed. The first two gates are real; the redundant preview is the one being skipped.

## Adopted

2026-04-27, ratified during the cadence reflection turn captured at `docs/concepts/cadence-reflection.md`. Saves ~1 operator turn per dispatch.
