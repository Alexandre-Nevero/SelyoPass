---
schema_version: 1.0.0
status: draft
last_updated: 2026-07-29
doc: level-4-proposal
---

# SelyoPass — Level 4 Idea Proposal

**Status:** proposal only. No written Stellar Builder Team approval is recorded. This document does
not authorize implementation.

## 1. Problem

Early-stage Philippine startups repeatedly collect and transmit similar KYB documents for separate
financial partners. Level 3 tests whether a hash-only portable credential can make integrity and
provenance independently inspectable. Level 4 would test whether that mechanism can support a real
institution workflow without misrepresenting compliance liability or processing real data before
the necessary controls exist.

Evidence remains weak: one unlogged founder account, no institutional acceptance, no payer, and no
real anchor commitment.

## 2. Why Stellar

- Stellar account authorization lets subjects and issuers consent to exact contract invocations
  without SelyoPass handling keys.
- Atomic cross-contract calls let Credential Registry enforce current Anchor Registry membership.
- Public contract state and typed events give relying parties inspectable integrity evidence.
- Testnet supports a synthetic pilot before any mainnet or real-data risk.
- Wallet support makes the holder—not SelyoPass—the actor authorizing writes.

These are technical fit claims, not evidence that an institution will adopt the credential.

## 3. Target users and decision-makers

| Role | Level 4 question |
|---|---|
| Startup founder/operator | Does the package remove a real resubmission step? |
| Relying-party compliance/onboarding owner | Can policy accept it as preferred intake while retaining judgment? |
| Regulated anchor security/compliance owner | Can issuance fit key custody, audit, and revocation controls? |
| Buyer/budget owner | Is avoided collection work worth paying for, and from which budget? |
| Data protection/legal owner | What real-data, retention, access, and data-subject controls are required? |

## 4. Proposed architecture

Level 3 remains the base: holder-local package, Anchor Registry, Credential Registry, generated
bindings, two wallets, public verification, and RPC event evidence.

Only after approval, architecture discovery may evaluate:

- real-anchor operator integration with managed key custody and separation of duties;
- an institution-facing adapter/API if the partner requires it;
- private/off-chain encrypted document exchange with explicit access and retention controls;
- durable event indexing/audit beyond RPC's recent-history window;
- contract upgrade/governance and anchor rotation/recovery;
- continuous update/re-verification events (`F-101`).

Cross-jurisdiction (`F-102`), mainnet, and production real-data handling remain separate future gates,
not implicit Level 4 scope.

## 5. Complexity and risks

| Area | Complexity/risk | Approval-stage evidence needed |
|---|---|---|
| Institutional policy | Highest demand risk | written preferred-intake accept/reject criteria |
| Key custody | issuer compromise can invalidate trust | partner security design and rotation/revocation |
| Privacy | KYB contains personal data; hashes can correlate | DPIA, current primary-law review, counsel |
| Audit/history | RPC event history is bounded | retention/indexing requirements |
| Contract governance | upgrades and anchor changes affect trust | explicit authority and recovery model |
| Integration | partner systems may not consume the schema | bounded pilot interface and owner |
| Economics | buyer/budget unknown | actual budget/process evidence |

## 6. Proposed roadmap after written approval

1. **Discovery gate:** obtain one relying institution and one potential anchor workflow map, policy
   criteria, data map, buyer/budget owner, and synthetic pilot agreement.
2. **Security/legal design gate:** approve key custody, privacy impact assessment, data boundaries,
   retention, incident response, and contract governance.
3. **Synthetic partner pilot:** integrate against sandbox/testnet with no real company/UBO data.
4. **Measured decision:** compare collection steps/time/exceptions and obtain written accept/reject.
5. **Only then:** propose mainnet/real-data/jurisdiction scope through new written gates.

## 7. Requested decision

The Stellar Builder Team is asked to provide written:

- approval or rejection of the proposed Level 4 discovery/pilot scope;
- required deliverables and rubric;
- whether real-anchor sandbox integration is expected;
- prohibited or prerequisite activities;
- designated review/checkpoint process.

Until that response is stored as release evidence, `F-101`, `F-102`, and `F-104` remain `Won't` and
no Level 4-specific implementation begins.

## 8. Approval record

| Field | Value |
|---|---|
| Submitted date | not submitted |
| Recipient | Stellar Builder Team |
| Proposal version/SHA | not assigned |
| Written decision | not received |
| Evidence link | — |
| Authorized scope | none |

## References

- [`idea.md`](../idea.md)
- [`system-design.md`](system-design.md)
- [`security-compliance.md`](security-compliance.md)
- [`DECISION-LEDGER.md`](DECISION-LEDGER.md)
