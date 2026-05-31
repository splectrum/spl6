# Chapter 2 — Documentation

**Status: ▶ in progress.**

Documentation prompts written here (spl6), executed by the
`the-world-of-splectrum` repo (the splectrum.world site, served from
`docs/`) through its own editorial process — submission → draft → blog
→ ref-lib absorption. We author prompt docs and submissions in *its*
voice (`tone-of-voice/`, `process/`, `posting-guide.md`); we do not
edit the published pages directly from here.

> Note: the cross-repo authoring pattern itself is a candidate spl tool
> — see `../tools/doc-dispatch.md`. For now the flow is manual:
> prompt/submission authored, executed in the doc repo's own context.

## Progress

The chapter grew into a full rework of the splectrum.world **engineering
section**, beyond the original page list below. Done so far (detail,
decisions, and backlog in `../documentation/engineering-structure.md`):

- **Structure** — the substrate→platform stack; neutral positioning
  Subjects per committed language; the Platform-weaves link model; the
  topic/history-driven subject criterion.
- **Subject phase (complete)** — Subjects for AVRO, Git, Kafka, URI, and
  XPath, plus persons (Cutting, Kleppmann, Torvalds, Kreps, Berners-Lee,
  Fielding, Clark).
- **Substrate layer (complete)** — AVRO, Git, Kafka, and the Addressing
  (URI/XPath) substrate pages reworked to lean form, linking out to the
  subjects.
- Positioning landing page updated for the engineering angle.

## Remaining — Infrastructure only

**Platform/Mycelium is deferred** to a dedicated post-POC sequence
(Chapters 5–7: design review → documentation → implementation). It is
the most transport-entangled layer, the POCs and integration will
surface what it actually needs, and the existing pillar is a mature
draft to *distil* rather than rewrite — so it waits until the code and
the vision have caught up. The substrate source copies in
`../documentation/content/` are its input. The spl5→spl6 retrospective
(was item 2.6 below) moves to Chapter 6 with it.

Chapter 2's remaining scope is therefore the **Infrastructure** pages —
reframed (May 2026) from a handful of pages into a **deep, steward-minded
documentation hub** on the bare + P2P + Pear stack: a community resource,
still the Infrastructure layer, neutral voice, structured for easy
refresh rounds. The full structure, page map, vision, information-
availability assessment, corrections, and refresh model are in
**`../documentation/infrastructure-hub.md`** (anchored on a late-May-2026
live research pass).

Foundation-first (what the Chapter 3 POCs need): HyperDHT + Hyperswarm,
Hypercore + Corestore, Pear platform + pear-runtime, and the key-model /
security basics. The rest (Autobase, UDX, relays, full ecosystem, the
"currently building" section linking pear-full-square POCs) fills in
parallel.

Note: the spl5→spl6 retrospective (was item 2.6) moved to Chapter 6.
