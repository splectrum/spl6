# Mycelium design — the elementary data building block

Design proposal (Chapter 4). The native P2P Mycelium data layer — the self-contained
unit from which data owners are composed. Grounds Mycelium's existing conceptual
architecture (splectrum.world) onto the proven P2P substrate, integrating the design
decisions made during the spl6 POC phase.

This document is **Round 1** — the physical data structure. Key/value with value as
opaque bytes, the identifier tree, immutable logs, git for mutable structure, XPath/URI
navigation at the raw level. Round 2 introduces AVRO and internal data structure
visibility (schema-aware access, type resolution, the semantic layer).

**Scope:** the data layer — the elementary building block. Processing model (SPLectrum
protocols, direct protocol invocation), peer management, lifecycle, and code
distribution sit on top and are designed separately. Mycelium is the data fabric;
SPLectrum is the language fabric that gives it meaning.

**Input:** the Mycelium concept pages (splectrum.world/engineering/splectrum/mycelium),
the seed/engineering vocabulary, the proven POC primitives (`p2p-building-blocks.md`),
the exploratory notes (`streaming-fabric.md`, `mycelium-streaming-layer.md`), the
working spl6 codebase, and the design decisions recorded in this conversation.

## Vocabulary

Engineering vocabulary grounded in the seed (P0–P5). The seed vocabulary is partial —
only what is translated from the principles. Terms below extend it for the P2P
substrate where the seed doesn't yet cover a concept.

**From the seed/engineering:**
- **Data entity** — object structure with data and associated functionality
- **Data owner** — holder of a set of data entities (the subject in engineering terms)
- **Data state** — the owner's data reality, in a data repository
- **Data world** — totality of data state across all owners
- **Data world subview** — the total view achievable from a repo (partial relative to
  the data world). In a P2P swarm, the data world itself becomes enumerable — a full
  listing of all active data is achievable, though individual owners still hold subviews
- **Protocol** — engineering artefact of a language game. An API with meaning — the
  action vocabulary in its operators makes it a meaning unit, not just a technical
  interface
- **Operator** — protocol method
- **Persona** — structured set of protocols taking on a role
- **Data state propagation** — change becomes visible through the fabric. Visibility is
  sharing, no separate mechanism. The indirect use of language to share knowledge (P3)

**Extended for the P2P substrate:**
- **Data repository / repo** — the git repository on Hypercore/Hyperdrive that
  constitutes a data owner's reality. The boundary, identity, and history
- **Topic** — a Hypercore log carrying immutable data change event records. From Kafka
  (a committed language). The owning repo maintains the topic; other repos subscribe
- **Topic reference** — a data owner's declared dependency on a remote topic. Lives in
  git (versioned wiring). The mechanism is subscription + sparse replication
- **Peer** — the physical runtime hosting one or more data owners. Infrastructure
  vocabulary — the owner is the logical entity, the peer is the physical host
- **Functionality as metadata** — the engineering commitment. What lives in metadata
  are the schemas (contracts describing protocols and operators) and references. Code
  (operator implementations) is content, stored in git

## The pivot

spl5 Mycelium was conceptually at the intersection of AVRO, Git, and Kafka, but
physically on the filesystem with git as a wrapper and Kafka as an aspiration. The
spl6 POCs proved all three as native P2P substrate: isomorphic-git runs under Bare
as a JS library (no fork, no shell-out), Hypercore IS the append-only log. The pivot:
these are now the *actual* ground level, not abstractions layered on the filesystem.

This collapses several layers of indirection. The filesystem becomes a derived
checkout, not the source of truth. Git is a library call, not an external binary.
The log is a replicated data structure, not a conceptual model.

## The elementary unit

A Mycelium data unit is a **git repository on the Hypercore/Hyperdrive substrate**
carrying its own immutable log topics, addressable by XPath/URI. It is self-contained
— a complete, operational data owner that can be cloned, replicated, and composed
without external dependencies on the critical path.

