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

## Workflow (cross-repo, with a sign-off gate)

The freshness update runs as a **four-stage loop across the two repos**, with
a sign-off gate before anything is committed. Separation of duties: **spl6
detects, verifies, and signs off; the-world-of-splectrum applies and
commits** — matching "doc prompts carry content, not site mechanics" (spl6
says *what*; the executor does the *how* and owns the commit).

1. **(spl6) Detect → update prompt.** The stage-1 freshness check (the prompt
   below) runs against the live pages — re-pull each page's Sources, diff,
   classify. Its output is **an update prompt** carrying the concrete changes
   (mechanical fixes spelled out old→new with the upstream evidence + URL;
   judgment items flagged for review). It does **not** apply anything.
2. **(the-world-of-splectrum) Apply.** The executor applies the update prompt
   to the pages — and **stops there; does not commit.**
3. **(spl6) Check.** The spl6 agent reviews the applied updates against the
   intended changes + upstream (the same review we run on authored pages),
   then **signs off** or sends corrections back to step 2.
4. **(the-world-of-splectrum) Commit on sign-off.** Once signed off, the
   executor commits.

No unreviewed freshness edit ever lands; a clean "nothing drifted" result
ends the loop at step 1 (no prompt to apply).

**Detection — what stage 1 classifies:**
- **Mechanical:** version / `@major` claims, dist-tag traps, dead/moved
  links, the page's `lastmod` / freshness date.
- **Judgment:** API additions/removals, behavioural changes, renamed/removed
  modules or commands, structural reorganisations — anything where the
  synthesis/framing needs rethinking. (Flagged with evidence, never silently
  rewritten.)

## Cadence

Periodic (≈monthly) or on-demand; a candidate scheduled routine once stood
up. Leans on `lastmod` + the per-page Sources block. When scheduled, the
routine fires **stage 1** (detect → update prompt); stages 2–4 are the
cross-repo handshake above (apply → check → commit-on-sign-off).

## Known gotchas (from the May-2026 research)

- npmjs.com *pages* 403 fetchers — use the **registry JSON API**. Prefer the
  **dist-tags endpoint** `registry.npmjs.org/-/package/<pkg>/dist-tags` — the
  monolithic `registry.npmjs.org/<pkg>` document truncates and gets mis-read;
  use `npm view <pkg> time` for publish dates. *(Confirmed in the first
  validation run, 2026-05-31.)*
- Some docs.pears.com leaf pages return only nav chrome — fall back to the
  **GitHub README** (raw).
- Check **dist-tags**, not just `latest` (e.g. `udx-native` latest vs next).
- READMEs lag npm and vice versa — record which source a version came from.
- Headless/cron caveat: interactively-authenticated MCP servers may be
  absent; plain web fetch of READMEs/docs/npm is fine.
- Never invent a version or API; flag anything unverifiable.

## The stage-1 prompt (spl6 detection → update prompt)

> You are the **stage-1 (spl6) freshness check** for splectrum.world's
> engineering/infrastructure reference. The stack (Holepunch Bare + P2P +
> Pear) ships frequently; **detect drift** between our pages and current
> upstream and **emit an update prompt** for the executor — you do **not**
> apply changes or commit. Use WebSearch / WebFetch.
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
> 4. Output an **update prompt** for the executor: per page, the concrete
>    edits to apply — mechanical fixes as old→new with the upstream evidence
>    and URL, and judgment items flagged for review with evidence. If a page
>    is current, record "current" (no edit). **Do not apply edits, do not
>    commit, and do not touch site mechanics** (URLs, nav, layout, frontmatter
>    are the executor's) — applying and committing are later stages.
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

**Becomes a proper SPLectrum tool** (not just this prompt + a manual
handshake) once we're doing SPLectrum/Platform work — the four-stage loop
above mediated by spl handlers, sibling to `doc-dispatch`. Backlog item;
don't build it before the Platform era.
