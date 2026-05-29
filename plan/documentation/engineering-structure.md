# Documentation — engineering section structure

Working notes/decisions for the splectrum.world **engineering** section
(`the-world-of-splectrum` repo, `docs/engineering/`). We author doc
prompts here; the site is executed and maintained there.

Public documentation is a **core, ongoing workstream** — splectrum.world
aims to be a reference point for many, so structure and clarity carry
real weight, not just for spl6.

## Workflow — who does what

For each page/subject: **Claude (here in spl6) does the research and
proposes the content** — the substance, the structure, the grounding,
the links. **The agent (in `the-world-of-splectrum`) executes** — it
renders the proposed content into the site in its voice and conventions,
places it, updates indexes, runs the pipeline. Content/substance is Claude's;
**tone-of-voice and all repo specifics are the agent's** — Claude does
not fuss over voice. (This refines the earlier "prompts authored here,
executed there": the prompt carries the proposed content. Note: the
first AVRO run used the earlier research-and-author prompt, so the agent
is researching and writing it; the content-proposed-here model applies
from the next subject onward.)

## Agreed — role-name principle

Reserve "SPLectrum" for the brand: the philosophy, and the section title
"SPLectrum Engineering." Inside engineering, name every layer by its
**role**. This resolves the overload across the four uses of the word:
SPLectrum (philosophy) · SPLectrum Engineering (the section) · SPLectrum
Platform (the core solution) · SPLectrum DSL (a pillar).

## Agreed — link model: Platform weaves; foundations stay separate

Substrate and Infrastructure are **separate concerns and do NOT
interlink.** Substrate is the *logical* commitment (the languages and
their roles); Infrastructure is the *physical* third-party software.
Keeping them unlinked enforces the logical/physical separation (an
engineering commitment).

The **Platform** is the weave point: it links *down* to both — to
Substrate (which languages it commits to, for which role) and to
Infrastructure (which modules realise them). "AVRO realised via avsc",
"Git via isomorphic-git", "Kafka as the native stream record",
"XPath/URI via mycelium navigation" are **Platform** statements, not
substrate or infrastructure ones — and the Kafka asymmetry (no module)
surfaces here, at the weave point, not on the substrate page.

Reference direction overall: higher layers link down; lower layers are
**standalone** and don't reference what's built on them. This also fixes
the "AVRO page bleeds into platform" issue — platform-level usage lives
on Platform pages.

Separate axis — **engineering → positioning**: any engineering page may
link *out* to a Subject for neutral background (not a stack link).

## Agreed — the engineering stack (bottom-up)

A layered stack that grows upward. Organic growth: build the landing
page with the full desired stack now, holding pages where there's no
content yet.

1. **Engineering Commitments** — the why.
2. **Infrastructure** — third-party runtimes/platforms/modules (Bare,
   Pear, bare-for-pear). ← Chapter 2 P2P docs land here (Pear rewrite,
   Hyperswarm, Hypercore/Hyperdrive, P2P security, Bare refresh).
3. **Substrate** — the committed languages, sitting on top of
   infrastructure as the platform's foundation. Four roles —
   **what** (AVRO/structure), **when** (Git/historicity),
   **where** (XPath/URI — navigation/addressing), **motion**
   (Kafka/mobility).
4. **Platform** — the SPLectrum Platform: pillars Mycelium ·
   SPLectrum DSL · HAICC. ← spl6 direction / retrospective.
5. **Tools & Solutions** — built on the platform (coming).

## Agreed — renames (removes the `splectrum/splectrum/` nesting)

- Track: `engineering/splectrum/` → `engineering/platform/` ("Platform").
- Language-fabric pillar → "SPLectrum DSL", folder `platform/dsl/`
  (alongside `mycelium/`, `haicc/`).
- Fuller variant chosen over leaving the pillar as `splectrum/`. Needs
  URL / internal-link / sitemap fixups.

## Pending — Tools vs Solutions

Recommendation: **split into two layers.** Tools = reusable capabilities
on the platform (general, composable — e.g. `doc-dispatch`). Solutions =
assembled, domain-specific applications composing platform + tools (the
end-use answers). The site already carries top-level `tools/` and
`real-life/`, so the distinction has precedent. Both start as holding
pages.

## Active — substrate cleanup

Improve and clean up the substrate section. Direction:
- **Standalone pages.** No links to Platform *or* Infrastructure —
  substrate is its own (logical) concern. Move OFF the substrate pages:
  (a) platform-level usage (the AVRO page's RPC / process / protocol
  detail → Platform/Mycelium), and (b) the **Implementation** sections
  (avsc, isomorphic-git → Platform, the weave point).
- **Add an on-ramp.** The pages are dense for "a reference point for
  many." Each gets a plain-language opening (the job the language does)
  before the deep dive. Audience decision still open.
- (The Kafka "no implementation" asymmetry is no longer a substrate
  concern — substrate pages carry no implementation section at all. It
  surfaces at the Platform weave point.)

## Agreed — fourth substrate language: navigation/addressing (XPath/URI)

