# Playbook — MVP vs Final scoping

How to split the feature set, and which of the 13 templates each stage needs.

## The MVP cut rule

Keep only what's required to:
1. deliver the **core value once** to a real user, and
2. produce a **learning signal** (do they come back / pay / change behavior?).

Everything else is "final." When in doubt, cut. The MVP is the smallest honest test of the
riskiest assumption (idea.md §9), not a small version of the whole product.

## A quick test per feature

For each candidate feature, ask:
- If this were missing, could a user still get the core value? → If yes, it's **final**, not MVP.
- Does it exist mainly to make us comfortable (settings, admin, polish)? → **final**.
- Does it directly test the riskiest assumption? → **MVP**.

## Which templates each stage needs

| Stage | Templates that come online |
|-------|----------------------------|
| **MVP** | `idea.md` → `03-prd` → `06-system-design` → `09-data-model` → `11-qa-test-plan` (+ `12-security-compliance` if any surface is exposed) |
| **Maturing** | `01-brd`, `02-mrd`, `04-frd`, `08-api-spec`, `10-design-system` |
| **Final / scale** | `05-srs`, `07-technical-design`, `13-release-gtm`, ongoing `_adr` |

> You don't generate all 13 for every project. Generate MVP docs first. Add a template only
> after you've twice wished you had it.

## Anti-pattern

Generating the full 13-doc set for an unvalidated idea. That's the factory-polishing trap: it
feels like progress and ships nothing. Run the MVP set, get it in front of users, expand from
real friction.
