# Playbook: research prompts

Prompts for the `researcher` subagent. All outputs are **leads to verify**, not
truth. Every returned claim must carry a source + date so it can become a
candidate `[!evidence]` tag.

## Find where the segment congregates

> Where do <segment> gather online and offline? List 5+ specific communities
> (subreddits, forums, Slack/Discord groups, associations, conferences) with
> links. For each, estimate how active it is and whether I can post/ask there
> this week.

## Mine for the current workaround

> In <community>, find threads where people describe how they currently handle
> <problem>. Prioritize detailed descriptions of manual workarounds over
> general complaints. Return quotes with links and dates. Flag any thread with
> high engagement (upvotes/replies) as a documented pattern.

## Bottom-up sizing

> Estimate the number of <segment> that exist and are reachable. Build it
> bottom-up from a concrete count (e.g. number of businesses of type X in
> region Y), not top-down from a market-size report. Multiply by a realistic
> price to get an order-of-magnitude band. Show your arithmetic and sources.

## Alternatives teardown

> List the top 3 ways <segment> solves <problem> today, including "do nothing"
> / spreadsheet. For each, name the single biggest source of friction or
> failure. Cite where you saw evidence of each being used.

## Vanity-metric check

> For any traction or demand signal you find, classify it as interest (clicks,
> signups, upvotes) or demand (behavior change, payment). Flag anything being
> presented as demand that is really just interest.
