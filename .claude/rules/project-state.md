# Project State

Snapshot of where the work stands. Update at commit points
when the state shifts. Reflects current reality, not history
— the git log is the history.

## spl6 — closed (2026-06-08)

All chapters complete. spl7 initialised as coordination repo at
`~/splectrum/spl7`. Workspace repos at `~/pear-full-square/`.
This repo is now a read-only reference.

### What spl6 delivered

**Chapter 1 — Initialisation.** Migration baseline from spl5; 73 tests
green on TCP. The working oracle.

**Chapter 2 — Documentation.** Engineering structure, subject phase,
substrate layer, Infrastructure hub on splectrum.world.

**Chapter 3 — P2P transport POCs.** Every load-bearing primitive proven
under Bare. Identity, connect-by-key, protomux, replication, code
mobility, isomorphic-git, reactive dataflow. Catalogue:
`plan/p2p-building-blocks.md`.

**Swarm app (7 phases).** Bridgehead container, FUSE Hyperdrive
(read-write), code mobility, world view drive, browser UI. Architecture
settled. Design: `poc/p2p-docker-dev/phase-7-swarm-app/design.md`.

**Chapter 4 — Mycelium design.** Round 1 (opaque bytes) design doc.
Substrate pages on splectrum.world reworked: git (repository management),
kafka (data streaming, authority split), uri (naming scheme, packed/unpacked
indifference, namespace mounts), xpath (pointer records, always-array).
URI naming scheme settled: `[_a-z0-9][a-z0-9]*`.

**spl7 preliminary plan.** Scope shaped, coordination repo initialised.

### Key design documents (reference for spl7)

- `plan/mycelium-design.md` — Round 1 design
- `plan/p2p-building-blocks.md` — POC catalogue
- `plan/swarm-picture.md` — swarm operating model synthesis
- `plan/spl7-preliminary.md` — spl7 scope and approach
