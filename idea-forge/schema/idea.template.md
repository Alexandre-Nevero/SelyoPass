---
status: draft
schema_version: 1.1.0
---

<!--
  idea.md — THE CONTRACT (idea-forge schema v1.0.0)

  This is the only artifact that travels to the FMD documents factory.
  Fill every H2 section. If a section truly does not apply, replace its body
  with exactly:  N/A — because <reason>
  Do NOT delete sections. Do NOT add solution/architecture language to §1.

  Evidence rule (the keystone): immediately after any material claim in the
  Evidence, Market & alternatives, or Constraints/risks & kill criteria
  sections, place a callout:

      > [!evidence] Type: said|did|paid | Source: <id-or-link> | Date: YYYY-MM-DD

  A claim with no callout must end with the token [unverified] or it blocks FROZEN.
  Run `lint/validate.sh idea.md` before freezing. The linter — not the AI — decides.
  Set status: frozen in the frontmatter above only once the linter passes.
-->

# Idea: <one-line working title>

## 1. Problem statement

<One paragraph. The pain and exactly who has it. Zero solution language —
no app, platform, feature, API, or "we will build". Describe the problem as if
no solution existed.>

## 2. Target segment

<Role, context, frequency. "Everyone" is a fail. Name a specific person you
could find this week.>

## 3. Evidence

<said/did/paid signals. Each material claim gets a callout. Example:>

- Users keep a parallel spreadsheet because the official tool loses their edits.
  > [!evidence] Type: did | Source: interview-03 | Date: 2026-01-12
- One ops lead pre-paid for a manual workaround we ran by hand.
  > [!evidence] Type: paid | Source: LOI-acme | Date: 2026-01-20

### Four tests

| Test | Pass/Fail | Why |
|------|-----------|-----|
| Real (does it actually happen?) | | |
| Large (enough people?) | | |
| Significant (do they care?) | | |
| Urgent (now, not someday?) | | |

## 4. Root cause (the WHY)

<Five-whys from symptom to a structural root cause. Then answer: why is this
still unsolved today?>

## 5. Market & alternatives

<Bottom-up size band: specific reachable customers × realistic price. No
top-down "1% of a $B market". Reachability: 2+ places you can reach them this
week. Top-3 alternatives including "do nothing", and each one's key failure.
Material claims get evidence callouts.>

## 6. Value proposition

For `<segment>` who `<pain>`, this is a `<category>` that `<benefit>`, unlike
`<alternative>`, because `<differentiator>`.

## 7. Feature set

<!-- Each feature carries a STABLE ID (F-001, F-002 … for MVP; F-101+ for the
     final vision). FMD's traceability spine references these IDs from the PRD
     and QA plan, so never renumber an existing feature — retire it and add a
     new ID. At least one F-### MVP feature is required to freeze. -->

**MVP** (each feature carries an F-### ID and names the problem it solves):
- **F-001** — <feature> → solves <problem from §1/§3>

**Final**:
- **F-101** — <feature>

## 8. Success metrics

<Activation / retention / revenue. No vanity metrics (signups, views, upvotes).>

## 9. Constraints, risks & kill criteria

**Single riskiest assumption:** <the one thing that must be true>

**Kill criteria (explicit fail-states):**
- Regulatory:
- Unit economics:
- Technical:

## 10. Out of scope (for now)

<Explicit list to stop downstream scope creep.>
