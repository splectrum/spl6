# Tasks

Working task list. The durable home for in-flight and queued work — checked in
so it survives sessions and stays out of the always-on context window. Update
as work moves; the git log is the history.

Status: ⬜ pending · 🔄 in progress · ✅ done (drop when stale).

## In progress

- 🔄 **Round 1 — managed dev cluster** (`poc/p2p-docker-dev`, subtree →
  `pear-full-square/p2p-docker-dev`). **One self-contained folder per phase** + a
  top README (product + journey). Built & runnable:
  - **phase-0-node-and-monitoring** — Bare node + one structured event stream
    (`capture.sh` merges app stdout + daemon lifecycle).
  - **phase-1-peers-connect** — private DHT; `firewalled:false` direct connect
    (holepunch is for NAT traversal and fails on a no-NAT bridge).
  - **phase-2-rpc** — avsc-rpc over the encrypted stream via `createChannel(conn)`
    (the same call spl uses on TCP); correlation id across peers.
  - **phase-3-roles-routing** — RPC 1:1, name→topic→peer, multi-peer + no-peer
    fallback; thin pino-schema observability emitter (`log.js`) folded in.
  - **phase-4-pubsub-mesh** — pub/sub 1:many, every member server+client, no hub
    (the contrast to the RPC primitive).
  - **phase-5-managed-code (5.0)** — the cluster becomes *managed*. A manager seeds
    role-code into a **signed Hyperdrive**; a generic worker (no business logic)
    replicates it by the **trusted key**, pulls a role, and runs it; a client calls
    the service — proving the worker runs distributed code (`session.jsonl`:
    role-pulled → role-loaded → role-serving → 11 RPC triples). First use of the
    storage stack (corestore/hyperdrive). **Trust = a signed key** is intrinsic
    (drive key = manager's public key; deterministic from `CLUSTER_SEED`, so workers
    are *configured* with the public key, not told it at runtime). **Two execution
    pathways** (`EXEC`): `memory` (`new Function`, no OS disk — the **Pear-native**
    target) and `checkout` (`bare-fs` + `require` — the deliberate **bridge into the
    non-P2P world**: testing, hybrid). Design aim: Pear-native is the final model,
    checkout is a first-class escape hatch (a worker materializing pulled code to run
    is the *"filesystem as a derived checkout"* idea in miniature). Both proven.
  - **phase-5-managed-code (5.1)** — placement is now **data-driven**. The manager
    seeds multiple roles (`echo`, `reverse`) **+ a signed `assignments.json` manifest**;
    workers are no longer told their role on the command line — each reads the
    manifest off the replicated drive and **self-assigns** by name (no-role fallback
    if absent). Demonstrated with 3 workers / 2 clients: `echo` placed on worker-a +
    worker-c (many-workers-one-role), `reverse` on worker-b; both clients get live
    responses (`reverse@worker-b: 5# gnip`).
  - **phase-5-managed-code (5.2)** — the connection moves to **protomux** (single
    concern). Every connection carries, on one muxer: replication (`store.replicate`)
    + each role's RPC on its **own named channel** (`Protomux.from(conn)`, accepted by
    protocol name). Kills 5.1's `info.topics` routing hack and **unlocks
    multi-role-per-worker**: worker-a runs `["echo","reverse"]`, and one client asking
    for both reaches it on **one connection**, opening one channel per service (26 RPC
    triples, both answered). avsc-rpc (AVRO) rides a channel via a small channel↔duplex
    adapter (`channel.js`). Discovery left unchanged (per-service topics) and the
    **worker-identity discovery model documented as open** (explore, not chosen). This
    is the substrate spl's many-handlers-per-peer inherits in Round 3.
  - **phase-5-managed-code (5.3)** — **worker identity + connect-by-key** (B2+R3+M1).
    Each worker has a keyed identity (`H(CLUSTER_SEED‖name)` → `DHT.keyPair`; the seed
    never leaves the manager); its swarm runs under that keypair so it's reachable by
    key. The manager seeds a signed **registry** `name → {key, roles}` (placement +
    directory). The client resolves worker-b's key from the registry and connects
    **by key** (`swarm.joinPeer`) — both workers run echo, but only worker-b serves
    (worker-a: 0 calls), proving targeting a *specific* node vs "any provider". Probe:
    `connect-by-key` (derive determinism + joinPeer with no shared topic). Both
    addressing modes (service-addressed, identity-addressed) now exist as blocks.
  - **phase-6-reactive-dataflow** — the execution-model **heart**, proven (probe
    `reactive-core`): a two-hop cascade source → transform → sink, each **live-tailing**
    its upstream (`createReadStream({live})` is pushed, not polled), reacting, and
    **emitting to its own log** (waking the next); cursor = `contiguousLength`
    (resumable/replayable). Subsumes live-reassignment (M2). The over-the-swarm version
    is composition with phase-5's proven replication → Round 3 (with real spl records).
    **This was the last must-prove exploratory POC.**

  Probes committed (scrubbed run logs): holepunch-under-bare, udx-on-bridge,
  connect-via-public-dht (phase-1); avsc-rpc-under-bare, observability-under-bare
  (phase-2); **hyperdrive-replicate-under-bare** + **avsc-rpc-on-protomux** +
  **connect-by-key** + **isomorphic-git-under-bare (phase-5)** — storage
  replicates-by-key + both exec pathways (pinned: `libatomic.so.1`; `findingPeers()`
  before `update()`); avsc-rpc rides a named protomux channel + replication/RPC coexist
  on one secret-stream (pinned: `corestore.replicate` needs a real protocol stream);
  deterministic identity-key derivation + `joinPeer`-by-key with no shared topic; and
  **isomorphic-git runs under Bare unmodified** (pure-JS git on `bare-fs`; init/commit/
  log + working-tree reconstruction; **no fork** — npm dep; pinned: use the ESM build,
  Bare resolves the "node" condition which hard-requires `crypto`); and **reactive-core
  (phase-6)** — live-tail cascade (source→transform→sink), `createReadStream({live})`
  pushed not polled, cursor = `contiguousLength`. Hygiene: `scrub.sh` (masks
  IPs/keys in committed logs), `.env` parameterised config. Module fix: avsc/avsc-rpc
  forks now declare deps (pushed to bare-for-pear); image clones them via https.

  **Framing:** the round's deliverable is a *catalogue of swarm primitives for
  structure* — see the living map **`p2p-building-blocks.md`** (primitives ×
  build/run/manage, proven/open). Each remaining single-concern step exercises one
  open cell and fills in the map.

  **Exploratory POC phase complete** — every load-bearing primitive the native-Mycelium
  design leans on is proven under Bare (identity + connect-by-key, protomux multi-channel,
  replication, code mobility, native git, reactive dataflow). The honest next move is the
  **Mycelium build (Round 3)** — spl's fabric composed from these primitives, validated
  against the fs/TCP oracle — not more POCs. Remaining open cells (live-reassignment
  in-cluster, pub/sub-over-protomux, retention/availability, membership/health,
  fs-over-Hyperdrive shim, Autobase/shared-reality) are build-it-when-needed or deferred.
  Programme: `p2p-poc-roadmap.md`; building blocks: `p2p-building-blocks.md`.

