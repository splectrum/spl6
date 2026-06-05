# Project State

Snapshot of where the work stands. Update at commit points
when the state shifts. Reflects current reality, not history
— the git log is the history.

## Last session (2026-06-04/05) — infrastructure built, mycelium module working

Built the infrastructure stack and the mycelium base layer module.
Proved git on Hyperdrive, FUSE mount, and CRUD + XPath over git.
Platform vision settled. Five repos across three orgs.

### Repos created

**bare-for-pear/isomorphic-git** — fork 1. Full isomorphic-git + Hyperdrive
fs adapter + BARE.md. Runs on both bare-fs and Hyperdrive. Round-trip
proven (bare-fs → Hyperdrive → bare-fs, all objects identical).

**bare-for-pear/p2p-git** — fork 2. Stripped to plumbing only (8,336 lines
removed, 78 files deleted). Entry point: `src/plumbing.js`. All operations
pass under Bare.

**pear-full-square/hyperdrive-fuse** — read-only FUSE mount for Hyperdrive
v11. The drive is a window into the swarm. Runs under Node.js (FUSE needs
node builtins). Interactive mode for browsing.

**pear-full-square/mycelium** — the base fabric layer. CRUD + XPath over
git. Two interfaces: internal (plain functions, throw on error) and
external (Kafka record dispatch via mapper). Proven under Bare.

### Key findings

- writeBlob/writeTree/writeCommit return OID strings directly (not {oid})
- Hyperdrive directories are implicit (mkdir/rmdir are no-ops, Stats needs
  implicitDir flag)
- FUSE handlers must be async-compatible (sync fs calls deadlock the event
  loop)
- fuse-native is Node.js only (requires os, fs, child_process)
- FUSE is built into WSL2 kernel (no custom kernel needed)
- WSL2 FUSE mounts visible from Windows via \\wsl$\

### Architecture settled

- **mycelium** = one module blending git + xpath + (later topic + URI)
- Internal API: plain functions (select, read, get, put, remove, commitTree)
- External API: single Kafka record dispatch mapper at the boundary
- Internal functions throw on fatal error — no hidden conditional routes
- git's role = transaction mechanism; happy path only, error on conflict
- select always returns array; will evolve to return Kafka records when
  topics land

## Working end-to-end

Chapter 1 migration on TCP: 73 tests passing. Unchanged.

## In progress

**Documentation.** Document the work done: infrastructure modules, probes,
mycelium module, the repos, the architecture decisions.

### Documentation completed

- READMEs for all four new repos (isomorphic-git, p2p-git, hyperdrive-fuse,
  mycelium)
- Site pages created for all new modules via content prompts (processed by
  site agent — bare-for-pear and pear-full-square landing pages updated,
  individual module pages created)
- MIT licenses on all repos (dual copyright where built on upstream)
- Org profiles for all three GitHub orgs (splectrum, bare-for-pear,
  pear-full-square)
- Upstream CI workflows removed from both forks
- p2p-git: updateIndex restored (transaction staging), README reframed as
  "minimal git engine for embedding" with transaction model (writeBlob →
  updateIndex → commit)

### Substrate and Mycelium content pages (in progress)

In `plan/documentation/content/` — not yet submitted to site:
- substrate-git.md, substrate-kafka.md, substrate-uri.md, substrate-xpath.md
  (our brand of each paradigm, adoption scope)
- mycelium-index.md, mycelium-fabric.md, mycelium-xpath.md,
  mycelium-vocabulary.md (first-pass, need rethinking)
- mycelium-overview.md (bullet-point working doc)

## Next up

1. **Swarm app** — join a swarm, expose a read-only FUSE drive with
   available apps. Like an install experience. WSL2 as the local peer,
   Docker containers as swarm peers, private DHT on localhost.
2. **Substrate pages** — submit our brand of git, kafka, URI, XPath
   to the site (needs proper discussion first)
3. **Mycelium pages** — rethink and submit (landing, fabric, xpath,
   vocabulary)
4. **Kafka topics** — when the platform needs data change event streams
5. **Chapter 5 — Mycelium POC** closes spl6
