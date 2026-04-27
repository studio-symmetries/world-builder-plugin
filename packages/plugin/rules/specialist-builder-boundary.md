# Specialist–Builder Boundary

**Strategy specialists define product truth. Execution engineers implement. The boundary does not cross.**

## The two sides

### Strategy specialists

- `canon-memory` (Phase 1)
- `continuity-governance` (Phase 3)
- `storytelling-workflow` (Phase 3)
- `publishing-proof` (Phase 3)

What they do:

- Read their thought log at `docs/agents/thoughts/<name>-thoughts.tsv`
- Read their backlog at `docs/agents/backlogs/<name>.md`
- Sharpen the product truth in their domain — the contract, the rule, the canonical entity, the validation surface
- Append their reasoning back into the thought log
- Update their backlog with what should rise next

What they do not do:

- Author application code under `apps/`
- Author shared library code under `libs/`
- Run database migrations or modify deployed infrastructure
- Open PRs

If a specialist's analysis would require code to land, the specialist hands the result to the navigator and the navigator dispatches an execution engineer.

### Execution engineers

- `api-engineer` (Phase 1)
- `app-engineer` (Phase 2)
- `ai-engineer` (Phase 3)
- `publishing-engineer` (Phase 3)

What they do:

- Implement against a contract a specialist sharpened
- Author code in their owned scope
- Run tests, type-checks, and the type of verification their builder lane requires
- Open PRs that match the delivery standard

What they do not do:

- Re-decide what the contract should be
- Override a specialist's product truth without escalating to the navigator
- Author thought log entries or backlog items in a specialist's lane

If an engineer notices the contract handed to them is wrong, the engineer escalates to the navigator. The navigator either re-invokes the relevant specialist for a fresh pass or surfaces the conflict to the operator. The engineer does not silently re-decide.

## What lives between

The navigator. The navigator holds the boundary by mediating every transition between sides — specialist → builder happens through `/dispatch-worker`, not through direct hand-off. The dispatch payload is the document that crosses the boundary; nothing else does.

The owned-scope PreToolUse hook in Phase 2 will enforce the boundary at the file-system level. In Phase 1 the boundary is enforced by prompt convention and the navigator's routing.

## Why

A team that erases the specialist–builder distinction collapses into "everyone makes everything," which sounds flexible but in practice means no one is responsible for canonical truth and the codebase grows in whichever direction the most recent agent felt strongly about.

The world-builder team design treats product truth as a separate craft from implementation. Specialists are slow, careful, and read-heavy. Engineers are fast, implementation-heavy, and read what specialists hand them. The boundary protects both modes.

## Pairing

This rule pairs with `approval-gate` (the navigator must verify approval before invoking a builder) and with `story-first-priority` (specialists set product truth across the priority order; builders implement at whichever layer is current). The three together describe a routing system, not just a doctrine.
