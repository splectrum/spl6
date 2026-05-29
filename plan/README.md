# spl6 Plan — living

The working plan for spl6, organised so each part can evolve as we
execute. The original seed plan is frozen at `initialise/plan.md`; this
folder is the source of truth from here on.

## How this folder is organised

- **`overview.md`** — context, landscape, and the unified approach
  (the why/what). Stable.
- **`chapters/`** — one file per chapter; the executable plan and its
  status. Chapters evolve here as they're worked.
- **`open-questions/`** — decisions deferred for later, one per file,
  each noting *when* it should be addressed.
- **`tools/`** — specs for candidate spl tools surfaced along the way.
- **`references.md`** — running list of external resources (not vetted).
- **`documentation/`** — working notes/decisions for the splectrum.world
  docs workstream (engineering-section structure, etc.).

## Current status (2026-05-29)

| Chapter | State |
|---|---|
| 1 — Initialisation | ✅ complete (migration baseline + spl6 identity; 73 tests green on TCP) |
| 2 — Documentation | ▶ in progress — engineering structure + subject phase (AVRO/Git/Kafka/URI/XPath subjects + persons) + substrate layer done; Platform/Mycelium + P2P/Pear pages remaining (see `documentation/`) |
| 3 — P2P transport POCs | ⬜ |
| 4 — spl6 integrations | ⬜ |
| 5 — Infrastructure | ⬜ |

Order: migration → documentation → POCs → integration.

## Open questions

To address *after the POCs* unless noted — see `open-questions/`:
- `chapter-ordering.md`
- `test-strategy.md`
- `bare-for-pear-contribution.md`
- `client-server-resolution.md` — global `spl` as client-side resolver
- `code-analysis-before-p2p.md` — harden the migrated base before Ch4

## Candidate tools

See `tools/`:
- `doc-dispatch.md` — agent-backed cross-repo authoring; Chapter 3 POC
  use-case, Chapter 4 integration target.
