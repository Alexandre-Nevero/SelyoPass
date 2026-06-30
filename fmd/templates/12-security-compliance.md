# Security & Compliance / Threat Model

> **Purpose:** risk and obligations. **Default to flagging missing auth on any exposed surface.**
> Traces back to: system design, data model, SRS.

## Data classification
<!-- Categories (public/internal/PII/secret) and where each lives. Pull from data model. -->

## Authn / authz model
<!-- How identity is established and how access is granted per resource/operation. -->

## Threat model
<!-- STRIDE-style pass: Spoofing, Tampering, Repudiation, Info disclosure, DoS, Elevation.
     For each relevant threat: vector, impact, mitigation. -->

| Threat | Vector | Impact | Mitigation |
|--------|--------|--------|------------|

## Compliance obligations
<!-- Regulations/standards that apply and how the system satisfies them. -->

## Secrets handling
<!-- Where secrets live, rotation, who can access. Never inline a secret value anywhere. -->

## Audit & logging
<!-- What's logged for security/audit, retention, and what must NOT be logged (e.g. secrets, PII). -->

## Incident response basics
<!-- Detection, escalation path, rollback, who to notify. -->
