# Playbook: interview & validation (Mom Test scripts + logging said/did/paid)

## Before the interview

- Pick someone in the target segment you can actually reach.
- Goal: learn how they behave today, not pitch your idea.
- Rule: do not describe your solution until the very end, if at all.

## The script (anchor in past behavior)

1. "Tell me about the last time you ran into <the problem>. Walk me through it."
2. "How do you handle it today?"
3. "What have you tried before? Why did you stop?"
4. "How much time/money does this cost you, roughly?"
5. "What happens if you just… don't deal with it?"
6. (Only at the end) "I'm working on something here — would it be useful? Why?"

Questions 1–5 generate `did`/`paid` evidence. Question 6 only ever generates
`said` — treat it as the weakest signal.

## Questions that poison your data (don't ask)

- "Would you use a tool that…?" → invites a polite, meaningless yes.
- "Don't you hate it when…?" → leads the witness.
- "How much would you pay for…?" → hypothetical pricing is fiction.

## Logging evidence

Right after each interview, write distilled callouts (see `interviewer.md`):

```
> [!evidence] Type: did | Source: interview-04 | Date: 2026-02-05
  (one line: the behavior, compliments stripped)
```

Classify strictly:

- Built/used a workaround, spent time, switched something → **did**
- Deposit, pre-order, paid pilot, signed LOI → **paid**
- Everything else (opinions, intentions, compliments) → **said**

## Turning interest into evidence

If all you have is `said`, ask for a small real commitment to convert it:

- "Can I set you up with the manual version this week?" (→ did, if they say yes
  and actually use it)
- "Would you put down a $X deposit to hold a pilot slot?" (→ paid, if they do)

A no here is data, not defeat. It tells you the pain isn't urgent enough yet.

## The floor vs the target

- **Linter floor:** ≥3 behavioral items, ≥3 distinct sources, ≥1 paid. The
  minimum to stop freezing on vibes.
- **Real target:** ~10 behaviorally-backed conversations. The floor is not
  permission to stop interviewing.
