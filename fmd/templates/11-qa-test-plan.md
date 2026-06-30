# QA — Test Plan & Test Cases

> **Purpose:** how quality is proven, and the **traceability home**. Every feature in the PRD/FRD
> must appear here with at least one test.
> Traces back to: PRD, FRD, SRS.

## Test strategy
<!-- Levels (unit/integration/e2e), automation vs manual, who owns what. -->

## Scope
### In scope
### Out of scope

## Environments
<!-- Where tests run; data setup; secrets handling (reference, never inline). -->

## Traceability matrix
<!--
The core artifact. EVERY F-### from idea.md §7 / the PRD must appear here with at least one
test case. The consistency-checker parses this: an F-### with no row is an orphaned feature
(FAIL); a test case covering no F-### is a stray test (FAIL).
-->

| F-ID  | Feature | Test case ID(s) | Type | Status |
|-------|---------|-----------------|------|--------|
| F-001 |         | TC-001          | e2e  | todo   |

## Test cases
<!-- Per case: ID, the F-### it covers, preconditions, steps, expected result. -->

### TC-001 — <name>
- **Covers:** F-001
- **Preconditions:**
- **Steps:**
- **Expected result:**

## Acceptance criteria
<!-- The bar for "this feature works". Pull from PRD acceptance criteria. -->

## Regression plan
<!-- What gets re-run on change and how often. -->

## Exit criteria
<!-- When testing is "done": coverage, pass rate, no open critical defects. -->
