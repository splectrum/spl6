# Streaming fabric — the log as substrate

Internal design note. **SPLectrum is streaming at heart**: the append-only log is
the substrate, stream-records flow on it, and everything else (indexes, views,
state) is a derived view of it. Kafka-type properties — ordering, durability,
replay, schema — are first-class. This note captures the **Kafka ↔ Hypercore**
equivalence, its P2P realisation, and the open design work. Calibrated: the thesis
is settled; specific mechanisms are marked **open**.

## Thesis (settled)

The log is the source of truth; databases / indexes / caches / views are derived,
materialized views of it (Kreps, *The Log*, 2013; Kleppmann, "turning the database
inside out"). SPLectrum adopts this wholesale — the **stream-record** rides a log,
and Mycelium's state is a view over logs. Kafka-type guarantees are important, so
we design *toward* them, P2P-native.

## Kafka ↔ Hypercore (settled)

Hypercore *is* Kreps's log, realised P2P — arguably a purer "just the log" than
Kafka-the-platform became:

| Kafka | Holepunch |
|---|---|
| topic / partition (append-only ordered log) | **Hypercore** (single-writer ordered log) |
| broker-serialized multi-producer | **Autobase** (merge N single-writer cores → deterministic eventual order) |
| topic discovery / cluster | **Hyperswarm** topic (DHT) |
| consumer offset | block index (read from any offset; sparse) |
| replication (leader/follower, ISR) | P2P sparse replication; trust = a signed key |
| Schema Registry | **AVRO** (already a SPLectrum substrate Subject) |
| derived views (KTable / Streams) | **Hyperbee / Hyperdrive / Autobase** views |

The whole Hypercore family is "views over the log" — same lineage.

**The trade (settled).** Kafka centralises ordering in the broker; P2P pushes it to
single-writer logs. We gain trustlessness, offline/no-infra, *native* total order
per log, and cryptographic verifiability. We trade broker-serialized multi-writer
for **either** one-writer-per-topic (Kafka-partition-like strong order) **or**
Autobase (eventual, deterministically merged). No consensus protocol — consistency
is "one writer + replicate + derive." (See the consensus/state-ownership reasoning:
stateless → route anywhere; single-writer → reads anywhere, writes to the owner;
multi-writer → Autobase.)

## Log size & retention (partly open)

Append-only logs grow. Hypercore's levers:
- **Sparse replication** — a peer downloads only the blocks it reads; nobody needs
  the whole log. Growth ≠ everyone-stores-everything.
- **`clear(start, end)`** — drop block *contents* locally while keeping the Merkle
  tree (stays verifiable; frees disk).
- **`truncate(len)`** (writer) — shorten the log, but it rewrites/forks history;
  deliberate, not routine retention.
- **No built-in time/size retention or compaction** (unlike Kafka configs).

So **retention/compaction is a design-level concern** we build:
- *keyed-latest compaction* → a derived **Hyperbee** (latest per key), old blocks `clear`ed;
- *snapshot + rotate* → snapshot state to a fresh core, retire the old log;
- *Autobase checkpoints* → bounded retained input behind a linearised view.

**Open:** SPLectrum's retention/compaction policy and the snapshot/rotate mechanism.

## Streaming/topic setup as an attachable component (aspiration — open)

The streaming/topic capability should be a **reusable component other repos attach
to seamlessly** — the component-graduation model (like `avsc` / `avsc-rpc` in
`bare-for-pear`). The attachable surface is small and substrate-shaped:
- **topic** — a name → Hyperswarm topic + a Hypercore key;
- **append** — write a stream-record to the log;
- **read / replay** — from an offset, sparse;
- **subscribe** — receive new records (the pub/sub mesh, phase-4).

A repo "attaches" by depending on that component and speaking **stream-records +
AVRO schemas** — one uniform interface regardless of what's behind it. This is also
how the fabric attaches to **other substrate types** (git, filesystem, even Kafka
itself): a substrate presents the log/stream interface and SPLectrum consumes it
uniformly — the substrate-Subject model already on splectrum.world.

**Open:** the exact component boundary + API; how a repo declares/attaches a topic;
single-writer-per-topic vs Autobase as a per-attachment choice; consumer-group-style
coordination (partition assignment, committed offsets) if/when needed — not in
Hypercore, build only if pressure surfaces.

## Storage model — native store, filesystem as a checkout (direction settled; migration open)

The end-state inverts spl's current filesystem-native storage: make the **log
family the native source of truth** and demote the OS filesystem to a **derived,
unpacked working view** — exactly git's object-store-vs-working-tree split.

- **Native (truth):** Hypercore (the base log) → **Hyperbee** (key→value index) and
  **Hyperdrive** (paths→files) as the canonical reusable views over logs. These are
  the native components.
- **Derived (projection):** the **OS filesystem** = *unpack* a Hyperdrive to disk
  when real files are needed; *re-pack* changes back in. A checkout/cache, not the
  source. (A projection of a projection — Hyperdrive is already a view over logs.)

**Git mirror (the precedent).** git's object store = truth, working tree = a
checkout you edit then `commit` back. Straight across: Hyperdrive ≈ object store;
OS files ≈ working tree; unpack ≈ checkout; re-pack ≈ add/commit. SPLectrum already
carries the **Git substrate Subject** and the **two-reality (repo vs subtree)**
model, so "source store + working projection" is native thinking — the move is just
"the source store is a Hyperdrive, not a `.git`."

**Block content is opaque (what makes it universal).** A Hypercore block is just
bytes; meaning is imposed above the log. For spl that block is an **AVRO
stream-record** (`key + value + headers`), the **descriptor headers** carrying its
type — so one log can carry many record types, and the schema lives above the log
(AVRO + `uri-schema`), not in it. That's why any data domain rides the same substrate.

**Addressing fits the existing URI/XPath model.** The native store is addressed by
**URI** (where + visibility + op) and **XPath** (which records + into them); a log
adds a **sequence/time axis** (offset / replay / `last()` / typed-filter), and a
live tail query *is* a subscription. The unpacked filesystem **mirrors the same
paths**, so the checkout is browsable by the same addresses as the source
(URI path ≈ Hyperdrive path ≈ working-tree path).

**Gains:** versioning + time-travel (offsets), verifiability (Merkle, trust = key),
P2P replication (the store *is* the distribution), streaming (tail = subscribe), one
source of truth across peers.

**Costs / open:** most tooling expects real files → a smooth checkout or FUSE-mount
(perf caveats); writes become edit-working-view-then-commit (more power, less
it-just-writes); dev ergonomics must stay frictionless. And it **inverts spl6's
current fs-native storage** — a Mycelium/Platform-era migration, *not* a spl6
retrofit. spl6 stays fs-native; this is the storage model the data fabric converges
to (Round 3 → Platform inherits it deliberately).

## Where it acts

- **Round 3 (spl on the cluster)** — stream-record meets Hypercore: the fabric's
  records persisted + replicated as logs.
- **Platform (Mycelium)** — the data fabric *is* logs + derived views; state
  ownership (single-writer) is a routing/consistency input.
- **Chapter 8 (infra)** — git-on-Hyperdrive, persistent cores, retention at scale.
- **splectrum.world** — the Kafka / AVRO substrate Subjects frame this; this note
  informs the Mycelium pages.

## Settled vs open (summary)

- **Settled:** streaming at heart; log-as-substrate; Kafka↔Hypercore mapping; the
  broker→single-writer trade; consistency = single-writer + Autobase, no consensus.
- **Settled (storage):** native store = the log family (Hypercore → Hyperbee /
  Hyperdrive); OS filesystem = a derived, re-packable checkout, git-mirrored.
- **Open:** retention/compaction policy + snapshot-rotate; multi-writer-per-topic
  choice; the attachable streaming component's boundary + API; consumer-group
  coordination (defer until needed); the fs-native→drive-native migration +
  checkout/mount round-trip; the XPath sequence/time axis (replay / tail / subscribe)
  and append-vs-set `put` semantics.
