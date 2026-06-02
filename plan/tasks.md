# Tasks

Working task list. The durable home for in-flight and queued work — checked in
so it survives sessions and stays out of the always-on context window. Update
as work moves; the git log is the history.

Status: ⬜ pending · 🔄 in progress · ✅ done (drop when stale).

## In progress

- 🔄 **Chapter 4 — Mycelium design.** Proper design of the native Mycelium fabric.
  The exploratory notes (`mycelium-streaming-layer.md`, `streaming-fabric.md`) and
  the proven POC primitives (`p2p-building-blocks.md`) are input — the design is a
  fresh exercise that grounds spl's proven core onto the log substrate. Deliverable:
  a design document clear enough to build a POC against.

## Queued

- ⬜ **Chapter 5 — Mycelium POC.** Prove the Chapter 4 design — the fabric's core
  running, validated against the fs/TCP oracle. Scope shaped by the design.

## Done (spl6)

- ✅ **Chapter 1 — Initialisation.** Migration baseline; 73 tests green on TCP.
- ✅ **Chapter 2 — Documentation.** Engineering structure, subject phase, substrate
  layer, Infrastructure hub on splectrum.world. Remaining (Pear pages, tools) parked.
- ✅ **Chapter 3 — P2P transport POCs.** Every load-bearing primitive proven under
  Bare. Six phases (0–6), five committed probes. Catalogue: `p2p-building-blocks.md`.

## Parked (carries forward to the next project)

- ⬜ Pear documentation pages (splectrum.world)
- ⬜ Platform pillar design review + documentation (three-pillar distillation)
- ⬜ Infrastructure (private swarm, HiveRelay, git-on-Hyperdrive)
- ⬜ Doc-freshness agent routine + ecosystem discovery
- ⬜ Backlog: harness-as-direct-RPC-client, context stream types,
  test runner auto-start/stop, CLI help rendering
