# Refactor Parity Checklist

Use this checklist for every refactor pass to demonstrate behavior stability.

## Core User Flows

- [ ] Free-form research: run end-to-end and verify progress/messages/final report rendering.
- [ ] Company deep dive: run end-to-end and verify progress/messages/final report rendering.
- [ ] Settings persistence: update keys/settings, reload, confirm values restored.
- [ ] History/knowledge panels: open/close and verify persisted UI behavior as expected.

## API / SSE Contracts

- [ ] `/api/company-research` validates required fields and provider ids with current error semantics.
- [ ] SSE event types remain: `progress`, `message`, `reasoning`, `error`.
- [ ] Event ordering for representative fixture remains stable.

## Provider Proxy Parity

- [ ] Each `/api/ai/<provider>/...` route returns unchanged status/body shape for success path.
- [ ] Each `/api/ai/<provider>/...` route returns unchanged error mapping for failure path.

## Store Compatibility

- [ ] `useSettingStore` legacy keys remain accessible.
- [ ] `useTaskStore` transitions unchanged for planning/search/final report phases.
- [ ] Persisted state remains readable after refactor.

## Build & Test Checks

- [ ] `pnpm lint`
- [ ] `pnpm test`
- [ ] Targeted tests for touched modules.

## PR Evidence Template

For each pass, include:

1. Current behavior summary.
2. Structural improvement summary.
3. Validation checks run (commands + result).
4. Notes on public API stability.
