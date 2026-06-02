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

## Current status (2026-06-03)

| Chapter | State |
|---|---|
| 1 — Initialisation | ✅ complete (migration baseline + spl6 identity; 73 tests green on TCP) |
| 2 — Documentation | ✅ substantially complete — engineering structure, subject phase, substrate layer, Infrastructure hub done. Remaining (Pear pages, tools) parked |
| 3 — P2P transport POCs | ✅ complete — every load-bearing primitive proven under Bare (identity, connect-by-key, protomux, replication, code mobility, native git, reactive dataflow). Catalogue: `p2p-building-blocks.md` |
| 4 — Mycelium design | ▶ next — proper design of the native Mycelium fabric, grounded in spl's proven core and the POC primitives |
| 5 — Mycelium POC | ⬜ prove the design — the fabric's core running, validated against the fs/TCP oracle |

**spl6 closes after Chapter 5.** spl6's arc: migrate the proven fabric →
explore the P2P substrate → design Mycelium → prove it. The build-out
(Platform implementation, infrastructure, production) is the next era.

### What moved out of spl6

The original Ch4–8 (integration, platform design/doc/impl,
infrastructure) assumed a longer arc — transport swap → platform
cycle → production. The POCs and the design work showed that P2P is
a substrate that reshapes the fabric, not a pipe swap. A proper
Mycelium design + POC closes spl6's job (carry spl5 onto P2P
infrastructure, prove it works). Building and shipping the native
Mycelium is the next project's work.

Parked items that carry forward:
- Pear documentation pages (splectrum.world)
- Platform pillar design review + documentation (the three-pillar distillation)
- Infrastructure (private swarm, HiveRelay, git-on-Hyperdrive)
- doc-freshness agent, ecosystem discovery
- Backlog: harness-as-direct-RPC-client, context stream types,
  test runner auto-start/stop, CLI help rendering

## Open questions

See `open-questions/`:
- `test-strategy.md`
- `client-server-resolution.md` — global `spl` as client-side resolver;
  carries forward to the next project
- `bare-for-pear-contribution.md`
