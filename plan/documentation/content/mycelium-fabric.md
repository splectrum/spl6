---
lastmod: 2026-06-03
title: "Mycelium Fabric"
description: "The data structure of the mycelium fabric: git objects and Hypercore topics as the two native data structures, the identifier grammar, and the elementary data unit."
replaces: engineering/splectrum/mycelium/fabric.md
absorbs: identifier-grammar.md, subject-reality.md, mutability.md, mutable.md, message.md, protocol.md, layers.md
---

# Mycelium Fabric

The data structure of the mycelium data fabric — what it is made of and how it works.

Mycelium is natively a **git-object + Hypercore-log** data structure. There is no
filesystem in the native path. Git objects (trees, blobs, commits) form the mutable
data structure. Hypercore logs form the immutable data change event streams. Both are
P2P-native on the same substrate — signed, replicated, sparse-accessible.

The filesystem exists only as an **external** bridge — a materialised representation
for tools that need real files (editors, build systems). The external git repository
on the OS filesystem is the correctness oracle during development, not the native
data path.

## Substrate primitives

The P2P substrate provides the building blocks. Each is introduced briefly here; the
Infrastructure section covers them in depth.

- **Hypercore** — a single-writer, append-only, signed, sparse-replicable log. The
  base data structure of the P2P substrate. Every block is Merkle-verified; the
  topic key = the writer's public key. Trust is structural.
- **Hyperdrive** — a filesystem-like structure over Hypercore logs. Path-addressable
  entries, each backed by log blocks.
- **Hyperswarm** — discovery and connectivity. Topic-based rendezvous and
  key-based direct connection across the P2P network.
- **RocksDB** — the storage engine under Hypercore. Handles compression (Snappy,
  LZ4, ZSTD — configurable per level) and atomic writes. The one native dependency.

## Two native data structures

### Git objects (mutable)

The git object model IS the fabric's mutable data structure. Not "data stored in
git" — the objects themselves are the fabric.

- **Tree object** = context — a bounded area containing identifier points
- **Blob object** = value at an identifier point — opaque bytes
- **Tree entry** = identifier point — name mapped to hash (key → value)
- **Index entry** = tracked but uncommitted identifier point — work in progress
- **Commit** = quality-gated snapshot of the full tree

isomorphic-git (pure JavaScript, runs under Bare unmodified) provides the git
operations as library calls: reading and writing objects, commit, merge, diff,
branch. No external git binary, no shell-out.

**Git without packfiles.** Git runs with loose objects only — each blob, tree, and
commit is a single Hyperdrive entry, individually addressable and individually
replicable. No packfile delta compression. Git's content-addressing already
deduplicates identical blobs. If storage size becomes a concern, RocksDB handles
compression at the storage layer — git stays simple, the drive stores objects,
RocksDB compresses. Each layer does its own job.

### Hypercore topics (immutable)

Each topic is a Hypercore — a single-writer, append-only, ordered, signed log.
Records on topics are **Kafka records** (key + value + headers) with value as opaque
bytes. The log is the source of truth for immutable data; everything derived
(indexes, projections) is expendable and rebuildable.

- **Single-writer.** One data owner appends; others subscribe. Total order is
  intrinsic.
- **Append-only.** Records never change. The offset is the identity.
- **Sparse-replicated.** Subscribers download only the blocks they access.
- **Live-tailable.** New appends are pushed to subscribers — the data state
  propagation trigger.

## The Kafka record

The Kafka record (key + value + headers) is the native record shape on topics.

- **Key** — the address (identifier point in the fabric)
- **Value** — opaque bytes (content, uninterpreted at the base level)
- **Headers** — structural metadata: an open, extensible surface

### Headers as extensible metadata

Any data entity travelling through the fabric carries its own metadata context in
the headers. Any component can stamp metadata into the headers without understanding
the value content.

Headers can ferry: descriptor/type (routing key), provenance (who, when, what
operator, what version), lineage (the chain of processors), visibility
(instrumentation metadata, configurable per context), historicity (version
references, causal links), and any metadata a component needs to attach.

The full processing chain is readable from the headers alone. The value never
needs opening. The message accumulates — enrichment, not replacement.

**Visibility rides the headers.** Configurable observability does not require
separate topics. Visibility metadata rides in the headers of the regular data change
event records. A subscriber reading headers gets the visibility data; a subscriber
reading values gets the content. The data change event stream is a first-class audit
trail: the log gives ordering and immutability; the headers give provenance.

## Identifier grammar

