# Mycelium — overview

Working overview. The substrate paradigms, our adoption scope, and the
Mycelium blocks that compose from them.

## Substrate — paradigm adoption

### Git (historicity)

**Adopted:**
- Object model: tree, blob, commit (content-addressed, immutable objects)
- Refs: branches as named pointers to commits
- Index: the staging/overlay layer (tracked, not yet committed)
- Branch and merge (3-way, AI-assistable, test-gated)
- Content-addressing (SHA — identity = content hash)
- Decentralised exchange (push/pull between repos, no privileged central)

**Simplified / not adopted:**
- No packfiles — loose objects only (Hyperdrive handles storage efficiency)
- No working tree in native path (the index is the write overlay)
- No submodules / subtrees (replaced by repo registration)
- No smart protocol (sparse replication via Hyperdrive instead)
- Full merge complexity — gradual (start simple, grow with pressure)

**How it lives:**
- isomorphic-git (pure JS, Bare-native, no fork)
- Git objects as Hyperdrive entries (individually addressable/replicable)
- Ref-log as a Hypercore (subscribable, signed, live-tailable)
- Wrapper component, growing gradually toward own implementation

### Kafka (mobility)

**Adopted:**
- The record: key + value + headers (the mobility envelope)
- Append-only ordered log (the topic)
- Offset / replay / consumer position
- Single-writer per topic (total order intrinsic)
- Headers as extensible, self-describing metadata surface

**Not adopted:**
- Broker / cluster machinery
- Partitions (single-writer = one partition per topic)
- Consumer groups / rebalancing
- No own component yet — Kafka-compatible record shape on Hypercore

**How it lives:**
- Hypercore = the topic (append-only, signed, sparse-replicated)
- Kafka record shape on each log entry
- Live-tail (`createReadStream({live})`) = the consumer
- Offset = block index; completeness = `contiguousLength`

### AVRO (structure)

**Adopted:**
- Schema-defined binary encoding
- Reader/writer schema resolution (evolution)
- Union types, logical types
- Pack at boundary (plain objects in memory, AVRO at crossings)

**Our own way:**
- Namespacing (schema identity tied to the fabric's identifier grammar)
- Registry (schemas in git, co-located with data, not a central service)

**How it lives:**
- avsc (constitutive dependency, barified)
- Schemas as git-tracked metadata in the data repo
- Round 2 concern — Round 1 operates with opaque bytes

### XPath / URI (addressing)

**Adopted:**
- Axis-based navigation (ancestor, descendant, self)
- Location paths (step expressions)
- Functions (built-in + extensible)
- URI: uniform resource identification (which thing)
- XPath: within-resource navigation (where in the structure)
- Two-layer addressing: URI to the resource, XPath into it

**Our own way:**
- Native XPath implementation (own engine, own function set)
- The data/metadata structure it navigates (git objects + Hypercore logs)
- Three visibility modes (data, metadata, raw) as navigation lenses
- Sequence/time axis for log-backed data (offset, range, live-tail)
- URI protocols: data and metadata operations (get/put/remove)

**How it lives:**
- Native XPath engine (planned)
- Navigates git tree/blob objects + Hypercore log entries directly
- URI protocols as the operational interface on the structure

## Mycelium — the fabric blocks

### The hybrid

- A data fabric blending the git paradigm and the kafka paradigm
- Git for structure and mutable data (versioned tree of data entities)
- Kafka topic for immutable append-only data change event logs
- The git repo joins it all up — the boundary, identity, history
- Data state propagation: it just happens (subscribe → see changes)

### The data repository (elementary unit)

- Git repo on Hyperdrive = a data owner's reality
- Contains: structure (tree), functionality (code), metadata (schemas,
  references), wiring (topic references)
- Owns: Hypercore topics (its output data change event streams)
- Subscribes to: remote topics (input, sparsely replicated)
- Responsible for its own completeness (declares what it needs)
- Self-contained from birth (clone = operational)

### Recursive composition

- A parent repo can register child repos within it
- The child is its own data owner (own git repo, own history, own topics)
- Only the registration lives in the parent's git (child data is git-ignored)
- The child repo is a full data unit — not a subtree, not a module
- Composition = contexts containing contexts, each a full owner

### Mutable data (git side)

- Git objects: tree (context), blob (value), commit (snapshot)
- The index = the write overlay (tracked, not committed)
- Commit = quality-gated promotion (testing, review, AI agents)
- No filesystem working tree in native path
- XPath navigates tree objects directly (latest commit or index)
- Versioned navigation: any commit's tree is reachable

### Immutable data (kafka side)

- Hypercore topics: append-only, signed, ordered logs
- Records: Kafka shape (key + value + headers)
- Value: opaque bytes (Round 1); AVRO-encoded (Round 2)
- Headers: extensible metadata (provenance, lineage, visibility, historicity)
- Single-writer per topic (owner = writer)
- Live-tailable: subscribers see appends as they happen

### Topic references (the reference mechanism)

- Remote data dependencies declared as topic references in git
- Subscribe → sparse replication → data locally addressable
- One mechanism for all external data
- Versioned (adding/removing a reference = a git commit)
- The repo declares; the peer provides (design seam to peer management)

### Data state propagation

- Not an interaction mode — it just happens
- Subscribe to a topic → see appends. Subscribe to a ref-log → see commits
- Two cadences:
  - Git commit: structural, quality-gated, durable
  - Data change events: atomic, continuous, the working cadence
- Visibility rides the headers (configurable, no separate streams needed)

### URI — data and metadata structure

- URI protocols operate on the structure: get, put, remove
- Three visibility modes: data (hides _), metadata (only _), raw (all)
- On git-backed paths: read/write blobs, tracked via index
- On log-backed paths: read at offset/range/latest/tail, append
- Data and metadata separation via underscore convention in the tree

### XPath — navigation

- Navigates the structure URI operates on
- Three visibility modes as navigation lenses
- On git objects: walks tree entries, reads blobs by hash
- On Hypercore logs: offset-addressed, sequence/time axis
- Native implementation: own engine, own function set
- The structure it navigates is the most important thing to define

### Vocabulary

- Seed-grounded engineering vocabulary (data entity, data owner, data state,
  data world, data world subview, protocol, operator, persona, data state
  propagation)
- Extended for P2P substrate (data repository, topic, topic reference, peer)
- Will grow — deserves its own page

## What sits on top (not Mycelium)

- **SPLectrum (language fabric)** — protocols with meaning, operators, personas,
  direct protocol invocation. Embedded as metadata in Mycelium
- **HAICC (process fabric)** — process definitions, work division, AI collaboration.
  Embedded as metadata in Mycelium
- **Peer management** — hosting repos, swarm connectivity, lifecycle
- **Multi-writer / shared reality** — Autobase, deferred
- **Retention / compaction** — log growth management
