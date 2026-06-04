# Project State

Snapshot of where the work stands. Update at commit points
when the state shifts. Reflects current reality, not history
— the git log is the history.

## Last session (2026-06-04) — implementation started + platform vision emerged

Continued from the design session. Moved into implementation: forked
isomorphic-git, built and proved the Hyperdrive fs adapter, stripped
to plumbing. A platform vision emerged through the design conversation.

### Implementation progress

- **bare-for-pear/isomorphic-git** (fork 1) — full isomorphic-git with
  Hyperdrive fs adapter and BARE.md. Runs on both bare-fs and Hyperdrive
  adapters. Proven: porcelain hashes match, plumbing hashes match, full
  round-trip (bare-fs → Hyperdrive → bare-fs, 14 objects, all identical).
- **bare-for-pear/p2p-git** (fork 2) — stripped to plumbing only. 8,336
  lines removed, 78 files deleted. 41 plumbing exports retained. Entry
  point: `src/plumbing.js`. All operations pass under Bare.
- **Key findings:** writeBlob/writeTree/writeCommit return OID strings
  directly (not {oid}). Hyperdrive directories are implicit (mkdir/rmdir
  are no-ops). Stats need an implicitDir flag for directories that exist
  only as path prefixes. Merge depends on GitIndexManager (kept for now).

### Platform vision (emerged from design conversation)

- **Joining a swarm = mounting a FUSE drive.** One action, you're in.
  Multiple swarms = multiple drives. Each its own trust domain.
- **`spl <tool> ...` as universal interface.** Any tool mounted on the
  fabric carries its full knowledge ecosystem. `spl git` is git.
  `spl xpath` is XPath. The P2P substrate is invisible.
- **Per-node workspaces** on the shared drive. Read-only platform code,
  writable working folders. App startup = clone repo → run → commits
  back up to the swarm.
- **Cross-app data sharing** via topic references. Single-writer = no
  security machinery needed. Structure is the access control.
- **Privacy by structure**: an application inside a mycelium repo sees
  only what's been internalised. The swarm handles availability.

### Naming and architecture settled

- **mycelium** = one module, the base fabric layer. git + xpath + topic
  blend as internal components, not separate named things.
- **git's role** in the base layer = transaction/commit mechanism. For
  high-frequency mutations, topics handle the speed; git commits are
  the durability checkpoints. Two cadences working together.
- **DB paradigm APIs** (tables, indexes, key-value, document, hybrid
  components) sit on top of mycelium, slotted into the repo tree,
  navigable by XPath like everything else.
- **Infrastructure** (p2p-git, Hypercore) in bare-for-pear. The fabric
  and everything above in pear-full-square.

### Documentation

- Substrate pages drafted: git, kafka, URI, XPath (logical only).
- Mycelium pages drafted: landing, fabric, xpath, vocabulary (need
  rethinking before handing to site agent — discussed but not final).
- Design notes: distributed drive concept, AVRO pattern (schema/handler/
  register), swarm-as-mounted-drive, tool mounting.
- Roadmap reworked: MVP target = working-on-the-swarm experience.

## Working end-to-end

Carried forward from spl5 (Chapter 1 migration), running on TCP:

- 6 URI protocols (raw/data/metadata × get/put/remove)
- 6 schema-aware protocols (type resolution, into-file navigation)
- lib/git + spl.mycelium.git (status, log, diff, add, commit, push, pull, subtree ops)
- lib/rpc-server (server lifecycle, PID, IPC, logging)
- Two-reality model, multi-client identity, CLI context aliases
- Help handler, CLI global flag framework
- Test suite: 73 tests passing
- 5 subtrees re-registered

## In progress

**Chapter 4 — Mycelium design + implementation (active).** Design
settled (Round 1 opaque bytes). Infrastructure modules in progress:
isomorphic-git fork proven (adapter + round-trip), p2p-git stripped
and proven. Next: the mycelium module (combined git component + XPath
navigator MVP) in pear-full-square.

Code baseline unchanged — Chapter 1 migration end-state, 73 tests
green on TCP.

## Next up

1. **mycelium module** — the base fabric layer in pear-full-square.
   Git component (calls p2p-git) + XPath navigator MVP (git tree
   navigation, three visibility modes). One module, one step.
2. **Remaining step 4 items** — ref-log on Hypercore, pluggable merge,
   repo registration. After navigation core works.
3. **FUSE mount + P2P drive** — the platform experience. After the
   base fabric is navigable.
4. **Kafka topics** — when the platform needs data change event streams.
5. **Chapter 5 — Mycelium POC** closes spl6.
