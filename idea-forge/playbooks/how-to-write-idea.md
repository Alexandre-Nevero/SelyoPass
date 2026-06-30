# Playbook: how to write idea.md

## Steps

1. Copy `schema/idea.template.md` to `idea.md` at the repo root.
2. Fill sections in ladder order: WHO (§2) → WHAT (§1) → WHY (§4) first, then
   the rest. It's fine to draft §1 after §2 — clarity on the person sharpens the
   problem.
3. Write §1 as if no solution exists. Re-read it: if you can guess the product
   from the problem statement, you've leaked a solution. Cut it.
4. For every factual claim in **Evidence** and **Market & alternatives**, attach
   a callout on the next line:
   ```
   > [!evidence] Type: said|did|paid | Source: <id-or-link> | Date: YYYY-MM-DD
   ```
   No real source yet? End the bullet with `[unverified]`. Don't invent one.
5. Fill the **four-tests** table honestly. A "Fail" is information, not shame.
6. State the **single riskiest assumption** and explicit **kill criteria** in
   §9. These are fail-states, not claims — they don't need evidence callouts.
7. Run the gate:
   ```
   lint/validate.sh idea.md
   ```
8. Fix what it flags. The most common rejection is the **evidence floor**: you
   have opinions (`said`) but not behavior (`did`/`paid`). The fix is not better
   writing — it's going and getting a `did` or `paid` signal.
9. When the linter exits 0, set `status: frozen` in the frontmatter and re-run to confirm APPROVE.

## Common rejections and what they really mean

| Linter says | What it really means |
|-------------|----------------------|
| evidence floor not met | You haven't talked to enough people who *did* something |
| need ≥1 'paid' | Nobody has put money or a binding commitment behind it |
| §1 solution-first language | You're in love with the solution, not the problem |
| untagged claim | You asserted a fact you can't source — go verify or mark it |
| missing section | You skipped a question that matters |

## The honest move

When the gate rejects you, the temptation is to soften the wording until it
passes. Don't. The gate is doing its job: telling you the validation isn't
there yet. Go get the evidence. That's the whole point.
