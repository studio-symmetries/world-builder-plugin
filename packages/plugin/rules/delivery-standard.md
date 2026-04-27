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

The world-builder repo uses a three-trunk flow. None of these takes milestone-scoped commits directly; everything goes through a `feat/` branch and a PR.

- **`main`** — production. Receives merges from `preview` only, via a separate periodic PR (look at recent main history: every commit is `Merge pull request #N from studio-symmetries/preview`).
- **`preview`** — integration / staging. Receives merges from feature branches via PR. This is the **default base for feature PRs**, not `main`.
- **feature branch** (`feat/m<N>-s<N>-<desc>`) — work in progress. Branches off `preview`, opens a PR against `preview`.

The flow:

```text
feat/m<N>-s<N>-<desc>  →  preview  →  main
```

When the navigator dispatches builder work and the resulting PR is opened, the PR base must be `preview`. Not `main`. A PR opened against `main` is a delivery-standard violation that needs re-targeting via `gh pr edit <N> --base preview` before merge.

## Deploy domains

Each trunk maps to a domain on Vercel:

- **`main`** → `www.friendoftilly.com` (production)
- **`preview`** → `preview.friendoftilly.com` (staging — what reviewers see between feature merge and production cut)
- **feature branch** → an auto-generated PR-specific URL like `world-builder-ui-pr-<N>.vercel.app`. For ad-hoc operator review, `review.friendoftilly.com` can be aliased onto the current feature branch deployment via `npx vercel alias <deployment-url> review.friendoftilly.com` from `apps/world-builder-ui/`.

The auto-generated PR URLs are how reviewers test a feature in isolation. The `review.friendoftilly.com` alias is a stable, memorable URL the operator can hand to a non-Vercel-savvy reviewer.

When the navigator's interaction contract closes a turn with a proof artifact like `PR titled "M1 / S1: <subject>"`, the implied artifact is the PR-specific Vercel URL plus the GitHub PR. The PR base must be `preview` for the deploy URL to align with the team's review flow.

## What the PostToolUse Bash hook checks

The Phase 1 PostToolUse hook on `Bash` runs after branch creation or checkout and warns when `git branch --show-current` does not match `^(feat|fix|docs|chore)/m[0-9]+-s[0-9]+-`. The warning is non-blocking — the hook prints it for the operator to see; it does not deny the action. Phase 2 may upgrade this to a blocking PreToolUse hook once the convention is established.

## Pairing

This rule pairs with the navigator's interaction contract: every dispatch the navigator surfaces names the milestone (`M<N> / S<N>`) explicitly in the proof artifact line. That alignment is what keeps the branch / commit / PR shape consistent — the milestone tag is decided at dispatch time, not at commit time.

## Why

Milestone tagging is the cheapest possible mechanism for cross-surface traceability. A reviewer scanning recent PRs, a board reading commit history, and the navigator reading the dispatch log all need to know which milestone slice a piece of work belongs to. A consistent prefix turns "what slice was this?" from a research question into a glance.
