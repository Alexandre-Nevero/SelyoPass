---
schema_version: 1.0.0
status: draft
last_updated: 2026-07-29
doc: product-design
owns: product experience, journeys, visual direction, reference lock, trust-sensitive copy, and design evidence
---

# SelyoPass Product Design

The supplied recovery plan approves and locks this document's **target design direction** for the
current phase. The artifact itself remains `draft` until TASK-001 closes; target approval does not
claim the prose is lifecycle-locked or the interface has been implemented or visually verified.

## 1. Brief

Designing a browser dApp for Philippine startup founders, a simulated anchor operator, and relying
institutions. The primary job is to prepare, issue, and independently check a hash-only credential
while keeping the trust boundary visible. The tone is quiet, institutional, precise, and
non-promotional. The central objection is that a credential could be mistaken for compliance
approval. The memorable idea is an **evidence ledger**, not a crypto dashboard.

## 2. Truth boundary

The product is Stellar **testnet only**, uses **synthetic data only**, and the anchor is
**simulated**. It demonstrates integrity and authorization mechanics, not regulatory approval,
institutional acceptance, a production privacy posture, or a real-anchor partnership. Every
result must keep “Your institution still makes its own KYB decision” adjacent to the integrity
result. See `INV-001`, `INV-006`, and `INV-007` in `docs/security-compliance.md`.

## 3. Roles and jobs

| Role | Job | Authorization | Must understand |
|---|---|---|---|
| Founder / startup subject | Hash local documents, inspect the public payload, submit a request, and retain a presentation package | Freighter or Albedo when requesting | Documents remain local; hashes and lifecycle metadata become public |
| Simulated anchor operator | Inspect a pending hash-only request and issue or reject it | Pre-authorized testnet anchor wallet | This is a demo operator surface, not an approval service |
| Relying party | Load a package or credential ID, re-hash local documents, and inspect independent evidence | None | Integrity evidence does not decide KYB |

## 4. Information architecture

Dependency-free hash routes keep GitHub Pages deep links functional:

- `#/prepare` — founder prepares and submits a request.
- `#/anchor` — clearly labelled Simulated Anchor Console.
- `#/verify` — wallet-free integrity checking.
- root — role choice: prepare or check; anchor console is secondary.

Wallet connection appears only at the action that needs authorization. Navigation preserves a route
across refresh and supports direct links without server rewrite rules.

## 5. Journey and state maps

### Founder

`privacy explanation → synthetic organization fields → local document hashing → exact public-payload review → wallet choice → request transaction → receipt → local package download`

The transaction state is:

`idle → simulating → awaiting_signature → submitting → pending → success | failed`

The receipt retains transaction hash, Credential Registry contract ID, request event, current
ledger, and a Stellar Explorer link.

### Simulated anchor

`operator warning → authorized wallet connect → pending request list → provenance inspection → issue or reject → cross-contract authorization result → transaction/event receipt`

An unauthorized wallet reaches a specific denial state; no secret-entry fallback exists.

### Relying party

`load local package or enter ID → preview issuer/subject/schema/timestamps/manifest → optional local re-hash → query registry/events → render independent evidence rows`

Evidence rows are: credential exists; issuer was authorized; presented fingerprints match;
on-chain status is active; issuance transaction/event was found. The heading is
**“Credential integrity result.”**

## 6. Privacy boundary by step

| Step | Browser-local | Public on Stellar testnet |
|---|---|---|
| Prepare | document bytes, synthetic form values before review, presentation package | nothing until submit |
| Request | document bytes and package | subject address, credential ID, document root, schema hash, expiry ledger, request event |
| Issue/reject/revoke | operator context | issuer address, lifecycle status, ledger/time metadata, bounded reason code, typed event |
| Verify | presented document bytes and local recomputed hashes | registry state and events read publicly |

No names, beneficial-owner values, raw files, or free text belong on-chain.

## 7. Reference research and lock

This direction uses the approved research set and the local Refero craft guidance. Paid Refero
screens/styles/flows are excluded.

- **Primary direction:** quiet institutional evidence ledger.
- **Primary traits:** navy/ink hierarchy, cool canvas, white evidence surfaces, compact status rows,
  borders instead of decorative shadow, and restrained amber for progress/focus.
