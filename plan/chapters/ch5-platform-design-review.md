# Chapter 5 — Platform design review

**Status: ⬜ not started.** Runs after Chapter 4 (swarm transport
integrated into spl), so the review sees the real, transport-integrated
system with the POC insights in hand.

This is the logical/interactive chapter — human in the loop on meaning
and direction. Its output is a **settled design proposal** for the
SPLectrum Platform (the three pillars, Mycelium first), grounding the
vision in what the code actually does.

## Stance: distillation, not demolition

The three-pillar structure has earned its shape, and Mycelium in
particular carries real, settled thinking (the fabric primitive,
carrier/meaning, defined vs applied operators, the message onion,
POV / data-vs-functional axes). This chapter **extracts** that mature
core — it does not rediscover it. The existing pages are a strong,
mature draft to be distilled and grounded, not a teardown.

## What the review separates

Run an extraction pass over the existing Platform pillars and sort
their content into three buckets:

1. **Mature / settled core** — keep, distill, ground against the code.
2. **Over-elaborated** — the previous cycle wrote detail at a resolution
   that hadn't settled, and evolution then moved past it. Trim back to
   what is actually settled.
3. **Drifted / open** — reconcile or mark open. Known items:
   - Namespace drift: `spl.splectrum.*` vs `spl.mycelium.*` operator
     references (e.g. `spl.splectrum.operator.noop` in `message.md`),
     compounded by the pillar rename (`splectrum/` → `platform/`,
     language pillar → `dsl/`).
   - The `concept` namespace (meaning context for data) pairs with
     `protocol` (meaning context for operations) — does it land?
     At what altitude?
   - Type system / resolution (physical vs logical, resolution axes,
     versioning-as-resolution), RPC-as-constitutive-boundary, the Git
     memory gradient, the Kafka logical-type spectrum — present in the
     substrate source copies (`../documentation/content/`), absent or
     thin in the current pillar. Decide which have settled enough to
     carry forward.

## Code grounding (absorbs `code-analysis-before-p2p`)

The migration carried spl5 forward like-for-like, so latent issues came
with it. This chapter is the structured analysis of the migrated +
integrated codebase that the old open question scheduled — relocated to
*after* integration, where the full transport reality is visible. Known
threads:

- **Server-repo-bound resolution / client-server model.** The global
  `spl` binds handler + schema roots to the server process's own repo;
  the client-server selection model is implicit. The proposed direction
  (thin client-side resolver → local peer; server owns namespace
  dispatch) is the local form of the P2P dispatch model. Full statement
  and decisions: `../open-questions/client-server-resolution.md`. Settle
  it here.
- **Unused re-entry seam** — no orchestrator type exercises internal
  `dispatch()`; the seam is designed-for but unexercised. Decide whether
  the design keeps, exercises, or drops it.

## Output

A written design proposal in `plan/` (or `plan/documentation/`):
- the distilled Platform/Mycelium design, settled parts marked settled
  and open parts left explicitly open;
- the **weave point** — which module realises each committed language
  (AVRO → avsc, Git → isomorphic-git, Kafka → native stream record /
  no module, XPath/URI → mycelium's own navigator);
- the code-grounding findings and the client-server resolution decision.

This proposal is the spec that Chapter 6 (public documentation) renders
and Chapter 7 (implementation) realises.
