# ReconLens — /docs (complete worked example)

Generated from `../idea.md` by the FMD factory. This is the reference for "what good output
looks like" — a complete MVP doc set with traceability flowing end to end.

- **FMD version:** 2.0.0
- **Domain:** fintech / AI / data
- **MVP doc set:** `idea.md` → PRD → system design → data model → security & compliance → QA plan
- **Emitted to project root:** [`../AGENTS.md`](../AGENTS.md)

## Traceability you can follow

```
idea.md §7  F-001..F-004
   └─► PRD  feature list (F-001..F-004) + business rules (BR-001..BR-004) + journey (UJ-001)
            └─► QA test plan  every F-### has ≥1 TC; BR-001..BR-004 each covered
system design ─► exposed API surface ─► security & compliance (auth + STRIDE)
data model    ─► append-only Resolution enforces BR-004
```

Security & compliance is included because the system has a network-exposed surface — the
manifest's condition for that doc. Everything else is the standard MVP set.

> Version is pinned so regenerating later is predictable (FMD §maintenance).
