---
lastmod: 2026-06-03
title: "Mycelium XPath"
description: "XPath is the addressing and navigation language over the mycelium fabric: traversal of git objects and Hypercore logs, three visibility modes, and the sequence/time axis."
replaces: engineering/splectrum/mycelium/xpath.md
---

# Mycelium XPath

XPath is the addressing and navigation language over the mycelium fabric. The same
path expression serves as both direct address to a known location and as a pattern
that resolves against the fabric structure. One scheme navigates git-backed mutable
structure and log-backed immutable data uniformly.

## Navigation on native data structures

XPath operates directly on the two native data structures — no filesystem
intermediary.

**Git objects (mutable).** XPath navigates git tree objects directly — walking tree
entries to traverse contexts, reading blob values by hash. The latest commit tree is
the default navigation root. The index (tracked, uncommitted) is the working-state
root. Versioned navigation is free — any commit's tree is reachable by specifying the
commit.

**Hypercore logs (immutable).** Offset-addressable, tailable, appendable. The
sequence/time axis extends XPath for log-backed data: offset, range, replay,
`last()`, typed-filter. A live-tail query IS a subscription — requesting ongoing
delivery of new records as they are appended.

**Consistent snapshots.** Navigation is always on a consistent state. A commit tree
is immutable — no race with a concurrent write. The index is the current working
state. A log offset references an immutable record.

## Traversal

Navigation walks the path from root to target. At each segment, the traversal checks
for context metadata — accumulated into a metadata set as the path is walked. Nearest
distance wins: metadata defined closer to the target overrides metadata from further
up the path.

Behavioural properties (visibility configuration, protocol declarations, schema
references) are driven by metadata accumulated during traversal. The path determines
the rules. Different paths accumulate different metadata, producing different
behaviour.

## Point of view

Two levels of POV operate:

- **Data owner POV** — the repo root. The owner's overall perspective and the ceiling
  for functional resolution.
- **Process POV** — the invocation context. The data root for all queries.

All data addressing uses absolute syntax. `/` means the process POV — there is no
concept of "above." Every query is absolute from where the process stands.

## Data scope and functional resolution

Two directional axes with strict visibility:

- **Data scope** — forward from process POV into self and descendants. No data
  visibility outside this scope.
- **Functional resolution** — from process POV up the ancestor axis to data owner
  POV. Nearest ancestor wins.

The functional axis connects process POV to data owner POV. The data axis extends
forward from process POV. The two axes never cross.

## Three visibility modes

XPath operates in three visibility modes — lenses on **which nodes** you see. All
three modes have an opaque byte view (base level) and will gain schema-interpreted
access when AVRO is introduced.

| Mode | Visibility | What it shows |
|---|---|---|
| **raw** | Full — data + metadata together | Everything, no filtering |
| **data** | Data nodes only | Hides underscore-prefixed (metadata) segments |
| **metadata** | Metadata nodes only | Only underscore-prefixed segments |

The visibility modes apply to both stores:

- On git-backed data: raw shows all tree entries; data hides underscore-prefixed
  entries; metadata shows only underscore-prefixed entries.
- On Kafka records (topics): raw sees the full record (key + value + headers); data
  mode sees the value; metadata mode sees the headers.

The metadata mode is why the metadata structure matters at the data layer — it is
navigable. Schemas, references, context declarations, provenance in record headers
— all reachable through the metadata lens.

## URI protocols

The URI protocols provide the operational interface: get, put, remove — across the
three visibility modes and both stores.

**On git-backed paths:**
- `get` — read the blob value (opaque bytes)
- `put` — write a blob, update the index (tracked)
- `remove` — delete from the tree

**On log-backed paths:**
- `get` — read at offset, range, latest, or live-tail
- `put` — append a Kafka record to the topic
- `remove` — not applicable (immutable; retention is a management concern)

Each visibility mode (raw, data, metadata) has its own URI protocol. Six protocols
in total: raw/data/metadata × get/put/remove — the same structure as the existing
spl implementation, extended to both stores.

## The sequence/time axis

Log-backed data introduces ordering as a navigable dimension. The sequence axis
extends XPath for topics:

- **Offset** — address a specific record by position
- **Range** — address a contiguous sequence of records
- **Latest / last()** — the most recent record(s)
- **Live-tail** — ongoing delivery of new records as appended (= subscription)
- **Replay** — re-read from a given offset (cursor rewind)

The cursor (read position per topic) is local to the data owner — each owner tracks
its own position in each subscribed topic. Crash-resume is free: persist the cursor,
restart from there.

## Portability

Subtrees remain completely portable. A subtree's data scope is self-contained
(everything below). Its functional context is accumulated from above. Addressing
holds because `/` is always the process POV, not a fixed location. Lift a subtree,
place it elsewhere — same data, different ancestor axis, different functional
resolution.