The git repo constitutes the boundary, the identity, the history. This is the data
owner's reality — what the existing Mycelium concept calls the subject reality, now
in engineering terms. What changes from spl5 is the physical substrate: the repo
lives on Hypercore/Hyperdrive (P2P-native, replicated, signed) rather than the OS
filesystem.

### What lives in the unit

**Git-tracked (mutable, versioned):**
- Functionality — operator implementations, embedded in the repo (code as content)
- Metadata — schemas describing protocols/operators (contracts), references, context
  declarations, behavioural rules
- Wiring — topic reference declarations (which topics this owner depends on)
- Mutable projections — derived views maintained from immutable sources
- Structure — the identifier tree (namespace nodes, property bags, contexts)

**Hypercore topics (immutable, appendable):**
- Data change event records — Kafka records (key + value + headers), append-only
- The owner's own output topics — what it produces for downstream subscribers

**Subscribed topics (replicated from remote owners):**
- Input data — topics this owner has declared as dependencies via topic references
- Replicated sparsely — only the data the owner references

### The mutable/immutable boundary

The boundary is **mutability**, and it maps directly to the storage mechanism:

- **Immutable records → Hypercore topics.** Append-only, offset-addressed,
  Merkle-verified, sparse-replicated. Records never change. The log IS the history.

- **Mutable structure → git.** Functionality, metadata, wiring, projections — things
  that change and need versioning, merging, auditing. Git's object model provides
  history, branching, 3-way merge natively. isomorphic-git makes these library calls.

- **Dirty / working state → uncommitted.** Local, unrecorded, no guarantees. The
  git working tree before add/commit. The honest default when no commitment has
  been made.

Mutability is **storage-inherent**. A Hypercore entry is immutable by construction.
A git-tracked file is mutable by construction. Uncommitted state is dirty by
construction. No separate mutability protocol needed — the storage tells you.

## Data state propagation — Mycelium's interaction mode

Mycelium has one interaction mode: **data state propagation**. Data state changes,
propagates through the fabric, and becomes visible to other data owners. Visibility
is sharing — no separate mechanism (P3).

Direct owner-to-owner communication (protocol invocation, RPC) is not a Mycelium
concern. It emerges at higher levels — the SPLectrum language fabric. The data
fabric is purely about data state that propagates.

### Two cadences

Data state propagation operates at two cadences. Both are the same concept — data
state changes becoming visible — at different tempos.

**Git commit — structural state change.**
Merges data structures. Durable, versioned, auditable. Requires a supporting quality
ecosystem: testing, review, validation, AI agent involvement. The full git machinery
(pull requests, on-submit tests, branch protection, code review) applies. isomorphic-git
makes this native — the quality ecosystem runs as library calls. A commit is the data
owner declaring: "this structural state is now official." The ref-log broadcast makes
it visible to all subscribers. On-commit testing/validation gates promotion.

**Data change events — record-level state change.**
Atomic. Append a record, immutable, done. No quality ecosystem needed — the record
IS the fact. Continuous, the working cadence. A record appended to a topic becomes
visible to every subscriber. The cascade: owner appends → subscriber sees → acts →
appends to its own topic → downstream sees. Proven in the reactive-core POC
(`createReadStream({live})` — pushed, not polled; cursor = `contiguousLength`).

| Cadence | What changes | Character |
|---|---|---|
| **Git commit** | Mutable structure (functionality, metadata, wiring, projections) | Durable, quality-gated, AI-merge-able |
| **Data change events** | Immutable records (events, payloads, observations) | Atomic, continuous, the working cadence |

## The Kafka record — native record shape

The Kafka record (key + value + headers) is the native record shape for data change
event streams on Hypercore topics. It provides structure without requiring
interpretation of the value.

At Round 1 (opaque bytes):
- **Key** — the address (identifier point in the fabric)
- **Value** — opaque bytes (content, uninterpreted at this level)
- **Headers** — structural metadata (descriptor, type identifier, routing, provenance)

