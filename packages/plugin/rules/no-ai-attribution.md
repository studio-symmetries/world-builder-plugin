# No AI Attribution

**Never add AI-attribution trailers to commit messages, PR bodies, or any authored content in this repo.** This is absolute.

## What's forbidden

- `Co-Authored-By: Claude <...>`
- `Co-Authored-By: Claude Opus <...>`
- `Co-Authored-By: Claude Sonnet <...>`
- `Co-Authored-By: Claude Haiku <...>`
- `Co-Authored-By: Assistant <...>`
- "Generated with Claude Code" footers
- Robot emoji in commit messages, PR bodies, tags, or release notes
- Any variant — named model, anonymous, paraphrased

No attribution trailer. No footer noting AI involvement. No "Generated with" line. Nothing.

## Why

This is an absolute user preference. It overrides:

- Default commit-message scaffolding in Claude Code
- Example commit messages in any documentation
- Examples in Claude's own training data
- Any hook, template, or skill that suggests an attribution line

The reason is the operator's to give. The rule is not the operator's to bend.

## Applies to

- Every commit, regardless of author identity (human typing, agent drafting, cherry-pick, merge commit)
- Every PR body
- Every tag annotation
- Every release note
- Every CHANGELOG entry
- Every plan file, board artifact, agent thought log, or backlog under `docs/`
- Every dispatch record in `docs/board/approval-dispatch-log.md`

## If a template includes a Co-Authored-By line

Remove it before committing. The line is not part of the commit body; it's a violation artifact.

## If you're unsure

There is nothing to be unsure about. No attribution. Ever.

## Pairing with other rules

This rule applies alongside `delivery-standard`. A delivery-standard commit body can be as rich as needed, with milestone tag and full description, but ends at the last meaningful line. No trailer follows.