- **Dock contribution:** issuer–holder–verifier role clarity and distinct integrity checks.
- **Persona contribution:** staged document lifecycle with explicit states.
- **Wallet-transaction contribution:** immediate receipt, pending/confirmed/failed progression, and
  a persistent Explorer link.
- **Refero craft contribution:** system font for a work tool; no more than a small semantic palette;
  4.5:1 body-text contrast; 44px targets; one outline icon family; 120–180ms purposeful motion;
  literal, action-led copy; no generic hero gradients, floating cards, or status conveyed by color alone.

**Reject:** approval banners, speculative-crypto visuals, decorative gradients, excessive pills or
rounded cards, raw JSON as the main view, hidden disclaimers, indefinite spinners, stock photos,
generated illustration, and novelty typography.

## 8. Visual thesis and interaction principles

The interface should feel like a well-run evidence room: calm, dense enough to inspect, and explicit
about provenance. The workflow column explains the next action; the evidence rail shows what has
happened. Technical facts use monospace but never replace a human-readable summary.

1. Show the trust boundary before the action.
2. Preview the exact public payload before wallet authorization.
3. Make state changes named, time-bounded where possible, and recoverable.
4. Keep receipts persistent; do not replace them with transient toasts.
5. Use status icon, label, and supporting text together.
6. Put the compliance caveat beside the result it qualifies.

## 9. Trust-sensitive copy

Preferred: “authorized issuer,” “credential integrity result,” “document fingerprints match,”
“active on testnet,” “simulated anchor,” and “near-real-time updates.”

Banned: “verified business,” “approved,” “compliant,” “trusted company,” “bank-ready,”
“regulator-approved,” “real-time streaming,” “production-ready,” or language implying that
SelyoPass made the institution's decision.

Errors state what happened, whether anything was submitted, and the next safe action. Loading labels
name the work: “Simulating transaction…”, “Awaiting wallet approval…”, “Checking contract events…”.

## 10. Responsive behavior

At desktop widths the workspace uses a primary workflow column plus a 280–340px evidence rail. At
tablet widths the rail follows the workflow while preserving evidence order. At mobile widths the
page becomes one column with a linear stepper and expandable technical details. The primary action
may be sticky only when it does not hide content, browser chrome, errors, or the final Explorer link.
Long addresses and hashes wrap or truncate with an accessible copy affordance.

## 11. Accessibility

Target WCAG 2.2 AA. Body text and UI controls meet contrast requirements; focus uses a visible 3px
ring; touch targets are at least 44×44px; headings and landmarks follow document order; errors are
programmatically associated with fields; status updates use polite live regions; dialogs restore
focus; every interaction works by keyboard; reduced-motion users receive state changes without
transition dependence. Axe plus manual keyboard and viewport checks are release gates.

## 12. Design decisions

| Decision | Reason | Evidence status |
|---|---|---|
| Evidence-ledger direction | Matches institutional inspection and discourages false approval framing | user-approved target direction; document draft and runtime unverified |
| Hash routes | GitHub Pages supports direct refresh without server rewrites | planned |
| Wallet at point of action | Public checking stays frictionless and authorization stays legible | planned |
| Persistent evidence rail/section | Transaction and privacy facts remain visible during work | planned |
| No bitmap imagery | Product state and provenance carry the meaning | user-approved target; document draft |

## 13. Evidence and exclusions

Required design evidence: screenshots at 390×844, 768×1024, and 1440×900; keyboard-only completion;
focus visibility; touch-target measurement; overflow and sticky-action checks; reduced motion;
empty/loading/pending/success/failed/rejected/expired/revoked states; axe results; console log; and
comparison with this reference lock. Until captured from the production build at a release SHA,
these are requirements—not accomplishments.

Live Refero Pro research, stock imagery, generated imagery, dark mode, non-Freighter/Albedo wallets,
mainnet, and Level 4 flows are excluded.

## References

- Dock, “Credential Verification”: https://www.dock.io/post/credential-verification
- Persona, “Inquiry lifecycle”: https://docs.withpersona.com/inquiries
- MetaMask, “Speed up or cancel a pending transaction”:
  https://support.metamask.io/manage-crypto/transactions/how-to-speed-up-or-cancel-a-pending-transaction
- Local Refero Design skill, version 1.1, and bundled typography, color, craft, copy, icon, motion,
  anti-AI-slop, and visual-workflow references.
