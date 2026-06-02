# Mycelium streaming layer — the reactive dataflow base layer

Internal design draft (discussion). This is the **execution model** of Mycelium: how
repos compute by reacting to data changes. It sits on the **storage substrate** in
`streaming-fabric.md` (log-as-substrate, Hypercore↔Kafka, the checkout, cascading
references) — read that for storage; this note is the dataflow/cadence/execution
layer on top. Calibrated: the spine is settling; specifics are marked **open**.

It also **replaces the old "Chapter 4 = transport swap" framing**: P2P is a
substrate that reshapes the server model, storage, and addressing — not a pipe under
the existing fabric. spl's *conceptual* core (stream-record, namespace dispatch,
handler contract, input schemas, help, two-reality) carries forward; the
substrate-facing layer is what this designs.

## The model in one paragraph

A **repo = a microservice = a keyed peer**, carrying its own code (its "DNA") and its
own logs. It **references the remote change-log topics it needs** (sparse — no
unnecessary data replicated), and a **new append to a subscribed log is the event**
that kicks it into action. It processes **locally**, appends results to **its own**
output log, and that append is the event that wakes the next repo downstream.
Computation cascades through the graph as data flows through logs. **Code execution
is a local repo concern** (decentralised; the DNA is internal to the repo).
Management — fleet view, upgrades, cross-mesh observability — is an *optional
overlay* that observes by subscription, never a runtime dependency on the critical
path.

## Three cadence tiers (organizing idea)

The same substrate (logs + protomux channels, all signed) carries three tiers of
interaction, fastest to slowest. A repo picks the tier per need; most work is the
middle one.

| Tier | Mechanism | Cadence | Use |
|---|---|---|---|
| **RPC** | connect-by-key + an avsc-rpc protomux channel | synchronous, sub-beat | the minority: direct, fast, "answer me now" |
| **Data-change-event stream** | append to a change-log + subscribers tail it | reactive, near-replication-latency | the majority: async dataflow, the working cadence |
| **Commit / push (git)** | a commit broadcasts on the branch's ref-log | the **slow, durable heartbeat** | settled/versioned state, code distribution, coarse-grained "this is now official" |

These are not competing — they're cadences of one fabric. RPC and data-sync already
coexist on one connection (proven, phase-5.2: replication + RPC as named protomux
channels). Commit-broadcast is the same logs, at the version layer. **Heartbeat
tuning of the middle tier is deferred** (react-on-arrival vs a periodic beat) — not
an initial concern.

## The base-layer spine (settling)

- **Stream = append-only change-log (Hypercore), records AVRO-encoded.** Encoding is
  already settled — these *are* spl stream-records, pack-at-boundary. The streaming
  layer doesn't reopen it.
- **Topic = the subscribable unit, sparsely replicated.** A repo references the
  remote change-logs it needs and replicates only those. (Granularity: a named
  stream, kept small/single-purpose.)
- **Stream–table duality — the heart.** A subscribed change-log (the *stream*: truth,
  history, what you tail) is **projected into a folder/file data structure** (the
  *table*: the working view code reads). spl already owns the table side — xpath/URI
  protocols, node records, namespace-as-filesystem operate on exactly that shape. So a
  subscribed log folds into a structure spl's handlers already read; a repo's output
  is appended back to its change-log for downstream subscribers. `commit`/emit is
  table→stream; `checkout`/materialize is stream→table.
- **Cursors + rewind, per repo (subject reality).** Each repo tracks its own position
  per input log, persisted locally; append-only makes **rewind/replay** free (move the
  cursor back). Crash-resume and replay fall out.
