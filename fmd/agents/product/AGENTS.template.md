# {project_name} — Agent Guide

<!--
TEMPLATE — emitted to the TARGET PROJECT's root (not the factory). The orchestrator fills
{placeholders} from idea.md + the system design. Loaded every turn in the target repo, so keep
it lean (≤ ~200 lines). Push depth into /docs links; do not inline what a link can carry.
-->

## Project overview
{project_name} is {value_prop_one_liner}. It serves {segment} who {pain}.

## Architecture
{architecture_summary}
See [System Design](./docs/06-system-design.md) for components, data flow, and trade-offs.

## Build & run
```
{build_commands}
```

## Test
```
{test_commands}
```
All changes must pass tests before they're considered done.

## Code style & conventions
- Language / runtime: {language}
- Formatting: {formatter}
- Naming & patterns to follow: {conventions}
- Patterns to avoid: {anti_patterns}

## Do not touch
{do_not_touch}

## Definition of done
- Build passes, tests pass.
- Traceability preserved: code change ties to an `F-###`; that `F-###` has a test in the QA plan.
- No secrets committed; any network-exposed surface has auth/authz.
- Docs updated when behavior changes.

## References
- [PRD](./docs/03-prd.md) — features by `F-###`
- [System Design](./docs/06-system-design.md)
- [QA Test Plan](./docs/11-qa-test-plan.md) — traceability matrix

<!-- For scoped, path-specific rules, see ./.cursor/rules/*.mdc (generated from cursor-rules/). -->