The grammar has exactly two structural moves.

**Dot — tree navigation.** Navigates the identifier tree. Each segment is the next
step in the address space. The parent is the namespace for the child. The name is
namespaced by its position in the tree. `xpath.data.uri` — three segments, each
namespaced by its parent.

**Underscore — property bag.** Opens a property bag at the current node. A lateral
move, not a deeper one. The bag is *at* the node, not *below* it. Inside the bag,
property names get their namespace from the bag's schema, not from tree position.

No overlap between dot and underscore. Dot walks the address space. Underscore opens
the property space.

**Defined vs applied operators.** Operators that a protocol *defines* — `get`, `put`,
`delete` — belong in the tree, dot-navigated. Operators *applied to* a node — `_is`,
`_noop` — come from outside, in property bags, underscore-navigated. The tree does
not enforce categories; the schema tells you what kind of thing it is.

## The mutable/immutable boundary

Mutability is **storage-inherent** — no separate protocol needed.

- **Immutable** = Hypercore topic entries. Append-only by construction.
- **Mutable** = git objects. The index or a commit tree can point to different blobs.
  Versioned, mergeable, auditable.

Mutable data has two layers:

- **Tracked** (git index) — work in progress. Blobs exist in the object store,
  referenced by the index. Addressable, content-hashed, not yet quality-gated.
- **Committed** (git commit tree) — official state. Quality-gated, versioned,
  broadcast via the ref-log.

Changes go straight into git tracking — creating a blob and updating the index. The
data is a git object from the moment of creation. Commit is the quality gate, not the
point of entry.

## The elementary data unit

The data unit is a **git repository on Hyperdrive** carrying its own Hypercore topics.
This is the data owner's reality — the self-contained unit from which the fabric is
composed.

**Git-tracked (mutable, versioned):**
- Functionality — operator implementations, embedded in the repo
- Metadata — schemas describing protocols/operators (contracts), references,
  context declarations, behavioural rules
- Wiring — topic reference declarations
- Structure — the identifier tree

**Hypercore topics (immutable, appendable):**
- Data change event records — Kafka records, append-only
- The owner's own output topics

**Subscribed topics (replicated from remote owners):**
- Topics this owner depends on, declared via topic references, sparsely replicated

### Topic references

Remote data dependencies are declared as **topic references** — a single mechanism
replacing the old reference model.

- Declare a topic reference in the repo (git-tracked wiring)
- The reference triggers subscription and sparse replication
- The subscribed data becomes locally addressable
- One mechanism for all external data dependencies

The repo is responsible for its own completeness — its topic references declare what
it needs. The peer that hosts the repo makes the references real on the swarm. That
boundary (repo declares, peer provides) is a design seam between the data layer and
the peer management layer.

Topic references are versioned declarations — adding or removing a reference is a
git commit. The full history of dependencies is in the git log.

### Data state propagation

Data state propagation is a consequence of topic subscription — it just happens.
A record appended to a topic becomes visible to every subscriber. A commit appended
to a ref-log becomes visible to every subscriber. No separate propagation mechanism.

The two cadences:

- **Git commit** — structural state change. Merges data structures. Requires a quality
  ecosystem (testing, review, AI agents). The durable heartbeat.
- **Data change events** — record-level state change. Atomic. The working cadence.

### Git integration

The Mycelium git component wraps isomorphic-git — starting as a wrapper, learning
the git object code gradually, letting pressure decide if the underlying
implementation becomes Mycelium's own. The wrapper adds: loose-objects-only
enforcement, XPath-style navigation over tree/blob objects, the tracked/committed
working-state model, ref-log on Hypercore for propagation, and a Hyperdrive adapter
for the git object store internals.

The external git representation (standard `.git` + materialised working tree on the
OS filesystem) is the correctness oracle during development.

## Mycelium protocols

The data layer has a static side (the structure above) and a dynamic side: protocols
that operate on the fabric.

- **XPath** — navigation across the fabric in three visibility modes. See the
  XPath page.
- **Git** — version, commit, merge, branch, push, pull. Via isomorphic-git on
  Hyperdrive.
- **URI operations** — get/put/remove across visibility modes and both stores.

Direct protocol invocation (RPC) is not a Mycelium concern — it belongs to the
SPLectrum language fabric.

## Functionality as metadata

The engineering commitment: functionality is colocated as metadata on the data. What
lives in metadata are the schemas (contracts describing protocols and operators) and
the references. Code (operator implementations) is content, stored in git. The
metadata describes the functionality; the content implements it.
