# Streaming fabric — the log as substrate

> **Companion:** this note is the **storage substrate**; `mycelium-streaming-layer.md`
> is the **execution model** (reactive dataflow, the three cadence tiers, commit-broadcast,
> the git/log boundary by mutability). Together they are the native-P2P-Mycelium design
> that replaces the old "Chapter 4 = transport swap" framing.

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

## Direction — native P2P Mycelium that unifies the substrates (pivot, decided)

This note is no longer just exploratory: it is the **direction for Mycelium**. We
gear toward designing and implementing the data fabric **natively P2P on the log
family** (Hypercore → Hyperbee / Hyperdrive), rather than only carrying the fs/TCP
fabric forward and swapping the transport underneath.

Why it's the right pivot: a native P2P Mycelium **naturally unifies the language
substrates** — the substrate Subjects stop being separate pillars and become facets
of one log-based fabric:

- **Kafka** = the log itself (Hypercore — append-only, ordered, replayable).
- **AVRO** = the block/record encoding + schema (records ride the log).
- **Git** = the version layer (object store + checkout; git-over-P2P, repos-as-drives).
- **URI / XPath** = the addressing (where + which records + into them; + sequence axis).
- **filesystem** = a derived checkout (Hyperdrive view / git working tree).

One verifiable append-only **log** as the substrate, one **URI/XPath** addressing
model, one **AVRO** encoding — with **versioning (git)** and **streaming (Kafka)**
as native properties. *That unification is the point.* The rest of this note designs
that substrate; it now **drives** the Platform/Mycelium work rather than merely
informing it.

(Discipline unchanged: spl6 stays fs/TCP through the migration; the native P2P
Mycelium is the **Platform-era** build — Round 3 POCs and the Ch5–7 design review
ground it. And per "minimal base, open implementations" below, the unification is
the *base*; trust / merge / multi-writer stay per-use-case implementations.)

## Design principle: minimal base, open implementations (settled)

Get the **base components right and minimal**, then layer the **variable,
policy-laden concerns as open implementations** — because different use cases have
different requirements, and baking one policy into the base ossifies it.

- **Base (minimal, correct, no policy):** the single-writer append-only **log**
  (Hypercore), key-value (Hyperbee), filesystem (Hyperdrive) — and, for version
  control, **git's single-branch linear core**. No consensus, no merge, no
  multi-writer in the base. The base is just "an ordered, verifiable, owned log and
  its derived views."
- **Open implementations on top (chosen per use case):**
  - **trust** — key models, membership, transitive trust;
  - **merging** — none / git 3-way / Autobase deterministic;
  - **multi-writer** — single-writer base → Autobase only when genuinely needed;
  - **branching** — single-branch core → branch/merge as a layer.

A config store, a collaborative document, a code repo, and an event stream all want
*different* consistency / merge / trust — so those are **not** base decisions. The
base stays simple and right; the use case selects the implementation. This is KISS +
the pressure-point rule applied to the fabric: don't pay for merge / consensus /
multi-writer until a use case demands it, and keep the base open so it can.

It mirrors the whole note: single-writer Hypercore (base) ↔ Autobase (multi-writer
impl); single-branch git (base) ↔ branch/merge (impl); raw log (base) ↔ retention and
pin-vs-follow references (impls). **Get the base right; keep the rest open.**

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

## The checkout, concretely: a Hyperdrive cache over the git object store

Realises "filesystem as a checkout" *performantly*. The working tree is a
**Hyperdrive cache over the git object store** — the GVFS/Scalar pattern (virtual
working tree, hydrate-on-demand, track changes to commit back), with Hyperdrive as
the cache layer. It maps onto git's own architecture: **git object store** =
committed truth; **Hyperdrive** = working tree + index (the fast, versioned,
addressable read/write surface).

Two directions:
- **cached-read (hydrate)** — reads hit the Hyperdrive (indexed, fast, cached, P2P),
  *not* git. Populate from git objects **lazily** (on read-miss, for big trees) or
  **eagerly** (full checkout). git's slow tree-walk runs only at hydration, never per
  read — which dissolves the "git is slow for live reads" problem.
- **update-commit (harvest)** — writes go to the drive (fast). The drive's own
  **version-delta since the last commit-point *is* the changeset**: because the cache
  is itself a versioned log, diffing `checkout(lastVersion)` vs `version` yields the
  add/modify/delete set for free → write git objects + commit. (Cleaner than GVFS,
  which tracks modified paths explicitly.) git advancing (pull/merge) → re-hydrate the
  affected drive paths.