### Headers as extensible metadata surface

The headers are an open, extensible metadata surface on every record. Any data entity
travelling through the fabric carries its own metadata context. Headers can ferry:

- **Descriptor / type** — what kind of record this is (routing key for dispatch)
- **Provenance** — who produced it, when, through what operator, what version
- **Lineage** — the chain of processors that have touched this record
- **Visibility / observability** — instrumentation metadata, configurable per context
- **Historicity** — version references, predecessor records, causal links
- Any metadata a component needs to attach

Any component can stamp metadata into the headers without needing to understand the
value content. A processor adds its identity; the next processor sees the stamp. The
full processing chain is readable from the headers alone — the value never needs
opening. This is the Mycelium message concept ("enrichment not replacement — the
message accumulates") realised at the data layer.

### Visibility rides the headers

Configurable visibility (observability) does not require separate topics. The
visibility metadata rides in the headers of the regular data change event records.
The configuration — embedded in context metadata, git-tracked — determines what
visibility information is attached to headers at each point in the fabric. A
subscriber reading headers gets the visibility data; a subscriber reading only
values gets the content. No separate observability infrastructure — the same
record serves both.

This also means the data change event stream is a first-class audit trail without
additional infrastructure. The Hypercore log gives ordering and immutability; the
headers give provenance. Together: an immutable, ordered, self-describing, auditable
record stream — built into the fabric, not bolted on.

## Git on Hypercore/Hyperdrive — the repo on P2P substrate

The git repository is the data owner's container. On the P2P substrate,
isomorphic-git operates over Hyperdrive rather than the OS filesystem. The fs adapter
(the ~10-method surface: readFile, writeFile, stat, readdir, etc.) is the integration
seam — `bare-fs` for local development, a Hyperdrive-fs adapter for the P2P case.
Same git operations, different backing store.

**What git provides natively:**
- Identity — the repo has a key (the Hyperdrive key, the owner's public key)
- History — full commit graph, auditable, traversable
- Branching — divergent realities within one owner, reconciled by merge
- Merge — 3-way, AI-assistable, test-gated
- Distribution — push/pull, the functionality delivery mechanism
- Integrity — every object content-addressed (SHA), every ref-log signed (Hypercore)

**What Hypercore/Hyperdrive adds:**
- P2P replication — the repo replicates across the swarm without a central remote
- Sparse access — clone only the objects/paths you need
- Signed trust — the drive key = the owner's public key; verification is structural
- Live broadcast — a commit appended to the ref-log is visible to all subscribers
  immediately (no polling, no central notification)

**The ref-log as data state propagation.** A git branch's ref-log (the sequence of
commit IDs) is itself a Hypercore — append-only, subscribable, live-tailable. A
"push" is an append to the ref-log. A "pull" is tailing the remote's ref-log and
fetching the referenced objects. Commit-broadcast is data state propagation at the
git-commit cadence: subscribers see the ref-log append and the structural change
becomes visible.

**Functionality distribution through git.** The repo's functionality (operator
implementations) is git-tracked content. Updates arrive through git pull. The full
git ecosystem applies: pull requests, on-submit testing, code review, AI agent
participation. isomorphic-git makes this native — the peer can inspect diffs, run
tests on new commits, switch branches, all as library calls. This is the primary
functionality distribution mechanism. Hyperdrive code mobility may still apply for
specific cases (managed deployment, runtime injection) — both are available.

**Git without packfiles on Hyperdrive (settled).** Git runs with loose objects only —
no packfiles, no delta compression. Each blob, tree, and commit is a single drive
entry, individually addressable and individually replicable. This maps naturally to
Hyperdrive's block-level storage and simplifies the isomorphic-git integration (the
fs adapter only needs the basic surface: readFile, writeFile, stat, readdir, mkdir,
unlink — no packfile operations). Sparse replication comes for free: a subscriber
fetches individual git objects through the drive's native sparse replication rather
than negotiating packfile ranges via git's smart protocol.