XPath/URI is a committed substrate language — the "where" axis
(addressing data at rest, distinct from Kafka's motion). The
architecture already speaks it: ancestor/descendant axes, forward-only
resolution, steps/predicates throughout (`spl.mycelium.xpath`, and the
AVRO page's axis vocabulary). URI covers external reference/addressing
(the uri protocols). Bar for substrate: an *existing external language*
with its own grammar that the platform **conforms to** (doesn't invent),
playing a *distinct structural role*. Set is now minimal and orthogonal:
what / when / where / motion. Keeps P2P in *infrastructure* —
Hyperswarm/Hypercore implement reach; the addressing *language* is
XPath/URI.

## Agreed — substrate technologies as Subjects

Each committed language (AVRO, Git, Kafka, XPath, URI) gets its **own**
Subject in the positioning Subjects A–Z (neutral, full-coverage, "on its
own terms", like the existing Domain-specific-languages subject), plus
related **Persons** (e.g. Cutting/AVRO, Kreps/Kafka, Torvalds/Git,
Clark/XPath).

- **Subjects are topic/history-driven, not mechanical per-language.** A
  committed language gets a Subject when it has topic / history / context
  *beyond the technical*; pure technical-spec material is engineering's
  domain (or just links to the upstream spec) — not a Subject. A Subject
  *explains and contextualises* on its own terms and links out to the
  authoritative spec for exhaustive detail; it is not a spec clone.
  Technical depth is welcome *within* a subject as part of the wider
  topic treatment; it's standalone *technical-only* material (no
  topic/history) that belongs in engineering — SPLectrum's own mechanics
  in Platform/substrate, the external spec linked from the subject — not
  a subject.
  - AVRO / Git / Kafka qualify (deep histories); **URI** qualifies (Web
    addressing, naming, identity-vs-location); **XPath** qualifies too —
    the axis/location-path navigation model, its history (W3C, James
    Clark, the XML/XSLT/XQuery family), the URI+XPath addressing stack
    (XPointer), and influence on JSONPath / CSS selectors / XQuery.
  - So the "where" axis = **two** complementary Subjects: URI (resource
    addressing) and XPath (within-structure navigation). *Reversed an
    earlier "XPath: no subject, DSL covers it" — DSL is a general field
    page and doesn't carry XPath's own history/model.*
- **Resonance rings stay philosophical.** The rings (Seed / Close
  affinity / Wider landscape / On the fence) grade *philosophical*
  proximity to the seed; engineering subjects are NOT compiled into
  them. Engineering does its own positioning via the engineering stack
  (infrastructure / substrate / platform). The Subjects A–Z is a shared
  neutral catalogue; the resonance rings and the engineering section are
  two separate "angle" consumers of it.
- **Two link axes, neutral/committed split (as agreed).** Within
  engineering: references flow down the stack. Engineering → positioning:
  the substrate page links out to the Subject for background. No
  SPLectrum angle on the Subject page; no background on the substrate
  page.
- **Neutral engineering-subject template.** `process/page-structure.md`'s
  subject template bakes in philosophical framing ("why this matters to
  SPLectrum", seed-principle connection). Engineering subjects follow it
  for *mechanics* (front matter, breadcrumb, Persons, See also, index
  format) but **drop the seed/SPLectrum sections** — neutral intro, no
  "why this matters to SPLectrum", See also to neighbour subjects/persons
  not seed/engineering. The engineering angle lives on the substrate
  page, which links in.
- **Single vs multi-page is editorial judgment, per subject.** Decided
  when authoring the prompt (in spl6), based on the specific content —
  not punted to the executor. The prompt specifies the structure; the
  executor renders it in the repo's voice/conventions.

Resulting substrate-page shape: the commitment + the structural role +
a link *out* to the Subject (background). **No link to infrastructure** —
the implementation realisation is a Platform concern. Lean.

Pipeline (engineering subjects): a **lighter research → author flow**,
NOT the philosophical submission → blog-conversation → absorption
pipeline. Reference material is factual, not conversational: research
the landscape, then author the pages. Length controlled by the broad-
coverage-with-internal/external-linking guideline.

Sequencing: the substrate cleanup now depends on the Subjects existing
(at least as holding pages) to link out to. Organic growth — stub the
Subjects, then lean substrate pages linking to them.

## Backlog — later threads

- **Anthropic / HAICC orbit** (after the substrate phase). The AI
  collaborator is constitutive of how SPLectrum is built (HAICC = the
  cognition fabric), so it belongs in the knowledge landscape. Likely:
  positioning subjects for **large language models** and **AI safety /
  alignment** (the latter resonates with the philosophy side), plus
  **Anthropic** / **Claude** and the founders (Dario & Daniela Amodei) as
  persons — and a **HAICC commitment** on the engineering side (which AI
  collaborator, and why), mirroring the subject + substrate-commitment
  pattern. Neutral and on its own terms (including alignment debates and
  criticism), transparent about the relationship — not advocacy. A
  distinct thread from the data-infrastructure substrate work.
- **"Where" substrate page** — commits to URI and XPath for
  addressing/navigation; links out to both the URI and XPath subjects.
- **Link-model visibility to the agent** — the engineering layer/link
  model lives only in spl6 notes; the agent can't see it. Consider
  putting it into the-world-of-splectrum as a structure note.
- **Narkhede / Jun Rao** — Kafka co-creators, credited but no page yet;
  candidates if they recur elsewhere.
- **XPath extensibility (for the Platform/Mycelium work).** XPath
  supports custom functions — extension functions (namespaced,
  host-supplied) since 1.0; inline + higher-order functions since 3.0;
  named user functions via XSLT/XQuery host languages. When reworking
  Platform/Mycelium navigation and designing spl's own XPath-conforming
  navigator, pin the design to the XPath 3.1 spec (function-call and
  higher-order-function sections, the extension-function rules) and
  expose spl's fabric-navigation functions in an spl namespace. spl owns
  the engine, so it controls the function set.
