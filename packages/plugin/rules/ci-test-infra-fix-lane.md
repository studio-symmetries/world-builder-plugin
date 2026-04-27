# CI Test-Infra Fix Lane

Trivial test-infra fixes — flakes, port collisions, fixture cleanups, test isolation issues, jest/playwright config tweaks — run on a fast-path that skips specialist sharpening and consolidates the audit trail.

## What this means

Standard milestone work goes through the full cadence: navigator surfaces options, operator picks, /dispatch-worker validates the payload, navigator dispatches the specialist for sharpening, specialist returns a contract, operator approves the engineer dispatch, engineer implements, navigator verifies, two PRs ship (docs trail + code), closing notes follow.

For trivial test-infra fixes, that cadence is heavier than the work warrants. The lane fast-path:

- **No specialist sharpening.** Test-infra fixes don't require continuity-governance or canon-memory pre-work; the sharpening turn is unnecessary.
- **Single dispatch record.** Instead of separate records for proposed → dispatched → checkpoint returned → closed, write one record at close covering the whole lifecycle compactly.
- **Single PR.** Fix + closing note land in one commit on one branch (`fix/<descriptor>` off `preview`). No separate docs trail PR; no separate closing-notes PR.

## Lane scope rule

A dispatch qualifies for the lane if and only if its file changes are confined to:

- `apps/world-builder-api/src/test-support/`
- `apps/world-builder-api/src/**/*.int.test.ts`
- `apps/world-builder-api/src/**/*.spec.ts` (when the spec is for test infrastructure, not product behavior)
- `apps/world-builder-api/jest.config.ts`
- `apps/world-builder-ui-e2e/`
- `apps/world-builder-ui-e2e/playwright.config.ts`
- `apps/world-builder-ui/src/**/*.spec.tsx` (when the spec is for test infrastructure, not product behavior)

If the dispatch's file changes touch anything outside this list, the lane does not apply. The navigator surfaces the boundary violation and either the dispatch is re-classified as substantive (full cadence) or scope is narrowed to fit the lane.

## What does NOT qualify

- Production source files (route handlers, components, libs, contracts) — these are substantive, run full cadence
- Validation rules, data shapes, schema files — these need a specialist sharpening pass even when "small"
- Test additions for new product features — these belong with the feature slice they prove
- Renames or refactors that touch tests AND production code — production-side puts it back on the full cadence

When in doubt, the lane does not apply. False positives (lane misclassification of substantive work) are the failure mode to avoid; false negatives (full cadence on what could have been lane work) are merely overhead.

## Other lanes

`dependency-bump` (lockfile updates, package patch versions) and `docs-only` (README updates, non-governance docs) lanes are deferred. They will be defined when actual demand arises. Until then, those classes of work either go through full cadence or the operator commits directly outside the dispatch flow (with a single retroactive dispatch-log entry recording the commit).

## No `/quick-fix` skill

There is no operator-invocable shortcut. Lane recognition happens at dispatch time when the navigator state-reads the proposed work and notes "this fits the lane." The operator picks the dispatch the same way as any other; the lane just changes how the navigator runs the cadence on the back of the pick.

## Adopted

2026-04-27, ratified during the cadence reflection turn captured at `docs/concepts/cadence-reflection.md`. Saves ~3 turns + 1 PR + 2 dispatch-log records per qualifying fix.