Git's content-addressing already deduplicates identical blobs (the primary space
saving). Packfile delta compression (the secondary saving) is redundant when the
storage layer handles efficiency: RocksDB (under Hypercore/Corestore) supports
native compression (Snappy, LZ4, ZSTD, configurable per LSM level). If storage
size becomes a concern, compression is a storage-layer knob — git stays simple,
the drive stores objects, RocksDB compresses if needed. Each layer does its own job.

**The standard `.git` representation as oracle.** During development, the standard
on-disk `.git` + working tree is the correctness reference. The Hyperdrive-backed
implementation must be behaviour-equivalent. One interface (the fs adapter), two
implementations, assertable.

## Immutable log structures — Hypercore topics

Each topic is a **Hypercore** — a single-writer, append-only, ordered, signed log.
Records are Kafka records (key + value + headers) with value as opaque bytes at
Round 1. The log is the source of truth for immutable data; everything else
(indexes, projections, mutable surfaces) is derived.

**Kafka ↔ Hypercore mapping (settled):**

| Kafka concept | Mycelium realisation |
|---|---|
| Topic / partition | Hypercore (single-writer ordered log) |
| Record | Kafka record (key + value + headers), value opaque at Round 1 |
| Consumer offset | Block index (`contiguousLength` for completeness) |
| Replication | P2P sparse replication; trust = signed key |
| Schema Registry | Round 2 — schemas in git (co-located, versioned) |
| Derived views (KTable) | Hyperbee / Hyperdrive / git-tracked projections |

**Topic characteristics:**
- **Single-writer.** One data owner appends; others subscribe. Total order is
  intrinsic. Multi-writer (Autobase) is a separate concern, deferred.
- **Append-only.** Records never change. The offset is the identity.
- **Signed.** Every block Merkle-verified; the topic key = the owner's public key.
  Trust is structural.
- **Sparse-replicated.** Subscribers download only the blocks they access. Growth ≠
  everyone stores everything.
- **Live-tailable.** `createReadStream({live})` is pushed each append — the data state
  propagation trigger. No polling.

**The owning data repository maintains the topic.** The repo that writes to a topic is
responsible for that topic's content and availability. Other repos subscribe via topic
references; the owning repo maintains.

## Topic references — the reference mechanism

The existing Mycelium concept describes references as "bring remote resources into
local view, read-only." On the P2P substrate, this collapses to a single mechanism:
**topic references**.

- Remote data you need → declare a topic reference in the repo
- The topic reference list lives in git (mutable structure — wiring)
- The reference triggers subscription + sparse replication on the swarm
- The subscribed data becomes locally addressable (XPath/URI navigation reaches it)
- One mechanism for all external data dependencies

**The repo is responsible for its own completeness.** The git-tracked topic references
declare what the data owner needs for its data state to be ready for use. The repo
owns this declaration — it knows what it needs. The peer that hosts the repo is
responsible for making the references real on the swarm (joining topics, replicating
logs). That boundary — repo declares, peer provides — is a design seam between the
data layer and the peer management layer (designed separately).

**Simplifications over the old reference model:**
- No vendored copies (was: git subtrees) — references are keys, not clones
- No copy-on-write machinery — write to your own topics; subscribe to others'
- No complex reference graph resolution — reference or don't; data is local or isn't
- Availability is a swarm property — if the key is live, the data is reachable

**Topic references as versioned declarations.** Because the reference list lives in
git, changes to it are versioned, auditable, and merge-safe. Adding a reference is
a commit. Removing one is a commit. The full history of "what did this owner depend
on, and when?" is in the git log.

**Data world enumeration.** In a P2P swarm, the data world is enumerable — a full
listing of all active topics and owners is achievable as an infrastructure capability
(the swarm knows what's live). Individual owners hold subviews (their repo + their
topic references). The data world as a whole is no longer purely a logical concept —
it is observable.

