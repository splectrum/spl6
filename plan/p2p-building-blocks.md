# P2P building blocks — a map for build / run / manage structure

Internal, **living**. The point of Chapter 3 isn't a single managed-cluster feature
— it's a **catalogue of the swarm's primitives for structure**, each *exercised and
de-risked*, so we know exactly what we're building with. The addressing/discovery
modes aren't competing options; they're different building blocks, all necessary.
This map is the index: a few **primitives** that **compose** into the operations to
**build, run, and manage** structure. Round 2 tests the blocks; Round 3 is spl
composing them.

Relaxed by design — it will have gaps; complete it later when something surfaces.

Status: ✅ proven (exercised in a phase/probe) · ◐ partial · ⬜ open (candidate
single-concern step). "Where" points at the phase/probe that proved it.

## The primitives (raw blocks the swarm gives)

| | Primitive | What it is |
|---|---|---|
| P1 | **Keyed identity** | a keypair *is* an address; deterministic derivation from a seed |
| P2 | **Topic announce/lookup** | Hyperswarm `join(topic, {server/client})` — rendezvous, discover-many (anycast) |
| P3 | **Connect-by-key** | HyperDHT `connect(pubkey)` / `joinPeer` — unicast to a *known* node |
| P4 | **Encrypted transport** | Noise secret-stream; direct vs holepunched |
| P5 | **Protomux channels** | many named protocols multiplexed on one connection |
| P6 | **RPC** | avsc-rpc (AVRO) request/response over a channel |
| P7 | **Pub/sub** | fan-out events over connections |
| P8 | **Hypercore** | append-only signed log — the base of the data family |
| P9 | **Hyperbee** | ordered key/value over a core |
| P10 | **Hyperdrive** | filesystem over cores |
| P11 | **Autobase** | multi-writer / merge over cores |
| P12 | **Replication** | sync a core/drive by key; sparse/selective |
| P13 | **Signed content** | Hypercore signatures → *trust = the key* |

*Storage floor:* the whole data family (P8–P12) sits on **RocksDB** (`hypercore-storage`;
corestore 7 — storage + atomicity), **bundled in Pear**. It's the one **native** dep
under the otherwise-pure-JS upper layers (absorbed at build time; proven under Bare).
The `libatomic.so.1` step is **distroless-only**, not a Pear concern.

## BUILD structure — compose the shape, as data

| | Block | Status | Where / note |
|---|---|---|---|
| B1 | Keyed cluster identity (drive key from a seed) | ✅ | 5.0 — deterministic `corestore` primaryKey [P1,P13] |
| B2 | **Worker identity keys** (each worker a keyed, addressable entity) | ✅ | 5.3 — derived `H(seed‖name)` → `DHT.keyPair`; published in a signed registry [P1] |
| B3 | Code + manifest/registry in a signed drive | ✅ | 5.0/5.1; registry 5.3 [P10,P12,P13] |
| B4 | Mutable shared structure — config/registry as **Hyperbee**; multi-writer via **Autobase** | ⬜ | the streaming-fabric direction [P9,P11] |
| B5 | **Native git** in a peer (version layer) — isomorphic-git under Bare | ✅ | probe `isomorphic-git-under-bare`; pure-JS, no fork; use the ESM build [P10,P13] |
| B6 | **fs-over-Hyperdrive shim** (a `bare-fs` sibling, drive-backed) → git-on-Hyperdrive | ⬜ | thin shape-matching shim (v10 had a node-fs API); build it [P10] |

## RUN structure — make it live

| | Block | Status | Where / note |
|---|---|---|---|
| R1 | Topic rendezvous / role (service) discovery | ✅ | 1,3,5 — anycast "find a provider" [P2] |
| R2 | Mesh (everyone server+client) | ✅ | 4 — pub/sub fan-out topology [P2] |
| R3 | **Connect-by-key** (reach a *specific* worker) | ✅ | 5.3 — `swarm.joinPeer(key)`, no shared topic; probe `connect-by-key` [P3] |
| R4 | Direct connect vs holepunch | ◐ | direct proven 1 (flat bridge); NAT traversal is Ch 8 [P4] |
| R5 | Protomux multi-channel — RPC + replication on one conn | ✅ | 5.2 + probe; unlocks multi-role-per-worker [P5,P6,P12] |
| R6 | RPC primitive (1:1) | ✅ | 2,3,5 [P6] |
| R7 | Pub/sub primitive (1:many) | ✅ | 4 [P7] |
| R8 | Code mobility — pull + execute (memory / checkout) | ✅ | 5.0–5.2; Pear-native vs bridge [P10,P12] |
| R9 | Pub/sub **over protomux** (coexist with RPC + replication on one conn) | ⬜ | only RPC+repl coexistence proven so far [P5,P7] |