- **Subject reality local; shared reality later.** The dataflow graph is each repo's
  own subject reality (its references in, its emissions out) — continuous with spl's
  two-reality model. **Shared reality** (a consensus/merged view across repos) is a
  deliberate later concern — where Autobase / merge enters ("minimal base, open
  implementations", `streaming-fabric.md`).
- **Local code DNA.** A repo carries its functionality internally; execution is a
  local reaction. Decentralised by default; no central scheduler on the critical path.

## What lives in git vs the log (by mutability)

The git/log boundary is **mutability**, and the reference structure is the seam:

- **Immutable records (events, data payloads) → the log**, outside git. Append-only,
  content/offset-addressed, sparse-replicated, Merkle-verified. They never change, so
  git's versioning buys nothing.
- **Mutable, version-worthy structure → git**: the reference graph (keys/pointers to
  those records), wiring, code/DNA, schema, pinned-reference manifests — what changes,
  and what you want versioned, AI-merge-able, audited.
- **"Updates" are event-sourcing:** append a new immutable record + move the
  git-tracked reference. Records never mutate; references move.
- Not *all* references go in git — only durable, shared, version-worthy ones. Per-repo
  **read cursors** are local subject-reality state (a Hyperbee), not committed.

Result: **git stays lean** — it tracks structure, never volume; the log carries the
data. This is git's own refs-vs-objects design lifted a level — the git-LFS *pattern*
(pointers in git, content outside) generalised to event data, but over our P2P log,
**not** an LFS server (we want the pattern, not the product; isomorphic-git is core
git, not LFS).

**Availability is a cluster policy, not a per-reference worry.** Immutability
guarantees *reference consistency* (a pinned key can never change under you); the
managed P2P cluster guarantees *availability* by a **retention / replication-factor
policy** — ensure ≥1 (ideally ≥N) durable, reachable peers retain each record, then
anyone can request it. So availability moves from an ad-hoc per-reference concern to a
single cluster-level knob. (It still can't dodge: a record every holder has pruned, or
a lone offline peer, is unavailable — the policy must keep enough live copies.)

**Interim dual → unified endgame.** While git keeps a standard `.git` object store this
is an explicit *dual* setup (git + log, an LFS-like pointer boundary) — worth it at
volume (event data dwarfs structure; git bloat is real), marginal for small data. But
it is not a permanent architecture: the endgame (git-on-Hypercore, `streaming-fabric.md`)
**collapses it** — git's objects live on the log family, so git's
references-over-immutable-*objects* *is* the references-over-immutable-*records* split,
on one substrate. The dual setup is what the unified substrate looks like before
convergence, not added complexity. *Open detail:* addressing immutables by content-hash
(git's way — dedup/integrity) vs log offset (order) — likely both axes.

## Worked example: git that broadcasts its commits

This is the canonical stream — and it shows the whole convergence as *one* mechanism.

**A git branch is a Mycelium stream. A commit is a publish. A checkout is a
materialize. "Subscribe to a branch" is the reactive trigger.** Once a ref
(`refs/heads/main`) is seen as an append-only log of commit-ids, "broadcast a commit"
is identical to "append to a replicated log": subscribers tail the ref-log over their
live connection and react. No central remote, no broker — whoever subscribes hears it.

- **What's broadcast:** the **ref-log** (commit-ids — tiny). Objects (blobs/trees)
  live in a content-addressed store, **fetched sparsely on demand** — broadcast the
  *fact*, pull the *content* you need.
- **Trust:** the ref-log is a single-writer signed Hypercore, so a broadcast commit is
  signed; subscribers verify it came from the repo's key. (Shared branches /
  multi-writer = Autobase = shared-reality, deferred.)
- **Why it matters:** it closes three loops at once — stream–table duality
  (version-aware), code distribution by commit/push (the change *is* the broadcast),
  and reactive dataflow ("when this repo commits, react": re-materialize, maybe re-run
  code, maybe process new data).
- **`.git` reconstructs the repo (the precedent for the whole storage model).** The
  `.git` object store *is* the repository — the working tree is derived (checkout) and
  always rebuildable for any committed version; only uncommitted edits live outside it.
  So a subscriber that replicates the object store (refs + sparse objects) can
  reconstruct any version's working tree locally — the basis of git-over-P2P, and the
  living proof of "log/object-store = truth, folder/file = a disposable projection."
- **Commit as a checkpoint for enhanced checks.** Because commit/push is the slow,
  durable heartbeat, it is the natural gate to run **automated tests / invariants /
  semantic-conflict detection** before state is promoted to the durable tier — cheap
  to afford at that cadence. This is also the **verification step that closes an
  AI-merge** (below): resolve → test-on-commit → record. (git's commit hooks / a
  commit-triggered test run.)

**Staging:**
1. *Concept POC, cheap, buildable now* — wrap the commit op to also append the
   commit-id to a Hypercore branch-log; a subscriber peer sees the append and reacts.
   Works even over the existing spawn-`git` (git commits; Hypercore broadcasts). Proves
   "commit = broadcast = change event" without deep git work.
2. *Native, via isomorphic-git* — git's object model in JS with a pluggable backend →
   ref-log on a Hypercore, objects in a sparsely-replicated drive. Then the commit
   **is** the broadcast (no separate step). The `streaming-fabric.md` endgame
   ("Hyperdrive cache over the git object store").

**Bare git is the enabler.** `lib/git` today shells out to the system `git` binary
(`spawnSync`) — it can't run in a distroless/Pear peer. A **bare port** (isomorphic-git
barified: bare-fs adapter; local `init`/`add`/`commit`/`log`/`checkout` first, transport
— eventually P2P — later) makes git a native base-layer citizen. Feasibility is
*probable but unproven* → a probe (load isomorphic-git under Bare, do a local commit
against bare-fs) gates the native version.

