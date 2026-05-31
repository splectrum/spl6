# Chapter 6 — Platform documentation

**Status: ⬜ not started.** Renders the settled design from Chapter 5
into the public splectrum.world engineering section (the
`the-world-of-splectrum` repo). Follows the same author-here /
execute-there workflow as Chapter 2.

## Principle: write the settled vision, calibrated

Putting settled vision on paper is valuable in its own right — for a
"reference point for many" the logical design legitimately *leads* the
code. The discipline is restraint: write what has **settled** (per
Chapter 5), at a resolution that holds, and leave the still-moving parts
**explicitly open** rather than prematurely pinned. The previous cycle
over-elaborated; this round does not repeat that. Evolution will revise
these pages again — that is expected, not drift.

## Scope

The Platform section rework, distilling the mature pillar (not a
rewrite). Bulk of new writing is the weave point + the few genuine gaps,
not re-deriving what already holds.

- **Mechanical reframe** — `engineering/splectrum/` → `engineering/platform/`;
  language pillar `splectrum/splectrum/` → `platform/dsl/` ("SPLectrum
  DSL"); section title → "SPLectrum Platform"; URL / internal-link /
  breadcrumb / sitemap fixups. (Folded in here, not done earlier — the
  page set may shift, so renaming rode along with the rework.)
- **Distil the Mycelium pillar** — carry the mature core forward,
  grounded against the code; trim the over-elaboration; reconcile the
  naming drift settled in Chapter 5.
- **The weave point** — Platform links *down* to Substrate (which
  language, which role) and *down* to Infrastructure (which module
  realises it). The Implementation sections move here off the (now lean)
  substrate pages: AVRO → avsc, Git → isomorphic-git. Kafka's "no module
  / native stream record" asymmetry surfaces here, as designed.
- **Genuine gaps** (only where they've settled too): the `concept`
  page; the Git memory model (gradient, consolidation, attention-shaped
  checkpointing); type-system / resolution; RPC-as-boundary.
- **spl5 → spl6 retrospective** (was Chapter 2 item 2.6) — what spl5
  proved, what carries forward, what the P2P transport changes. Belongs
  here: "what P2P changes" is only clear after the POCs and integration.

## Link model (already settled, applied here)

Higher layers link down; lower layers stay standalone. Substrate and
Infrastructure do not interlink and do not reference Platform. Platform
is the only weave point. Engineering pages may link *out* to neutral
positioning Subjects for background.
