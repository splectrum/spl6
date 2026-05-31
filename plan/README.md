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
| 2 — Documentation | ▶ in progress — engineering structure + subject phase (AVRO/Git/Kafka/URI/XPath subjects + persons) + substrate layer done; **remaining scope now Infrastructure pages only** (Pear/Hyperswarm/Hypercore/P2P-security/Bare) — Platform deferred to Ch5–7 |
| 3 — P2P transport POCs | ⬜ |
| 4 — spl6 integrations | ⬜ swarm transport into spl (additive; TCP stays) |
| 5 — Platform design review | ⬜ ground vision in integrated code + POC insights; distil the mature pillar; produce the design proposal |
| 6 — Platform documentation | ⬜ render the settled design on splectrum.world; carries the spl5→spl6 retrospective |
| 7 — Platform implementation | ⬜ realise the reviewed design in code |
| 8 — Infrastructure | ⬜ private swarm, HiveRelay, git-on-Hyperdrive (production infra — last) |

Order: migration → documentation (infra) → POCs → integration →
platform (review → document → implement) → infrastructure. Platform
sits *after* integration deliberately: it is the most transport-
entangled layer, so the POCs and the integration teach it what it
needs, and its mature pillar is distilled rather than rewritten.

## Open questions

To address *after the POCs* unless noted — see `open-questions/`:
- `chapter-ordering.md`
- `test-strategy.md`
- `bare-for-pear-contribution.md`
- `client-server-resolution.md` — global `spl` as client-side resolver;
  now scheduled into Chapter 5 (Platform design review)
- (`code-analysis-before-p2p.md` — resolved: absorbed into Chapter 5)

## Candidate tools

See `tools/`:
- `doc-dispatch.md` — agent-backed cross-repo authoring; Chapter 3 POC
  use-case, Chapter 4 integration target.
