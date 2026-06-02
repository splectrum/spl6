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

  Probes committed (scrubbed run logs): holepunch-under-bare, udx-on-bridge,
  connect-via-public-dht (phase-1); avsc-rpc-under-bare, observability-under-bare
  (phase-2); **hyperdrive-replicate-under-bare** + **avsc-rpc-on-protomux** +
  **connect-by-key (phase-5)** — storage replicates-by-key + both exec pathways
  (pinned: `libatomic.so.1`; `findingPeers()` before `update()`); avsc-rpc rides a
  named protomux channel + replication/RPC coexist on one secret-stream (pinned:
  `corestore.replicate` needs a real protocol stream); deterministic identity-key
  derivation + `joinPeer`-by-key with no shared topic. Hygiene: `scrub.sh` (masks
  IPs/keys in committed logs), `.env` parameterised config. Module fix: avsc/avsc-rpc
  forks now declare deps (pushed to bare-for-pear); image clones them via https.

  **Framing:** the round's deliverable is a *catalogue of swarm primitives for
  structure* — see the living map **`p2p-building-blocks.md`** (primitives ×
  build/run/manage, proven/open). Each remaining single-concern step exercises one
  open cell and fills in the map.

  **Next (single-concern steps, judged order in the map):** ✅ worker identity +
  connect-by-key (5.3, done) → (1) **live re-assignment** (M2 — manager edits the
  manifest, workers watch the drive and re-pick-up without restart); (2) **pub/sub
  over protomux** (R9); then membership/health, mutable shared structure
  (Hyperbee/Autobase), lifecycle. Then Round 2 (script test rig), Round 3 (spl on the
  cluster). Programme: `p2p-poc-roadmap.md`; building blocks: `p2p-building-blocks.md`.

- 🔄 **Native P2P Mycelium — the direction** (design thread in `plan/`; pivot
  decided). Gear toward designing & implementing Mycelium **natively P2P on the
  log family**, because it **naturally unifies the language substrates** (Kafka =
  log, AVRO = encoding, Git = version layer, URI/XPath = addressing, filesystem =
  checkout). `streaming-fabric.md` is now the Mycelium direction, not just Platform
  input. Discipline: spl6 stays fs/TCP through migration; native P2P Mycelium is
  the Platform-era build. The notes (calibrated settled-vs-open):
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
