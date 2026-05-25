# Modernization & Refactor Plan (Behavior-Preserving)

## Scope and Non-Goals

This plan focuses on structural refactors that preserve existing behavior:

- Keep user-visible behavior unchanged unless explicitly approved.
- Keep route paths and response contracts stable.
- Keep store selectors/action names stable (or provide compatibility facade).
- Keep tab ids/order stable.

Out of scope for this plan (separate migration tracks):

- Framework migrations with behavioral implications.
- Major dependency upgrades.
- API contract redesign.
- Architecture moves (e.g., persistence model changes).

## Invariants

1. Public API route paths and method handlers remain unchanged.
2. SSE event types/order for core flows remain stable.
3. Persisted settings and research state remain readable after refactors.
4. Research mode ids remain unchanged.

## Refactor Passes

### Pass 1: Dead code and duplicate helper cleanup
- Current behavior: utility/helper layer contains broad surface area and potential dead exports.
- Structural improvement: remove unused symbols and consolidate duplicate helper logic.
- Validation: lint/tests pass; no unresolved imports; usage scan confirms no runtime references removed.

### Pass 2: Decompose `useDeepResearch`
- Current behavior: single hook handles orchestration, streaming, provider tooling, and store updates.
- Structural improvement: extract focused helper modules under `src/hooks/deep-research/` while preserving hook API.
- Validation: parity tests for task state transitions and streamed reasoning/message updates.

### Pass 3: Unify provider API routes behind route factory
- Current behavior: provider route handlers likely duplicate request/response and error mapping logic.
- Structural improvement: centralize shared behavior in `create-proxy-handler` and keep per-provider adapters thin.
- Validation: route contract tests for status codes/headers/body shape across providers.

### Pass 4: Split monolithic settings store into slices
- Current behavior: single large store file is difficult to evolve safely.
- Structural improvement: domain slices with compatibility facade retaining legacy keys/actions.
- Validation: persisted-state roundtrip parity and selector/action compatibility checks.

### Pass 5: Introduce typed research mode registry
- Current behavior: tab metadata is duplicated across page/tab composition.
- Structural improvement: single typed registry for mode id/label/icon/component loader.
- Validation: UI tests for tab order, ids, and default tab behavior.

### Pass 6: Extract shared research runtime primitives
- Current behavior: deep-research and company-deep-research may duplicate orchestration concerns.
- Structural improvement: shared primitives for retries/timeouts/progress events.
- Validation: parity fixtures for SSE event sequencing and final output envelope shape.

## PR Strategy

- One pass per PR.
- Include current behavior, structural change, and validation evidence in each PR description.
- Avoid combining migrations with refactors.

## Suggested Execution Order

1. Baseline docs + parity checklist.
2. Pass 1 cleanup.
3. Pass 2 hook decomposition.
4. Pass 3 route consolidation.
5. Pass 4 settings slicing.
6. Pass 5 registry.
7. Pass 6 runtime primitives.
