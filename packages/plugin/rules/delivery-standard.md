# Delivery Standard

Every milestone-scoped delivery uses the same shape across branch names, commit subjects, and PR titles.

## The shape

| Surface | Pattern |
| --- | --- |
| Branch name | `feat/m<N>-s<N>-<desc>` (e.g., `feat/m1-s1-inventory-contract`) |
| Commit subject | `[M<N>:S<N>] <subject>` (e.g., `[M1:S1] wire provenance into inventory output`) |
| PR title | `M<N> / S<N>: <subject>` (e.g., `M1 / S1: provenance wiring for inventory output`) |
| Tag (when applicable) | `m<N>-s<N>-<short-desc>` |

`<N>` is a positive integer with no leading zero. `<desc>` is hyphenated lowercase, no spaces, no underscores.

## Other branch prefixes

The same milestone tagging applies to non-`feat/` branches:

- `fix/m<N>-s<N>-<desc>` — bug fixes scoped to a milestone slice
- `docs/m<N>-s<N>-<desc>` — milestone-relevant documentation
- `chore/m<N>-s<N>-<desc>` — milestone-relevant tidying

A branch unrelated to any milestone slice is rare in this project and should be flagged before it lands. If the work genuinely has no milestone, the navigator records the deviation in the dispatch record.

## Trunks

Trunk branches stay unprefixed: `main`, `dev/unified` if present. Do not push milestone-scoped commits directly to a trunk — they go through a `feat/` branch and a PR.

## What the PostToolUse Bash hook checks

The Phase 1 PostToolUse hook on `Bash` runs after branch creation or checkout and warns when `git branch --show-current` does not match `^(feat|fix|docs|chore)/m[0-9]+-s[0-9]+-`. The warning is non-blocking — the hook prints it for the operator to see; it does not deny the action. Phase 2 may upgrade this to a blocking PreToolUse hook once the convention is established.

## Pairing

This rule pairs with the navigator's interaction contract: every dispatch the navigator surfaces names the milestone (`M<N> / S<N>`) explicitly in the proof artifact line. That alignment is what keeps the branch / commit / PR shape consistent — the milestone tag is decided at dispatch time, not at commit time.

## Why

Milestone tagging is the cheapest possible mechanism for cross-surface traceability. A reviewer scanning recent PRs, a board reading commit history, and the navigator reading the dispatch log all need to know which milestone slice a piece of work belongs to. A consistent prefix turns "what slice was this?" from a research question into a glance.