- 🔄 **Native P2P Mycelium — the direction** (design thread in `plan/`; pivot
  decided). Gear toward designing & implementing Mycelium **natively P2P on the
  log family**, because it **naturally unifies the language substrates** (Kafka =
  log, AVRO = encoding, Git = version layer, URI/XPath = addressing, filesystem =
  checkout). The design pair **replaces the old "Chapter 4 = transport swap" framing**
  (P2P is a substrate, not a pipe; spl's conceptual core carries forward, the
  substrate-facing layer is redesigned). Discipline: the fs/TCP spl6 build stays the
  working **oracle**; native P2P Mycelium grows alongside (Round 3 → Platform). The
  notes (calibrated settled-vs-open):
  - **`mycelium-streaming-layer.md`** (new) — the **execution model**: reactive
    dataflow over logs; three cadence tiers (git commit/push = slow durable heartbeat,
    data-change-event streams = working cadence, RPC = fast minority); local code DNA;
    commit-broadcast as the worked example (branch = stream, commit = publish, checkout
    = materialize); git/log boundary by mutability (immutable records → log, mutable
    structure/code/references → git); merge rule (judgment → git 3-way + AI +
    tests-on-commit; determinism → Autobase). Enabling threads: commit-broadcast
    concept POC + isomorphic-git-under-Bare probe.
  - `observability-design.md` — graduated two-tier instrumentation (production =
    detect/localize; full diagnosis in isolated probes). Thin pino-schema emitter
    **built in phase-3** (`log.js`). Open: env-driven `LOG_LEVEL` (Bare lacks env),
    seam-level instrumentation, graduate the emitter to a component.
  - `streaming-fabric.md` — SPLectrum streaming at heart; log-as-substrate;
    Kafka↔Hypercore (single-writer + Autobase, no consensus); **storage model** =
    native log family (Hypercore→Hyperbee/Hyperdrive), OS filesystem as a
    git-mirrored checkout, realised as a **Hyperdrive cache over the git object
    store** (tested against plain `.git`); **cascading-references** composition
    (refs = drive keys + sparse replication vs vendored subtrees); **principle:
    minimal base, open implementations** (trust/merge/Autobase/branching per use
    case). Acts at Round 3 → Platform → Ch 8 (git-over-P2P).
  - Roadmap invariant (`p2p-poc-roadmap.md`): **the application owns all runtime
    code** (deps absorbed at build time; trust = signed key).

## Queued

- ⬜ **Stand up the doc-freshness agent routine.** Spec validated
  (`tools/doc-freshness-agent.md`) — cross-repo four-stage loop + sign-off gate.
  Run it against the Infrastructure hub.
- ⬜ **Ecosystem discovery pass.** Hunt for new bare/p2p/pear projects for the
  Ecosystem survey on splectrum.world.

## Deferred (Platform-era)

- ⬜ **Build the doc-freshness loop as a SPLectrum tool** (vs the current prompt).
