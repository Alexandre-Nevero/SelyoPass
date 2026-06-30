# SelyoPass — Comprehensive Research Prompt

> Paste the block below into a capable web-research agent (the IdeaForge
> `researcher` subagent, or any agent with live web access). It is written to
> the IdeaForge researcher contract: **every returned claim is a lead to
> verify, never truth**, and must carry a source + date so it can become a
> candidate `> [!evidence]` tag in `idea.md`.
>
> **What this can and cannot do.** Desk research can close the *market,
> alternatives, regulatory, and ecosystem* gaps and — most importantly — tell
> you **where to reach the segment**. It produces `said`/secondary signal only.
> It **cannot** produce the behavioral `did`/`paid` evidence that clears the
> linter's evidence floor. That still requires founder interviews. Treat the
> "reachability" mission as the highest-value output: it's the map to the
> evidence you've deferred.

---

## ROLE & HARD RULES (do not skip)

You are a market and ecosystem researcher. Your job is to size honestly, map
the alternatives, verify regulatory and technical claims, and find where a
specific segment congregates. Follow these rules without exception:

1. **Bottom-up only.** Size markets by counting specific reachable customers ×
   realistic price. Reject top-down "1% of a $XB market" reasoning. Show your
   arithmetic and every source.
2. **Cite source + date on every claim.** No source, no claim. Format each as a
   candidate evidence tag: `Type: said | Source: <url> | Date: YYYY-MM-DD`.
3. **The real incumbent is "do nothing."** Map the friction in the current
   manual workaround precisely, not just named competitors.
4. **Signal vs noise.** A detailed description of a real workaround = signal.
   Generalized venting = noise. A complaint with high engagement = a documented
   pattern, but still `said`, never `paid`.
5. **Anti-vanity.** Interest (signups, clicks, upvotes, waitlists) is NOT demand
   (behavior change, payment). Classify every traction signal explicitly. Flag
   anything presented as demand that is really just interest.
6. **Leads to verify, not conclusions to trust.** Where you are uncertain, say
   so. Do not fabricate sources, dates, numbers, or quotes.

---

## CONTEXT (the thing being researched)

A portable Know-Your-Business (KYB) credential concept for early-stage
Philippine startups. The pain: a startup that connects to multiple regulated
financial institutions (banks, payment gateways, e-money issuers) must prove its
corporate identity from scratch with every partner — submitting near-identical
documents (SEC registration, BIR certificate, Mayor's Permit, Articles of
Incorporation, beneficial-ownership disclosure, GIS) through each institution's
separate intake cycle, even though all are verifying the same legal entity. The
idea is to let the business get verified once by a regulated anchor and present a
signed, reusable, independently verifiable record to each subsequent institution
(the institution still runs its own compliance judgment; only the document
collection step is eliminated).

**Segment to research:** Philippine startups in roughly their first 18 months
that complete two or more financial integrations — fintechs subject to BSP
licensing, marketplace platforms needing multiple banking partners, and B2B SaaS
companies with embedded payments.

**Claims currently UNVERIFIED that you are trying to pressure-test or source**
(do not assume any are true; find independent evidence for or against each):
- That this duplicated-onboarding pain generalizes beyond a single founder.
- That the manual workaround (shared Drive folder, tracking spreadsheet, a
  part-time compliance person) is what startups actually do today.
- That institution-side verification vendors do NOT offer a portable,
  business-owned credential.
- That no regulator-led portable KYB credential exists for the Philippines.
- The specific regulatory constraints (BSP Circular 1170, AMLA rules, RA 10173).
- The Stellar ecosystem facts (SEP-12 as a KYB/KYC standard; PDAX as a
  BSP-licensed Stellar anchor; Soroban smart-contract capability).

---

## RESEARCH MISSIONS

### Mission A — Reachability (HIGHEST PRIORITY)
Where do Philippine early-stage startup founders doing financial integrations
gather, online and offline? List **5+ specific channels** with links —
include the APAC-specific places generic search misses: founder Slack/Discord
groups, LinkedIn communities, Telegram/Viber/WhatsApp groups, local accelerators
and incubators (e.g., QBO Innovation Hub, IdeaSpace, Plug and Play PH),
BSP/fintech association lists (FINTECH PH/Fintech Alliance.ph), and relevant
Reddit/forum spaces. For each: estimate activity level and state whether a solo
founder could realistically post or reach members **this week**, and how.

### Mission B — Workaround mining
In the channels from Mission A (and broader web), find threads, posts, or
articles where founders describe **how they currently handle** multi-institution
KYB/onboarding paperwork. Prioritize detailed descriptions of manual workarounds
(steps, time spent, money spent, who does it) over general complaints. Return
direct quotes with links and dates. Flag any high-engagement thread as a
documented pattern. Explicitly mark each as interest vs. behavior.

