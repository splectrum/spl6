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
- **Open:** retention/compaction policy + snapshot-rotate; multi-writer-per-topic
  choice; the attachable streaming component's boundary + API; consumer-group
  coordination (defer until needed).
