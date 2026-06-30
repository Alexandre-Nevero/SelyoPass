---
status: frozen
schema_version: 1.1.0
---

<!-- FICTIONAL EXAMPLE. Names, sources, and dates are invented to show
     "what good looks like." Do not treat as real evidence. -->

# Idea: Shift-handoff notes for independent pharmacies

## 1. Problem statement

Pharmacists at small independent pharmacies lose critical context between
shifts. When the morning pharmacist leaves, the evening pharmacist inherits
half-finished insurance rejections, partial patient callbacks, and verbal
"remember to..." notes that were never written down. This causes repeated work,
missed callbacks, and occasional dispensing delays that frustrate patients who
return to find their prescription still stuck. The pain recurs every single
shift change, several times a day.

## 2. Target segment

Lead and staff pharmacists at independent (non-chain) pharmacies in the US that
run 2-3 overlapping shifts per day. Roughly 1-4 pharmacists per location, high
turnover of part-time relief staff who lack institutional memory. Reachable
through state pharmacy association forums and two independent-pharmacy
subreddits.

## 3. Evidence

- Three of five pharmacies we visited keep a paper "shift book" by the till and
  hand-copy unresolved items into it at the end of each shift.
  > [!evidence] Type: did | Source: visit-pharmacy-02 | Date: 2026-02-03
- One owner pre-paid a $400 deposit for a 4-week manual pilot where we compiled
  the handoff log for them by phone each evening.
  > [!evidence] Type: paid | Source: LOI-greenfield-rx | Date: 2026-02-18
- A relief pharmacist forwarded us 11 screenshots of the WhatsApp group they use
  as an ad-hoc handoff channel because nothing official exists.
  > [!evidence] Type: did | Source: interview-07 | Date: 2026-02-09
- A second owner signed a letter of intent to pay $90/month if the pilot reduces
  missed callbacks.
  > [!evidence] Type: paid | Source: LOI-bayside-rx | Date: 2026-02-21
- Several pharmacists said they "would definitely use something like this."
  > [!evidence] Type: said | Source: interview-04 | Date: 2026-02-05

### Four tests

| Test | Pass/Fail | Why |
|------|-----------|-----|
| Real (does it actually happen?) | Pass | Observed paper shift books in 3/5 sites |
| Large (enough people?) | Pass | ~19k independent pharmacies in the US |
| Significant (do they care?) | Pass | Two owners committed money |
| Urgent (now, not someday?) | Pass | Happens every shift change, daily |

## 4. Root cause (the WHY)

Why do items get lost? Because they live in the outgoing pharmacist's head.
Why are they in their head? Because writing them down mid-shift is slower than
the work itself. Why is writing slow? The dispensing system has no handoff
field, so notes go on paper or chat. Why no handoff field? The dispensing
vendors optimize for the claim/fill transaction, not the cross-shift workflow.
Structural root cause: the system of record treats a prescription as a discrete
transaction, not as a multi-shift case with open loops. It is unsolved today
because the incumbents sell to chains where centralized staffing hides the
problem.

## 5. Market & alternatives

Bottom-up: ~19,000 US independent pharmacies; if 3% adopt at $90/month that is
about $0.6M MRR -- order-of-magnitude, not a forecast.

- Reachable this week via state association forums and two subreddits.
  > [!evidence] Type: did | Source: forum-mining-log | Date: 2026-02-12
- Alternative "do nothing" (paper shift book): cheap but loses structured items
  and is invisible to relief staff who never see the book.
  > [!evidence] Type: did | Source: visit-pharmacy-02 | Date: 2026-02-03
- Alternative "WhatsApp group": fast but unsearchable, no patient linkage, and a
  HIPAA exposure the owners are nervous about.
  > [!evidence] Type: said | Source: interview-07 | Date: 2026-02-09

## 6. Value proposition

For independent-pharmacy staff who lose context between shifts, this is a
structured shift-handoff log that surfaces open loops to the next pharmacist,
unlike a paper shift book, because it links each open item to the patient and
travels with the relief staff who never see the book.

## 7. Feature set

**MVP** (each feature names the problem it solves):
- **F-001** — Open-loop list per shift, carried forward until resolved (solves: lost items).
- **F-002** — Patient linkage on each note (solves: missing context).

**Final**:
- **F-101** — Integration with top 2 dispensing systems.
- **F-102** — Missed-callback metric dashboard for owners.

## 8. Success metrics

- Activation: a pharmacy logs >=5 handoff items in week 1.
- Retention: >=60% of pilot pharmacies still logging at week 4.
- Revenue: >=2 pharmacies convert from pilot to paid by month 2.

## 9. Constraints, risks & kill criteria

**Single riskiest assumption:** pharmacists will write items into a new tool
mid-shift instead of defaulting to paper/chat.

**Kill criteria (explicit fail-states):**
- Regulatory: if patient-linked notes can't meet HIPAA without enterprise-grade
  cost, the unit economics break and we stop.
- Unit economics: if CAC exceeds 12 months of revenue at $90/month, stop.
- Technical: if dispensing vendors block integration and manual entry kills
  adoption, stop.

## 10. Out of scope (for now)

- Chain pharmacies and hospital pharmacies.
- Automated insurance-rejection resolution.
- Native mobile app (web-first for the pilot).