## MANAGE structure — operate and change it

| | Block | Status | Where / note |
|---|---|---|---|
| M1 | **Target a specific worker** (connect-by-key) | ✅ | 5.3 — client resolves a worker's key from the registry, connects by key; both workers run echo, only the targeted one serves [P3] |
| M2 | Live re-assignment — change the manifest, workers re-pick-up (watch the drive) | ⬜ | leans on "watch the log" [P10/P12] |
| M3 | Lifecycle — add / drain / restart; graceful stop | ◐ | SIGTERM stop proven; drain/restart open |
| M4 | Health / observability — heartbeats, status query by identity | ◐ | thin emitter phase-3; query-by-identity open [P6+P3] |
| M5 | Dynamic scaling / re-placement of roles across nodes | ⬜ | static manifest now; dynamic builds on M2 |
| M6 | Membership / registry — who's in the cluster, liveness | ⬜ | Hyperbee registry, or pub/sub presence [P9,P7] |
| M7 | Retention / availability — ≥k copies + repair loop | ⬜ | placement in the registry + connect-by-key; spectrum full-retainer ↔ partial-coverage-with-repair ↔ erasure (`mycelium-streaming-layer.md`) [P12,P3] |

## What's left to explore (the open cells, as single-concern steps)

Judged ordering — load-bearing first; relaxed, not fixed.

- ✅ **Worker identity + connect-by-key** (B2 + R3 + M1) — *done, 5.3.* Keyed
  identity + the base target-a-specific-node op; the registry binds name → key → roles,
  so service-addressing can resolve through it to a connect-by-key.
- ✅ **Native git in a peer** (B5) — *done.* isomorphic-git under Bare, no fork
  (probe `isomorphic-git-under-bare`).

1. **Live re-assignment** (M2). Manager edits the manifest; workers watch the drive
   and re-pick-up without restart — the "managed" cluster coming alive; first real
   use of *watch the log*.
2. **Pub/sub over protomux** (R9). Fold the phase-4 primitive onto the 5.2 substrate
   so events, RPC, and replication share one connection — completes the channel
   picture.
3. **Membership / presence + health query** (M6 + M4). Know who's live and ask a
   *specific* node its status (uses connect-by-key) — needed before drain/restart.
4. **Retention / availability** (M7). ≥k copies + a repair loop; placement in the
   registry, fetch via connect-by-key. Start with the few-full-retainers backstop.
5. **fs-over-Hyperdrive shim** (B6). The `bare-fs` sibling → git-on-Hyperdrive; a thin
   shape-matching shim, reusable beyond git.
6. **Mutable shared structure** (B4). Hyperbee as a config/registry; Autobase for
   multi-writer — the bridge to the streaming-fabric direction (and to Round 3/spl).
7. **Lifecycle: drain / restart** (M3). Graceful role hand-off, building on M1/M6.

Deferred beyond this round: holepunch/NAT traversal (R4 → Ch 8), drive-as-module-root
execution (deep Pear-loader path), and the discovery-of-unknowns case (mostly moot
in a single-trust-domain cluster the manifest already enumerates).

## How the modes relate (so the map isn't read as a menu)

- **Connect-by-key (R3/P3) is the base** addressing primitive — HyperDHT's core op is
  "reach this key." **Topic discovery (R1/P2)** is the discover-many layer on top.
  Both are needed: anycast for interchangeable service instances; unicast for
  management, state, and per-node responsibility.
- **Protomux (R5/P5)** is the structure-within-a-connection layer: once you've reached
  a node, you multiplex RPC / pub/sub / replication over the one connection by channel
  name. It's neutral to *how* you found the node.
- The **manifest (B3)** is doing double duty — placement *and* directory; in a managed,
  single-trust-domain cluster it largely replaces topic-based discovery-of-unknowns.

This is the substrate spl inherits in Round 3: a peer with a keyed identity, reachable
directly, serving many namespace handlers as many protomux channels, over signed
replicated logs.
