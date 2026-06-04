# Mycelium POC roadmap

The build path for the Mycelium platform. The MVP target is the
**working-on-the-swarm experience**: mount a P2P drive, navigate repos,
build and run tools, share data by reference. Not just proving
infrastructure pieces — proving the platform works.

## The MVP target

A FUSE-mounted P2P drive that provides:
- A shared drive backed by Hyperdrive on the swarm
- Per-node writable workspaces, read-only shared code/platform
- `spl <tool> ...` commands that execute on swarm-backed data
- Apps clone their repo into a workspace, run against local state,
  commit backs up to the swarm
- Cross-app data sharing via topic references (single-writer, no
  security machinery — structure is the access control)
- Standard tool knowledge applies — `spl git` is git, `spl xpath` is
  XPath. Mount the tool, keep the ecosystem

## Module homes

- **bare-for-pear** — infrastructure modules. The isomorphic-git forks
  (fork 1 and fork 2). Forked dependencies alongside avsc, avsc-rpc, etc.
- **pear-full-square** — P2P/Pear application code. The Mycelium git
  component, XPath navigator, topic management, FUSE mount, spl CLI
  handlers. POC and production code.
- **splectrum** — data repos with embedded functionality. The actual
  Mycelium data repositories. Not JS source code.

## Phase 1 — git on P2P (the foundation)

### Step 1 — bare git (done)

isomorphic-git on bare-fs under Bare. Proven in probe. ESM build
required (the only configuration).

### Step 2 — fork 1: full isomorphic-git on Hyperdrive (adapter proven)

Fork isomorphic-git in bare-for-pear. Hyperdrive fs adapter maps 10 fs
methods to Hyperdrive v11+ operations. Standard git (full porcelain)
running over Hyperdrive storage.

**Proven:** probe `isomorphic-git-on-hyperdrive` — porcelain hashes match,
plumbing hashes match, full round-trip (bare-fs → Hyperdrive → bare-fs)
with 14 objects, all identical. Implicit directory handling fixed.

**Delivers:** standard-compatible P2P git.

### Step 3 — fork 2: stripped to plumbing

Clone fork 1. Strip to plumbing only (object operations, refs, text merge,
diff, log). Remove porcelain, HTTP transport, smart protocol, working-tree
operations.

**Test against:** fork 1. Same objects, less code.

**Delivers:** the git engine.

### Step 4 — Mycelium git component

New module calling into fork 2. The fabric-specific layer:
- Native write path (blob → tree → commit)
- Ref-log on Hypercore (data state propagation)
- Pluggable merge dispatch (text, record, log, schema-aware, AI-assisted)
- Tracked/committed model
- Recursive repo registration
- Loose-objects-only enforcement

**Delivers:** P2P native git for the fabric.

## Phase 2 — XPath navigator (single module, expand over time)

A single XPath module. Starts as an MVP, grows with pressure.

### MVP — git tree navigation

Navigate a git repo's committed tree. Walk tree objects, read blob values.
Three visibility modes (data, metadata, raw). Forward-only from root
(self + descendants for data, self + ancestors for functional resolution).

Enough to build repo-backed tools. Enough to get the P2P drive going.

**Test against:** bare-fs git navigation as oracle.

### Later expansions (when pressure surfaces)

- Log navigation (offset, range, latest, tail) — when kafka topics land
- Temporal dimension (commit history, version selection) — when needed
- AVRO traversal (decoded record internals, header metadata) — Round 2
- Seamless cross-store traversal (git ↔ log in one expression)
- Custom function set (git/kafka read operations)

## Phase 3 — the P2P drive

### FUSE mount

Hyperdrive mounted as an OS drive. The adapter we built (hyperdrive-fs)
serves the FUSE layer. `fuse-native` for Bare. Read/write permissions
from drive metadata — per-folder, per-node.

### Per-node workspaces

Each swarm node gets its own writable workspace, keyed by node identity.
Shared platform/code folders are read-only. Working state is per-node,
backed up by git commits to the swarm.

### spl CLI on the drive

`spl git ...`, `spl xpath ...`, `spl topic ...` — the namespace handlers
execute against Hyperdrive-backed data. The existing spl dispatch pattern,
same CLI, different backend. Tools mounted under `spl` carry their full
knowledge ecosystem.

### App startup

Launch an app → clone the app repo into the node's workspace → run
against local repo state → changes are git commits → commits replicate
to the swarm. Self-contained from birth.

## Phase 4 — kafka topics (when needed)

The kafka side lands when the platform needs data change event streams
beyond git commit propagation.

### Kafka record on Hypercore

Kafka record shape (key + value + headers) on Hypercore topics. Write,
read by offset, range, latest.

### Live-tail (subscription)

`createReadStream({live})` as the subscription trigger. Data state
propagation at the event cadence.

### Topic management

Create, list, inspect topics. Topic references as git-tracked wiring.

### Integration

Topics wired to the git component. Ref-log on Hypercore connected.
Both sides operating as one fabric. XPath extended to navigate both.

## Phase 5 — the distributed drive application

The first Mycelium application: a FUSE-mountable distributed drive with
placement control. Built AS a data owner — git repo with configuration,
Hypercore topics for data blocks. Retention controller, repair loop, the
three-piece AVRO pattern (schema/handler/register). Exercises everything.

See `plan/design-notes/distributed-drive.md`.

## Scope

Round 1 throughout — opaque bytes. No AVRO, no schema-aware access. Get
the platform experience working end to end, then add the semantic layer
(Round 2).
