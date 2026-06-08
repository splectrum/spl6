# Tasks

Working task list. The durable home for in-flight and queued work — checked in
so it survives sessions and stays out of the always-on context window. Update
as work moves; the git log is the history.

Status: ⬜ pending · 🔄 in progress · ✅ done (drop when stale).

## Done (spl6)

- ✅ **Chapter 1 — Initialisation.** Migration baseline; 73 tests green on TCP.
- ✅ **Chapter 2 — Documentation.** Engineering structure, subject phase, substrate
  layer, Infrastructure hub on splectrum.world.
- ✅ **Chapter 3 — P2P transport POCs.** Every load-bearing primitive proven under
  Bare. Catalogue: `p2p-building-blocks.md`.
- ✅ **Swarm app** (`poc/p2p-docker-dev/phase-7-swarm-app/`). All 7 phases:
  seed/peer, browser UI, apps/code mobility, FUSE drive + local execution,
  world view drive, read-write FUSE. Design: `phase-7-swarm-app/design.md`.
- ✅ **Chapter 4 — Mycelium design.** Round 1 design doc
  (`plan/mycelium-design.md`). Substrate pages on splectrum.world updated to
  reflect the design (git, kafka, uri, xpath reworked; naming scheme settled).
  Round 2 (AVRO/semantic layer) deferred to spl7.
- ✅ **spl7 preliminary plan.** Scope, carry-forward, approach shaped.
  Coordination repo initialised at `~/splectrum/spl7`.
- ✅ **spl6 closure.** Final state committed, hand off to spl7.

## Carried forward to spl7

- Mycelium POC — prove the Chapter 4 design on the P2P substrate
- Mycelium design Round 2 — AVRO, schema-aware XPath/URI, schema evolution
- Kafka topics — data change event streams
- Pear documentation pages (splectrum.world)
- Platform pillar design review + documentation (three-pillar distillation)
- Infrastructure (private swarm, HiveRelay, git-on-Hyperdrive)
- Doc-freshness agent routine + ecosystem discovery
- Backlog: context stream types, CLI help rendering
