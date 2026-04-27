# Story-First Priority

When work competes for the operator's attention, prefer in this order:

1. **Canon memory** — narrative inventory, canonical entities, provenance, inspectable story truth
2. **Continuity governance** — validation rules, contradiction detection, the protections that keep the canon honest
3. **Constrained storytelling** — workflows that produce story output within the canon and continuity envelope
4. **Artifact proof** — the published surfaces (editions, books, demos) that show the story is real

This is the world-builder priority order for situations where two ready-to-pick tasks would equally advance a milestone. Higher in the list wins.

## What this rule decides

This rule does not decide which milestone is current — that is the founder's call, surfaced through `docs/board/founder-approval-queue.md`. This rule decides which slice of the current milestone to advance first when multiple slices are equally available.

The navigator uses this rule when constructing the 1–3 numbered options it presents at the close of every turn. Given two viable options that an `approved` task would unblock, the navigator orders them by the priority list and presents the higher-priority one as Option A.

## Why this order, not another

The order reflects a load-bearing claim about how this venture builds value:

- Without canon memory, the rest of the system has nothing to be true about
- Without continuity governance, canon memory degrades the moment the system grows
- Without constrained storytelling, canon and continuity have no surface that uses them
- Without artifact proof, no one outside the operator knows the system works

The dependencies stack downward, so the priorities stack upward. Build foundation first.

## When the rule yields

The order is a default, not a constraint. It yields when:

- The founder explicitly approves a lower-priority task ahead of a higher-priority one. Founder approval is sovereign.
- A higher-priority task is blocked on something downstream — e.g., canon-memory work cannot proceed without an `api-engineer` schema decision. The navigator surfaces the unblock as the higher-priority option in that case.
- An integration verification (Phase 2) catches a regression in a lower layer. Fixing a regression in continuity governance jumps over new canon memory work, because the foundation has cracked and adding to it would compound the damage.

## Pairing

This rule pairs with `specialist-builder-boundary`. Specialists set product truth across the priority order; builders implement at whichever layer the navigator is currently advancing. The two together turn the priority list from doctrine into routing.