## XPath / URI — navigation across both stores

XPath and URI navigate the data layer uniformly — across both git-backed mutable
structure and log-backed immutable topics. The existing XPath concept (addressing,
traversal, POV, data scope vs functional resolution) carries forward. What extends
it is the log dimension.

**Two data stores, one navigation model:**
- **Git-backed (mutable):** navigable tree, versioned, the identifier structure with
  property bags. XPath traversal walks this as it does today — contexts, ancestor
  accumulation.
- **Log-backed (immutable):** offset-addressable, tailable, appendable. The
  sequence/time axis extends XPath: offset, replay, `last()`, typed-filter. A
  live-tail query IS a subscription.

### Three visibility modes

XPath operates in three visibility modes. These are lenses on **which nodes** you
see, not on how the value is interpreted. All three modes have an opaque byte view
(Round 1) and will gain a schema-interpreted view (Round 2).

| Mode | Visibility | What it shows |
|---|---|---|
| **raw** | Full — data + metadata nodes together | Everything, no filtering |
| **data** | Data nodes only | Hides underscore-prefixed (metadata) segments |
| **metadata** | Metadata nodes only | Only underscore-prefixed segments |

The visibility modes apply to both stores. A Kafka record on a topic is navigable
in all three modes: raw sees the full record (key + value + headers), data mode sees
the value, metadata mode sees the headers. The same lenses, the same navigation,
regardless of which store holds the record.

The metadata mode is why the metadata structure matters at the data layer — it's
navigable. Schemas, references, context declarations, behavioural rules, provenance
in record headers — all reachable through the metadata lens.

### URI protocols

The existing URI protocols (raw/data/metadata × get/put/remove) carry forward.

- `get` on a git-backed path = read the value (opaque bytes)
- `put` on a git-backed path = write the value (opaque bytes)
- `get` on a log-backed path = read at offset, range, latest, or live-tail
- `put` on a log-backed path = append a Kafka record
- `remove` on a git-backed path = delete from the tree
- `remove` on a log-backed path = not applicable (immutable; clear/retention is
  a management concern)

The URI scheme gains log-native operations without changing the protocol shape.

## Mycelium protocols — the dynamic side

The data layer has a static side (the data structure — entities, metadata, the tree,
repos, topics) and a dynamic side: protocols that operate on the data fabric itself.
In SPLectrum vocabulary these are protocols — APIs with meaning — but they are
Mycelium's own, operating on the data layer.

**Existing Mycelium protocols (to revisit in light of the pivot):**
- **XPath** — navigation across the fabric in three visibility modes
- **Git** — version, commit, merge, branch, push, pull (the quality-gated cadence).
  Now via isomorphic-git on Hyperdrive rather than shell-out on the filesystem
- **URI operations** — get/put/remove across visibility modes and both stores

**Protocols that dissolve or simplify:**
- **Mutability** (regime interrogation) — becomes storage-inherent. No separate
  protocol needed; the storage tells you
- **Mutable** (queue → surface projection) — becomes a composition of Hypercore
  topic + git operations. Not a separate protocol; it's what git commit does
  when it incorporates data from a tailed topic into a mutable projection

**Potentially new protocols (to design):**
- **Topic management** — create, list, inspect topics owned by this repo
- **Topic reference management** — add, remove, list, inspect topic references
- **Data world index** — enumerate active topics/owners on the swarm
  (infrastructure-level, may sit above Mycelium)

These need proper design — the list is indicative, not final. The P2P pivot changes
what some protocols operate on and may require new ones that don't exist yet.

## What sits on top (designed separately)

The data layer is the foundation. These concerns build on it:

- **SPLectrum (language fabric)** — protocols with meaning, operators, personas.
  Direct protocol invocation (RPC). The meaning layer, embedded as metadata in
  Mycelium. SPLectrum gives meaning to data; Mycelium carries the data
