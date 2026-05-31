# Tool — doc-freshness-agent

Agent-backed **maintenance** of the engineering reference docs. Sibling to
`doc-dispatch.md`: doc-dispatch is agent-backed *authoring*; this is
agent-backed *freshness*. Together they make the doc lifecycle largely
autonomous — which is what lets us write proper synthesised pages (not thin
stubs, not verbatim dumps) without the drift cost (see the convention
"Synthesise reference docs properly; an agent keeps them fresh").

## Why it exists

The Bare + P2P + Pear stack ships multiple times a week; docs.pears.com
lags, READMEs are the real API, versions live on npm — a fragmented,
fast-moving target. Synthesised pages would drift if maintained by hand.
An agent re-checking each page against the sources it cites makes depth
sustainable.

## What it maintains

The `engineering/infrastructure` hub pages first (Bare, the P2P building
blocks, Pear, the In-House pages); extensible to any reference section.
Anchor for each page: its **Sources block** (canonical docs URL + GitHub
repo/README + npm package).

## Process per cycle

1. For each page, read it and its Sources block.
2. Fetch current upstream: npm registry JSON (`registry.npmjs.org/<pkg>`)
   for version + dist-tags + publish date; the GitHub README (raw) for the
   current API; the docs.pears.com page if one exists.
3. Diff page claims vs upstream; classify each discrepancy:
   - **Mechanical (auto-fix):** version numbers, dist-tag traps, dead/moved
     links, the page's freshness date / `lastmod`.
   - **Judgment (flag, don't silently rewrite):** API additions/removals,
     behavioural changes, renamed/removed modules or commands, structural
     reorganisations — anything where our synthesis/framing needs rethinking.
4. Emit a freshness report (per page: current state, what drifted, what was
   auto-fixed, what needs review, with upstream evidence + URLs).
5. Apply mechanical fixes; route judgment items to the authoring flow
   (doc-dispatch / a prompt doc). **Never touch site mechanics** — URLs,
   nav, layout, frontmatter plumbing are the site's (executor's) domain.

## Cadence

Periodic (≈monthly) or on-demand; a candidate scheduled routine once stood
up. Leans on `lastmod` + the per-page Sources block.

## Known gotchas (from the May-2026 research)

- npmjs.com *pages* 403 fetchers — use the **registry JSON API**.
- Some docs.pears.com leaf pages return only nav chrome — fall back to the
  **GitHub README** (raw).
- Check **dist-tags**, not just `latest` (e.g. `udx-native` latest vs next).
- READMEs lag npm and vice versa — record which source a version came from.
- Headless/cron caveat: interactively-authenticated MCP servers may be
  absent; plain web fetch of READMEs/docs/npm is fine.
- Never invent a version or API; flag anything unverifiable.

## The prompt (run each cycle)

> You are the documentation freshness agent for splectrum.world's
> engineering/infrastructure reference. The stack (Holepunch Bare + P2P +
> Pear) ships frequently; detect and correct drift between our pages and
> current upstream. Use WebSearch / WebFetch.
>
> For each page in scope:
> 1. Read the page and its **Sources** block (canonical docs URL, GitHub
>    repo/README, npm package).
> 2. Fetch current upstream — npm registry JSON
>    (`registry.npmjs.org/<pkg>`) for version + `dist-tags` + publish date;
>    the GitHub README via `raw.githubusercontent.com/<org>/<repo>/<branch>/README.md`
>    for the current API; the docs.pears.com page if one exists.
> 3. Diff what the page asserts against current upstream. Classify each
>    discrepancy as **mechanical** (version numbers, dist-tag traps,
>    dead/moved links such as docs.pear.sh→docs.pears.com or
>    `.html`→extensionless, the page's freshness date) or **judgment**
>    (API additions/removals, behavioural changes, renamed/removed modules
>    or commands, restructures — anything where our framing needs
>    rethinking).
> 4. Produce a freshness report: per page, what's current, what drifted,
>    what you auto-fixed, what needs review — each with upstream evidence
>    and URL.
> 5. Apply the mechanical fixes as content changes; route judgment items to
>    the authoring flow. Do **not** touch site mechanics (URLs, nav,
>    layout, frontmatter plumbing are the site's).
>
> Gotchas: npmjs.com pages 403 fetchers — use the registry JSON API. Some
> docs.pears.com leaf pages return only nav chrome — fall back to the
> GitHub README. Check `dist-tags`, not just `latest`. READMEs can lag npm
> and vice versa — note the version source. Flag anything you couldn't
> verify; never invent a version or API.

## Relation to the roadmap

A concrete autonomy step (Chapter sequence / `doc-dispatch`): pairs with
doc-dispatch as the maintenance half of agent-backed documentation. Stand
it up as a scheduled routine when the hub has enough synthesised pages to
be worth re-checking.
