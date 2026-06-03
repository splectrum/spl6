# Mycelium Fabric

How the substrate languages knit together into one fabric.

## The data repository

The elementary unit is a **git repository on the P2P substrate** carrying
its own Kafka-pattern topics. This is the data owner's reality — a
self-contained unit that can be cloned, replicated, and composed.

**Git-tracked (mutable, versioned):**
- Structure — the identifier tree (namespace nodes, property bags)
- Functionality — operator implementations (code as content)
- Metadata — schemas, references, context declarations, behavioural rules
- Wiring — topic reference declarations

**Topics (immutable, appendable):**
- Data change event records — Kafka records (key + value + headers)
- The owner's own output streams

**Subscribed topics (replicated from remote owners):**
- Topics this owner depends on, declared via topic references

Self-contained from birth — a clone is immediately operational.

## The mutable/immutable boundary

Git for structure that changes and needs versioning. Topics for records
that never change. The boundary is storage-inherent:

- **Mutable** = git objects. Tracked (in the index, not yet committed)
  or committed (quality-gated, official). The index is the write
  overlay; commit promotes to official state.
- **Immutable** = topic entries. Append-only by construction.

No separate mutability protocol — the storage tells you.

## URI — the data/metadata structure

URI structures what lives in the fabric and how it is accessed.

**The underscore convention.** Forward slash navigates the tree. Underscore
prefix opens the metadata dimension — a lateral move, not a deeper one.
The property bag is at the node, not below it. Data and metadata coexist at
every node, separated by this one convention.

**Three visibility modes:**
- **data** — data nodes only (hides underscore-prefixed segments)
- **metadata** — metadata nodes only (only underscore-prefixed segments)
- **raw** — everything, no filtering

**Operations:** get, put, remove — per visibility mode, across both stores.
On git-backed paths: read/write blobs. On log-backed paths: read at
offset/range/latest/tail, append.

All addressing is local, forward-only from the current context root.

## Topic references

Remote data dependencies are declared as **topic references** in the data
repository's git-tracked wiring. One mechanism for all external data:

- Declare a reference → subscription + sparse replication
- The subscribed data becomes locally addressable
- Adding or removing a reference is a git commit (versioned, auditable)

The repo is responsible for its own completeness — it declares what it
needs. The peer that hosts it makes the references real on the swarm.

## Data state propagation

Data state propagation is not a separate mechanism — it is what happens
when you subscribe. A record appended to a topic becomes visible to every
subscriber. A commit appended to a ref-log becomes visible to every
subscriber.

Two cadences of the same concept:

- **Git commit** — structural state change. Quality-gated (testing, review,
  AI agents). The durable heartbeat.
- **Data change events** — record-level state change. Atomic. The working
  cadence.

Visibility metadata rides in the record headers — configurable per context,
no separate streams needed.

## Recursive composition

A data repository can register other data repositories within it. The
child is its own data owner — own git, own history, own topics. Only the
registration lives in the parent's git; the child's data is git-ignored.
The registration node in the parent IS the child's repo root.

Composition is contexts containing contexts, each a full data owner.
