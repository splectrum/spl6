# Tasks

Working task list. The durable home for in-flight and queued work — checked in
so it survives sessions and stays out of the always-on context window. Update
as work moves; the git log is the history.

Status: ⬜ pending · 🔄 in progress · ✅ done (drop when stale).

## In progress

- 🔄 **Chapter 4 — Mycelium design.** Round 1 (opaque bytes) design doc written
  (`plan/mycelium-design.md`). Round 2 (AVRO/semantic layer) deferred to spl7.

## Queued

- ⬜ **spl7 preliminary plan.** Shape the next project's scope and carry-forward items.
- ⬜ **spl6 closure.** Wrap up, final state, hand off to spl7.

## Done (spl6)

- ✅ **Chapter 1 — Initialisation.** Migration baseline; 73 tests green on TCP.
- ✅ **Chapter 2 — Documentation.** Engineering structure, subject phase, substrate
  layer, Infrastructure hub on splectrum.world.
- ✅ **Chapter 3 — P2P transport POCs.** Every load-bearing primitive proven under
  Bare. Catalogue: `p2p-building-blocks.md`.
- ✅ **Swarm app** (`poc/p2p-docker-dev/phase-7-swarm-app/`). All 7 phases:
  seed/peer, browser UI, apps/code mobility, FUSE drive + local execution,
  world view drive, read-write FUSE. Design: `phase-7-swarm-app/design.md`.

## Carries forward to spl7

- ⬜ Mycelium POC — prove the Chapter 4 design against the fs/TCP oracle
- ⬜ Mycelium design Round 2 — AVRO, schema-aware XPath/URI, schema evolution
- ⬜ Kafka topics — data change event streams
- ⬜ Pear documentation pages (splectrum.world)
- ⬜ Platform pillar design review + documentation (three-pillar distillation)
- ⬜ Infrastructure (private swarm, HiveRelay, git-on-Hyperdrive)
- ⬜ Doc-freshness agent routine + ecosystem discovery
- ⬜ Backlog: harness-as-direct-RPC-client, context stream types,
  test runner auto-start/stop, CLI help rendering
