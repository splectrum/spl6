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

## Current status (2026-06-05)

| Chapter | State |
|---|---|
| 1 — Initialisation | ✅ complete (migration baseline + spl6 identity; 73 tests green on TCP) |
| 2 — Documentation | ✅ complete — engineering structure, subject phase, substrate layer, Infrastructure hub. Repos, licenses, org profiles done |
| 3 — P2P transport POCs | ✅ complete — every load-bearing primitive proven under Bare. Catalogue: `p2p-building-blocks.md` |
| 4 — Mycelium design | 🔄 Round 1 (opaque bytes) written (`mycelium-design.md`). Round 2 (AVRO/semantic) deferred to spl7 |
| Swarm app | ⬜ next — join a swarm, FUSE drive with available apps, WSL2 + Docker peers, private DHT |

**spl6 closes after the swarm app.** spl6's arc: migrate the proven
fabric → explore the P2P substrate → design Mycelium (Round 1) → prove
the swarm primitives compose into a working app. Mycelium POC and the
build-out carry forward to spl7.

### Carries forward to spl7

- Mycelium POC — prove the Chapter 4 design against the fs/TCP oracle
- Mycelium design Round 2 — AVRO, schema-aware XPath/URI, schema evolution
- Kafka topics — data change event streams
- Pear documentation pages (splectrum.world)
- Platform pillar design review + documentation (the three-pillar distillation)
- Infrastructure (private swarm, HiveRelay, git-on-Hyperdrive)
- Doc-freshness agent, ecosystem discovery
- Backlog: harness-as-direct-RPC-client, context stream types,
  test runner auto-start/stop, CLI help rendering

## Open questions

See `open-questions/`:
- `test-strategy.md`
- `client-server-resolution.md` — global `spl` as client-side resolver;
  carries forward to the next project
- `bare-for-pear-contribution.md`
