---
schema_version: 1.0.0
status: draft
last_updated: 2026-07-29
doc: pitch-kit
---

# Pitch Kit — SelyoPass

> The official current rubric and weights are not in the repository. Do not finalize timing,
> eligibility, or scoring language until the release owner supplies the primary source.

**Rubric mapping status:** unavailable pending a primary organizer source. The narrative order and
timings below are an internal rehearsal aid from the user-approved recovery plan; they are not
mapped to organizer criteria or weights.

## 1. Business narrative

Philippine startup founders repeatedly send the same corporate-document pack to financial partners.
SelyoPass demonstrates a narrower, legally honest improvement: a founder locally hashes synthetic
documents, requests a portable testnet credential, an authorized simulated anchor issues it through
two Stellar contracts, and a relying party independently checks integrity evidence. The institution
still makes its own KYB decision. The build tests technical feasibility; institutional acceptance
and willingness to pay remain unvalidated.

## 2. Business Model Canvas

| Block | Current hypothesis / evidence boundary |
|---|---|
| Users | founders/operators; relying-party compliance/onboarding reviewers |
| Beneficiary | startup and institution operations teams |
| Buyer/budget owner | unknown; no paid evidence |
| Value | reduce repeated collection/parsing while preserving independent judgment |
| Channels | founder network and potential Stellar/regulated-anchor channels; unvalidated |
| Relationship | portable holder-owned package; no SelyoPass document custody |
| Key activities | schema, contract authorization/lifecycle, wallet UX, integrity verification |
| Key resources | two contracts, SPA, wallet/RPC integration, release evidence |
| Partners | a future regulated anchor; none committed |
| Costs/revenue | not validated; do not present the prior desk estimate as a market fact |

## 3. Internal five-minute rehearsal script

| Time | Beat | Demonstration / evidence |
|---|---|---|
| 0:00–0:35 | Problem | n=1 founder behavior; label generalization unknown |
| 0:35–1:05 | Boundary | collection/integrity can travel; compliance judgment does not |
| 1:05–2:05 | Founder | local hash, public-payload review, Freighter/Albedo request |
| 2:05–2:55 | Anchor | simulated-anchor label, authorized cross-contract issue, event |
| 2:55–3:45 | Reviewer | wallet-free five-row integrity result and adjacent KYB statement |
| 3:45–4:25 | Why Stellar | public auth, atomic cross-contract call, events, holder wallets, testnet evidence |
| 4:25–5:00 | Proof + ask | CI/Pages/release manifest; ask for institution intake test and Level 4 decision |

Every technical beat is conditional on the release manifest. If evidence is absent, cut the claim.

## 4. Q&A ownership map

| Question | Owner | Honest answer boundary |
|---|---|---|
| Does this make a company compliant? | product | No; integrity evidence only |
| Is the anchor real? | product | No; simulated testnet anchor |
| Why two contracts? | contract | Separate admin-controlled anchor authorization from credential lifecycle |
| Why Stellar? | architecture | Account auth, atomic cross-contract verification, public events/state, testnet |
| Where are documents/PII? | security | Local/off-chain; synthetic only; hashes/metadata public |
| Are both wallets proven? | release | Only if TC-031 evidence is present |
| Will banks accept it? | founder/product | Unknown; this is the riskiest test |
| Is Level 4 approved? | release | No written approval has been provided |

## 5. Interview probe sheet

For a relying institution compliance/onboarding owner:

1. Walk through the last business onboarding where documents were re-collected after another
   regulated party had already reviewed them.
2. Which exact files were requested again, by whom, and what downstream work followed?
3. What audit/control requires originals versus a signed schema plus hashes?
4. Show the last intake exception caused by stale/mismatched documents.
5. Who owns the intake tool budget, and what did the team pay or build to avoid the work?
6. Would this package replace a step, accelerate it, or be ignored? Ask for the specific policy.
7. What smallest synthetic pilot could produce an accept/reject decision?

Record `said`, `did`, and `paid` separately. Emotional pain alone is not adoption evidence.

## 6. Internal recovery evidence manifest

The user-approved recovery plan requires the following internal evidence gates. They are not
organizer rubric or eligibility requirements unless a current primary organizer source later
confirms them:

- release SHA and 10+ meaningful commits mapped to requirements;
- green CI and Pages run URLs;
- frontend, contract, integration, browser, accessibility, and security reports;
- wallet-picker, mobile, green CI/CD, and passing-test screenshots;
- both contract IDs and WASM hashes;
- deployment, request, issue, and relevant interaction transaction hashes;
- typed event and cross-contract evidence;
- live demo and demo-video URLs;
- a reachability/freshness/contradiction check for every artifact.

Missing or cross-SHA evidence blocks the internal recovery release. Organizer submission readiness
cannot be assessed until the primary rubric, format, hard requirements, and deadline are supplied.

## References

- [`idea.md`](../idea.md)
- [`context.md`](../context.md)
- [`qa-test-plan.md`](qa-test-plan.md)
- [`level-4-proposal.md`](level-4-proposal.md)
