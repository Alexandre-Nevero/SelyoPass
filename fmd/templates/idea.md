---
status: draft
schema_version: 1.1.0
---

# Idea: <working name>

<!--
FMD's INPUT CONTRACT. This is the shape the factory expects to consume. It is NOT authored
here — authoring (validation, research, interviews) is the idea-kit's job. The factory keeps
this copy only so the `validator` subagent can check an incoming brief against it.
Golden rules: no solution-first framing, every material claim sourced, the segment is specific.
Allowed everywhere: "N/A — because…". Not allowed: silently dropping a section.
Authoring guide: <your-knowledge-base>/idea-kit/how-to-write-idea.md
-->

## 1. Problem statement
<!-- One paragraph. The pain, who has it, no solution language. -->

## 2. Target segment
<!-- Who specifically. Role, context, frequency of the problem. "Everyone" is not a segment. -->

## 3. Evidence
<!-- From validation. Each material claim is immediately followed by a
     machine-parseable evidence callout (the exact format the forge emits and
     the validator checks):
       > [!evidence] Type: said|did|paid | Source: <id/link> | Date: YYYY-MM-DD
     A claim with no callout must end with the token [unverified]. -->
- <observed behavior / workaround>
  > [!evidence] Type: did | Source: <interview-id> | Date: YYYY-MM-DD
- <committed money / signed LOI>
  > [!evidence] Type: paid | Source: <LOI-id> | Date: YYYY-MM-DD

The four tests:

| Test            | Pass / Fail | Why |
|-----------------|-------------|-----|
| Real            |             |     |
| Large           |             |     |
| Significant     |             |     |
| Urgent          |             |     |

## 4. Root cause (the WHY)
<!-- Why this exists and why it's unsolved today. Five-whys to something structural. -->

## 5. Market & alternatives
<!-- From research. -->
- **Size band:** <hundreds / thousands / millions> — _source_
- **Reachability:** <where they gather — 2+ places you can reach them this week>
- **Top 3 alternatives + their key failure:**
  1. <alternative> — fails at <gap>
  2. <alternative> — fails at <gap>
  3. <alternative / "do nothing"> — fails at <gap>

## 6. Value proposition
<!-- One sentence, fill the blanks. -->
For **<segment>** who **<pain>**, this is a **<category>** that **<key benefit>**, unlike
**<alternative>**, because **<differentiator>**.

## 7. Feature set
<!--
Each feature gets a STABLE ID: F-001, F-002, … These IDs are the spine of traceability.
The PRD references them; the QA test plan tests each one by ID. Never renumber an existing
feature — retire it and add a new ID instead.
-->

### MVP — smallest path to core value + a learning signal
<!-- Each feature names the problem it solves. -->
- **F-001** — <feature> → solves <problem from §1/§3>
- **F-002** — <feature> → solves <problem>

### Final product — full vision
- **F-101** — <feature>
- **F-102** — <feature>

## 8. Success metrics
<!-- Activation, retention, revenue targets. Not vanity metrics (signups/views/impressions). -->
- **Activation:**
- **Retention:**
- **Revenue / value:**

## 9. Constraints, risks & kill criteria
<!-- The single riskiest assumption, plus explicit fail-states that would kill
     the idea. Kill criteria are forward-looking, not evidence-tagged. -->
**Single riskiest assumption:** <the one thing that must be true>

**Kill criteria (explicit fail-states):**
- Regulatory:
- Unit economics:
- Technical:

## 10. Out of scope (for now)
<!-- Explicitly. Prevents scope creep downstream. -->