## How the tiers map to the building blocks

The substrate primitives (`p2p-building-blocks.md`) compose into the three tiers:

- **data-change-event stream** = log replication + a local watch. This **subsumes
  live-reassignment (M2)** — "watch the manifest log, re-pick-up" is just one instance
  of "react to a change in a subscribed log". So the reactive core *is* the general
  case M2 was a special case of.
- **RPC** = connect-by-key (R3) + an avsc-rpc protomux channel (R5/R6).
- **commit-broadcast** = a git ref-log as a subscribable stream + sparse object fetch.

## Open (marked — to design when pressure surfaces)

- **Heartbeat** of the middle tier — react-on-arrival vs a periodic wake-sync-process
  beat (matters for latency, resource use, intermittent peers). *Deferred.*
- **Subscription granularity / path-filtering** — react to every append, or only to
  changes touching certain paths? (The efficiency lever.)
- **Cursor/offset facilities** — the exact rewind/replay API and crash-resume.
- **Consumer groups / multiple instances** — who processes a change when a repo-role
  runs on several peers? *Deferred — various ways; start single-instance.*
- **Code-version binding & reprocessing** — when DNA updates (a new code version
  appended), reprocess history or only new data? The log makes both possible.
- **Shared reality / merge** — consensus across repos; Autobase territory. **Decision
  rule (settling): match the merge implementation to the data.**
  - *Judgment wanted* — co-edited artifacts (code, docs, configs, structured
    documents) → **git 3-way + AI**. Git supplies the ideal framing (base/ours/theirs)
    and an auditable, reversible commit; AI supplies semantic judgment, going *beyond*
    git's line-merge (and catching semantic conflicts a clean text-merge misses). The
    resolution is **verified by automated tests on commit** (above) and recorded as a
    commit — low-stakes because it's reviewable and revertable.
  - *Determinism wanted* — high-volume event streams → **Autobase** deterministic
    merge; no judgment in the loop, just a rule.
  - The **base layer is single-writer → no merge**; this rule applies only to the
    shared-reality / multi-writer layer. Open: the exact mechanism per data type, and
    structural (record/field-level) merge for data vs git's line-orientation.
- **isomorphic-git under Bare** — the probe; gates native commit-broadcast.

## Where it acts / next

- This draft is the Mycelium execution model; with `streaming-fabric.md` (storage) it
  is the **native-P2P-Mycelium design** that replaces the transport-swap chapter.
- **Round 3** realises it: spl's fabric composed from the building blocks on the
  cluster, validated against the **fs/TCP spl6 oracle** (the existing build stays the
  reference; native grows alongside).
- Enabling threads, both small: the **commit-broadcast concept POC** and the
  **isomorphic-git-under-Bare probe**.