**Gotchas:** cache coherence on git advance (re-hydrate); merge stays git's 3-way (no
Autobase for solo edit→commit→share); concurrent *live* co-editing of one drive →
single-writer → Autobase (the consensus case); mapping fidelity (modes, symlinks,
empty dirs, binaries → git's model); what replicates (git store = canonical/shareable;
drive cache = working/local).

**Testing fallback — the standard fs representation is the oracle.** The checkout is
an *interface* with two implementations: **(a)** the **standard on-disk representation**
— a real `.git` + a hydrated OS working tree — the well-understood reference; **(b)**
the **Hyperdrive cache over git** — the P2P implementation. They must be
behavior-equivalent, so we develop and test against (a) (plain git semantics, no
Hyperdrive) and swap in (b) behind the same interface, asserting identical results.
The standard repo is both the **fallback** during development and the **correctness
oracle** for the Hyperdrive cache.

## Composition: cascading references (Mycelium — direction settled)

A microservice/repo is a **composite of owned (local) data + referenced remote
data**, cascading (references reference references). Today that's git **subtrees** —
vendored *full copies*. On the log family it becomes **references as keys + sparse
replication**: owned = your own drive's entries; a referenced microservice = another
drive's key, mounted at a path, hydrated only where accessed. The cascade = nested
mounts; reading resolves through the mount transparently. (owned vs referenced = the
two-reality model generalised; the mount is the boundary.)

**Wins over vendored subtrees:** no duplication (keys, not copies); lazy/sparse (only
accessed slices materialise); dedup across referencers (one source core, many refs);
**pin a version** (reproducible, lockfile-style) *or* **live-follow** (fresh) per
reference; verifiable (Merkle, trust = key).

**Trades:** first-access latency (network fetch vs local copy) — mitigated by the
Hyperdrive cache/hydrate; availability/offline (a ref needs a live source or cached
copy; owned is always local) → pin + cache critical refs; transitive trust (you trust
referenced keys — and theirs?); version resolution across a graph of refs (a
lockfile-like consistent composite + cycle handling).

(Hyperdrive `mount` was a v10 feature; v11 status unverified — the composition model
holds whether via native mounts or a thin routing layer.)

## Where it acts

- **Round 3 (spl on the cluster)** — stream-record meets Hypercore: the fabric's
  records persisted + replicated as logs.
- **Platform (Mycelium)** — the data fabric *is* logs + derived views; state
  ownership (single-writer) is a routing/consistency input.
- **Chapter 8 (infra)** — git-on-Hyperdrive, persistent cores, retention at scale.
- **splectrum.world** — the Kafka / AVRO substrate Subjects frame this; this note
  informs the Mycelium pages.

## Settled vs open (summary)

- **Settled (principle):** minimal correct base (single-writer log + views;
  single-branch git core), with trust / merge / Autobase / branching as *open
  implementations* chosen per use case. Get the base right; keep the rest open.
- **Settled:** streaming at heart; log-as-substrate; Kafka↔Hypercore mapping; the
  broker→single-writer trade; consistency = single-writer + Autobase, no consensus.
- **Settled (storage):** native store = the log family (Hypercore → Hyperbee /
  Hyperdrive); OS filesystem = a derived, re-packable checkout, git-mirrored. The
  performant checkout = a **Hyperdrive cache over the git object store** (hydrate on
  read, harvest the drive's version-delta on commit), with the **standard `.git` +
  working tree as the dev fallback / test oracle** (one interface, two implementations).
- **Settled (composition):** a repo = owned data + cascading references; references
  become drive keys + sparse replication (vs vendored subtree copies), pin-or-follow
  per reference. Open: version resolution across the reference graph, transitive
  trust, the mount/compose mechanism.
- **Open:** retention/compaction policy + snapshot-rotate; multi-writer-per-topic
  choice; the attachable streaming component's boundary + API; consumer-group
  coordination (defer until needed); the fs-native→drive-native migration;
  lazy-vs-eager hydration + cache coherence; concurrent live co-editing (drive
  multi-writer → Autobase); the XPath sequence/time axis (replay / tail / subscribe)
  and append-vs-set `put` semantics.
