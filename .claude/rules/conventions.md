# Working Conventions

How we collaborate on this repo. Update when a new
convention settles (comes up multiple times, or is
explicitly agreed).

## Task list lives in the repo

The working task list is `plan/tasks.md`, not the harness task tracker.

**Why:** The harness task list is injected into the context window on every
turn — it pollutes the view with standing state we don't need always-on. A
checked-in file is the durable home, survives sessions, and stays out of context
until consulted.

**How to apply:** Track in-flight and queued work in `plan/tasks.md`. Don't use
the harness Task tools for project tracking. (A short-lived harness checklist for
a single multi-step turn is fine, but clear it — don't let it persist.)

## Commit pace

Work first, think through, iterate. Commit when a coherent
piece is done, not as a reflex after each change.

**Why:** Premature commits create noise and force review of
half-baked states. Design decisions are still forming during
implementation — commits should reflect settled pieces.

**How to apply:** Keep working, testing, iterating. Commit
when the user asks, or when a complete, tested, coherent
piece of work is ready.

## in-wonder ref lib docs are submissions

Docs created in `docs/ref-lib/` are submissions to the
in-wonder ref lib, processed editorially before inclusion.
They are not direct copies of the live ref lib pages.

**Why:** in-wonder has its own editorial process and voice.

**How to apply:** Write ref lib docs with clear reasoning
and narrative progression. Use whatever style works best
for the content — don't force alignment with existing ref
lib page style. Leave open areas explicitly marked rather
than forcing premature answers.

## Doc prompts carry content, not site mechanics

Prompts we author for `the-world-of-splectrum` carry **content and
conceptual structure only**. Leave **all site mechanics to the executor** —
URLs, redirects / link preservation, navigation, sitemap, breadcrumbs,
frontmatter fields, and physical file/directory layout. Likewise, never
reference spl6-internal paths or files in a prompt — the executor can't see
them.

**Why:** It has derailed the executor more than once — internal
source-of-truth paths, and a `pear.md`→`pear/` "redirect" that the site
treated as a non-issue anyway. Content/substance is ours; repo specifics and
voice are theirs. Prescribing site mechanics sends the agent chasing
non-problems.

**How to apply:** State *what* the page says and *how it's grouped*. Don't
state where files go, how URLs are preserved, or how nav/frontmatter is
updated. If a structural change has site implications, trust the executor to
handle them — and make the prompt self-contained (no external references).

## Synthesise reference docs properly; an agent keeps them fresh

For the engineering reference docs (e.g. the Infrastructure hub), prefer
**proper synthesised, implementation-grade pages** — our orientation and
structure + the gotchas + enough to implement from — over thin link-stubs
*or* verbatim upstream dumps. Accuracy against fast-moving upstream is held
by a **recurring freshness agent** (`plan/tools/doc-freshness-agent.md`)
that re-pulls each page's listed sources, diffs, auto-fixes mechanical
drift, and flags judgment calls — plus the same source-check at authoring.

**Why:** "Stay lean / don't clone to avoid maintenance" assumed *manual*
upkeep. With an agent doing freshness, depth is maintainable and drift
stops being a reason to keep pages thin. The drift/errors we hit (libjs,
versions, crypto) were authoring slips a source-check catches — not a case
against depth. The real anti-pattern is hand-writing a parallel spec **and
never re-checking it**; the fix is the re-check, not thinness.

**How to apply:** every reference page carries a Sources block (canonical
docs + repo/README + npm) — that's the anchor the agent re-checks. Author
against those sources; schedule the freshness agent to keep them current.
Link out for exhaustive API detail, but don't ship a page that's just a
link. **Target reader: an AI agent consulting the page to act** — give the
real names/signatures, the gotchas, the relationships, the sources, and
honest uncertainty markers; that also serves humans. (A wrong fact misleads
an agent that acts on it, so marking the uncertain matters *more*, not less.)
This test also governs **depth, structure, and page count** — not just
content. Split a topic into its own page when an agent would come looking
for *that thing on its own* (a distinct intent); keep it one page when it
wouldn't. Let "what would an agent want to find?" decide the shape.

## Pressure-point approach

We deliberately defer some infrastructure investments
(e.g., extracting a test framework module) until real
pressure surfaces. The risk is that under pressure we patch
instead of invest.

**Why:** Premature abstraction against speculative needs
ossifies shape badly. But patches-under-pressure calcify
worse.

**How to apply:** When pressure arrives on a deferred item,
do the proper investment, not a workaround. Track deferred
items on the roadmap *with their reason* so the reason can
be re-evaluated later — if the reason still applies, the
item can't quietly fall off.

## Settled vision on paper, calibrated

Put settled vision on paper — for public docs (a "reference point for
many") the logical design legitimately *leads* the code. But write only
what has **settled**, at a resolution that holds, and leave still-moving
parts **explicitly open** rather than prematurely pinned.

**Why:** Docs drifting from code is not a docs-ahead-of-code flaw — it's
evolution; short iterations clarify things. The failure mode is *over-
elaboration*: writing speculative detail at a resolution that hasn't
settled, which the next iteration then contradicts. The previous Platform
cycle overdid it.

**How to apply:** Decide what has settled before writing it (Chapter 5's
design review is the explicit gate for the Platform work). Mark open
parts open. Expect docs to be revised as iterations teach more — that's
the method, not drift.

## Distillation, not demolition

When reworking mature material (e.g. the three-pillar structure, Mycelium
in particular), *extract and ground* the matured core — don't rediscover
it from scratch.

**Why:** Earned structure carries real settled thinking. A "from the
ground up" rework means grounding the vision in the implemented code, not
blank-slating an asset that already holds.

**How to apply:** Sort existing content into mature-core (keep/distil),
over-elaborated (trim to settled), and drifted/open (reconcile or mark
open). New writing concentrates on genuine gaps and the weave points, not
re-deriving what stands.

## Memory flow: session bank → repo

Session memory is scratch space for in-flight work. Once
conventions or state observations settle, transfer them
into `.claude/rules/` (project-state.md for state, this
file for conventions) and commit. The memory bank remains
useful for the current session; the repo is the durable
home.

**Why:** Memory that's about the project and my persona in
it should follow the repo, not drift off with me across
sessions. User-personal preferences stay outside — nothing
of that kind belongs here.

**How to apply:** During a session, write to the memory
bank freely. At commit points and session end, sync what
has bedded in to these files. Delete the transferred
entries from the memory bank so there's one source of
truth.