- **HAICC (process fabric)** — process definitions, watchers, human-AI collaboration,
  work division. Processes trigger on data state change
- **Peer management** — the peer hosts repos and provides swarm connectivity. It
  bridges "the repo declares topic references" to "the swarm provides data."
  P2P lifecycle (join, leave, health, availability) is fundamentally different from
  centralised orchestration
- **Multi-peer / multi-branch** — multiple peers running the same repo on different
  branches. The mechanisms are there (git branching is native) but not an initial
  concern
- **Shared reality / multi-writer** — consensus across repos; Autobase territory.
  The base layer is single-writer. Multi-writer is a later concern
- **Retention / compaction** — log growth management. Hypercore's sparse replication
  and `clear()` provide primitives; policy is a management concern

## Round 2 — the semantic layer (next)

Round 1 establishes the physical data structure with opaque bytes. Round 2 introduces:

- **AVRO** — gives structure to the opaque bytes. Encoding from base level up. Pack at
  boundary, plain objects in memory. Schemas co-located in git (versioned, governed)
- **Schema-aware XPath/URI** — type resolution, into-file navigation. The data and
  metadata visibility modes gain schema interpretation alongside the opaque byte view
- **Protocol and operator schemas** — discoverable in metadata. The contracts that
  describe what operators exist and what their signatures are
- **Schema evolution** — when schemas evolve (a git commit), how subscribers handle
  records encoded under older schemas. AVRO reader/writer schema resolution applies

## Relationship to the existing Mycelium concepts

This design grounds the existing conceptual architecture onto the P2P substrate.
The concepts carry forward; the realisation changes.

| Concept (splectrum.world) | Realisation (Round 1) |
|---|---|
| Subject reality | Data owner — git repo on Hypercore/Hyperdrive |
| Fabric primitive (identifier point + property bags) | Git-tracked tree; key/value with opaque bytes |
| Immutable records | Kafka records on Hypercore topics |
| Mutable protocol (queue → surface) | Dissolves into git + topic composition |
| Mutability regimes | Storage-inherent: Hypercore = immutable, git = mutable, uncommitted = dirty |
| References | Topic references — keys + sparse replication |
| Layering | Hypercore (physical) → Hyperbee/Hyperdrive (views) → projections |
| Data state propagation | Two cadences: git commit + data change events |
| Safe mode | Opaque byte access — the physical floor (Round 1 IS this level) |
| Message (tree in motion) | Kafka record (key + value + headers) on topics |
| Headers as enrichment | Headers as extensible metadata surface — provenance, lineage, visibility |
| Protocol (Mycelium's own) | XPath, git, URI operations — to revisit |
| Direct communication | Not a Mycelium concern — SPLectrum (language fabric) |
| Three visibility modes | raw / data / metadata — all opaque byte at Round 1 |
| Data world subview | Topic references define the owner's view; swarm makes the world enumerable |

## Open questions (Round 1)

- **XPath sequence/time axis** — the exact syntax for offset, range, replay, live-tail
  queries over log-backed paths. Extends the existing XPath grammar
- **Topic reference granularity** — reference a whole topic or filter by path/type
  within it? Affects replication volume and propagation precision
- **The Hyperdrive-fs adapter** — the shape-matching shim for isomorphic-git.
  Thin (~10 methods), needs building and testing against the `.git` oracle
- **Topic naming / discovery** — how a topic's Hypercore key relates to a
  human/machine-readable name. References use keys; navigation uses paths. The
  mapping between them
- **Kafka record serialisation at Round 1** — the record envelope (key + headers)
  needs a serialisation format even before Round 2 adds AVRO for values. Minimal
  binary framing, or AVRO for the envelope from the start?
- **Git-backed vs log-backed navigation seam** — how XPath traversal crosses from
  the git tree into subscribed topic data and back. The addressing is uniform;
  the physical boundary needs design
