# Chapter 7 — Platform implementation

**Status: ⬜ not started.** Realises the settled Platform design
(Chapter 5, rendered in Chapter 6) in the spl6 codebase.

Largely physical/autonomous work once the design is agreed: bring the
running code into line with the reviewed design — close the gaps between
what spl6 proves today and the distilled Platform vision.

## Likely scope (refined by Chapters 5–6)

- Resolve the namespace drift in code (the `splectrum.*` vs `mycelium.*`
  operator naming settled in Chapter 5).
- The client-server resolution change — thin client-side resolver →
  local peer; server owns namespace dispatch
  (`../open-questions/client-server-resolution.md`).
- Whatever the code-grounding pass flagged: the re-entry / `dispatch()`
  seam, and any hardening identified during the review.
- New mechanics that firmed up enough to build (e.g. `concept`
  alongside `protocol`, type-resolution behaviour) — only where settled.

## Iteration is expected

Implementation will teach us more; the docs (Chapter 6) get a
reconciliation touch-up where the build refines the design. That loop
is the method working, not drift — keep the settled/open line honest as
it moves.