### Mission C — Bottom-up market sizing
Estimate the number of reachable segment members, built bottom-up from a
concrete count — e.g., number of SEC-registered startups / BSP-licensed
fintechs / DTI-registered businesses doing payments integrations in the
Philippines per year — NOT from a RegTech market-size report. Multiply by a
realistic per-credential or subscription price to produce an order-of-magnitude
band. Show every step of the arithmetic and cite each input. Name where the
first 10 paying customers plausibly come from.

### Mission D — Alternatives & competitive teardown
List the top ways the segment solves this today and name each one's single
biggest friction or failure point. Cover at minimum:
- **Do nothing / manual** (the baseline).
- **Institution-side verification vendors** — AsiaVerify, HyperVerge, Sumsub,
  Persona, ComplyAdvantage, Tookitaki, plus PH-local players (e.g., VYB
  Solutions, eKYC.ph). For each: what they sell, to whom, and whether they
  produce a portable business-owned credential. Confirm or refute the claim that
  their per-verification revenue model disincentivizes building one.
- **Regulator-led / government** — Singapore Myinfo Business, India Account
  Aggregator/Sahamati, PH DTI Central Business Portal. Confirm or refute that
  none provides a portable KYB credential usable by private institutions in the
  Philippines.

### Mission E — Regulatory constraint verification
Verify with primary or authoritative secondary sources: (1) BSP Circular 1170
and AMLA implementing rules placing customer-due-diligence liability on the
regulated entity (non-transferable); (2) RA 10173 (Data Privacy Act) obligations
that would make a document-collecting intermediary a personal-information
controller, and what NPC registration requires. Note any rule that would be a
hard kill (i.e., makes the concept illegal as framed).

### Mission F — Stellar ecosystem & technical verification
Verify: (1) what SEP-12 actually specifies and whether it supports KYB (business)
data exchange, not just individual KYC; (2) PDAX's current status as a Stellar
anchor and its BSP/VASP licensing; (3) Soroman/Soroban smart-contract capability
relevant to credential issuance, document-hash anchoring, and inter-contract
communication on testnet. Cite official Stellar docs (SEP repository), PDAX, and
SDF sources with dates.

### Mission G — Existential-threat scan
Search for any signal that BSP or a Philippine government body is building or
piloting a portable business-identity / "verify-once" credential equivalent to
Singapore's Myinfo Business. Also scan whether any institution-side incumbent has
announced a business-owned/portable credential product. Report timing and source
dates — this maps directly to the brief's regulatory kill criterion.

### Vanity check (apply across all missions)
For every traction or demand signal you surface, classify it as **interest**
(clicks, signups, upvotes, press) or **demand** (built a workaround = `did`;
deposit/pre-order/LOI/payment = `paid`). Flag anything being presented as demand
that is really interest.

---

## OUTPUT CONTRACT

Return exactly this structure:

```
SIZE (bottom-up): <count> reachable × <price> ≈ <band>  [order of magnitude, with arithmetic]
REACHABILITY: <5+ specific channels reachable this week, each with link + how to reach>
WORKAROUND EVIDENCE: <quotes + links + dates; each marked interest|did|paid>
ALTERNATIVES:
  - do nothing: <key failure>
  - institution-side vendors: <do they offer a portable credential? key failure + sources>
  - regulator-led: <any PH-usable portable KYB credential? key failure + sources>
REGULATORY: <BSP 1170 / AMLA / RA 10173 findings + sources; flag any hard kill>
ECOSYSTEM/TECH: <SEP-12 KYB scope / PDAX status / Soroban capability + official sources>
EXISTENTIAL THREATS: <BSP portable-ID signals, incumbent pivots, with dates>
LEADS TO VERIFY: <every claim as a candidate [!evidence] tag: Type: said | Source: <url> | Date: YYYY-MM-DD>
VANITY FLAGS: <any metric mistaken for demand>
CONFIDENCE & GAPS: <what you could NOT find; what only interviews can resolve>
```

---

## HOW TO USE THE RESULTS

- Every line under `LEADS TO VERIFY` is a candidate `> [!evidence]` callout for
  `idea.md` — but classified `said`/secondary. They sharpen §3, §5, §9 and
  remove `[unverified]` tokens **only** where a real, dated source backs the
  claim.
- The `REACHABILITY` block is your interview target list. The behavioral
  `did`/`paid` evidence that clears the evidence floor comes from working that
  list after June 30, not from this prompt.
- `REGULATORY` hard-kill findings feed §9 kill criteria immediately.
- `ECOSYSTEM/TECH` findings de-risk the Level 3 build scope (F-001–F-004).
