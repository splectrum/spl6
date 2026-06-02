# POC roadmap (Chapter 3) — rounds & phases

Internal. The POC programme, organised as **rounds** (each builds on the last),
each round in **phases** (a phase = a goal), each phase grown through **as many
iterations as it takes** — we don't fix the count up front. Builds on the
harness patterns in `p2p-test-deployment-findings.md`.

**Framing (what this round is really for):** the deliverable is a *catalogue of the
swarm's primitives for structure* — building blocks exercised and de-risked, not one
managed-cluster feature. The living index is **`p2p-building-blocks.md`** (primitives
× build/run/manage, with proven/open status); the remaining single-concern steps each
*exercise one open cell and fill in the map*. Round 2 tests the blocks; Round 3 is spl
composing them.

## Rounds (the staging)

1. **Round 1 — a managed dev cluster of P2P nodes (non-spl).** *[this round]*
   Build an *operable* cluster from the modules (avsc-rpc, Hyperswarm/HyperDHT,
   Hyperdrive): containerised single-concern Bare nodes, a private DHT,
   stdout/stderr monitoring, and a manager that distributes code + assigns
   responsibilities. Deliverable: a cluster you can spin up, give roles, and
   watch. **No spl, no Pear.**
2. **Round 2 — a script-based test rig (non-spl).** Build reusable test
   infrastructure *on* the cluster: scripted scenarios that spin nodes up,
   drive inputs, and assert outcomes from the structured logs → automated
   pass/fail. Formalises the light checks from Round 1 into a real harness.
3. **Round 3 — spl on the cluster.** Layer spl's fabric (dispatch, handlers,
   stream-records) onto the P2P transport, and exercise it via the Round-2 rig.
   (≈ the Chapter 4 integration, POC'd first.)
4. **A dedicated cycle — Pear (dev → test → preprod → prod).** Pear is the
   *whole deployment lifecycle*, so it earns its **own POC cycle** — built on
   Rounds 1–2 as its **dev + test** foundations and extending to preprod/prod
   (packaging, distribution, OTA). Not a bolt-on.

*The rounds build the lifecycle bottom-up:* Round 1 is the **dev** stage (a
running cluster), Round 2 the **test** stage (automated testing) — the same
dev→test→preprod→prod lifecycle Pear later manages end-to-end.

## Invariant — the application owns all runtime code

The cluster is a single trust domain. A node only ever runs code that
originated from the application's own signed source; **no code is pulled from
elsewhere at runtime.** The swarm carries discovery and transport, never code
provenance from strangers (no "discover an unknown peer, pull its code, run it").

Two layers, both owned:
- **App role-code** — authored here; owned by definition.
- **Third-party deps** (Hyperswarm, avsc, …) — *absorbed* into the owned
  artifact at **build/bundle time** (vendored / barified / bare-pack), so at
  runtime nothing foreign is fetched. npm is a build-time supply-chain concern
  (pin / vendor), not a runtime dependency.

**Trust anchor = a signed key.** Managed code distribution (Phase 4) seeds the
app's *own* role-code into a signed Hyperdrive; nodes pull only from the key
they trust — the app's identity, the same way a Pear app is trusted by its key.
The private DHT bootstrap is a discovery rendezvous, not a code source.

Cross-application code sharing (trusting another org's signed key) is a
deliberate, separate decision — out of scope here; the default is total
app-ownership of everything that runs.

## Round 1 — setup (constant across its phases)

- **Straight Bare, native P2P** — nodes are Bare processes.
- **Containerised, one concern per node** — a Bare image with native prebuilds
  (incl. UDX); each node a single-concern "app."
- **Self-contained, one machine** — docker-compose; nodes + a **private DHT**
  (`DHT.bootstrapper`) on one bridge. Offline, deterministic. (Flat bridge ⇒
  no NAT between nodes; the hole-punch/traversal case is Chapter 8.)
- **Monitor via stdout/stderr** — structured event lines, watched via
  `docker compose logs -f`. (The formal, reusable asserting **test rig** is
  Round 2; Round 1 verifies lightly as it builds.)
- **Lives in** `pear-full-square`.
- **Modules, not spl** — exercises avsc-rpc / Hyperswarm / Hyperdrive; spl is
  Round 3.
- **Role = topic subscription** (Hyperswarm `join`) — the *names* served are an
  arbitrary convention here (spl's namespace paths arrive in Round 3).
- **Scope honesty:** one machine proves plumbing, discovery, roles, transport,
  code-distribution — *not* real NAT traversal (the VPS swarm, Chapter 8).

## Round 1 — phases

Each phase is a **goal**; iterate (0.1, 0.2, …) until it's met. The iterations
below are a starting sketch, **not** a fixed list.

**Phase 0 — runnable node + monitoring.** *Goal:* a containerised Bare node you
can run and watch, no P2P yet. Sketch: 0.1 Bare image + a node logging
structured events; 0.2 compose + multi-node log aggregation via
`docker compose logs`. Light verification (the formal test rig is Round 2).

**Phase 1 — peers connect.** *Goal:* nodes discover and connect over a topic on
the private DHT. Sketch: the `bootstrap`; two nodes join a topic, connect,
exchange a hello over the encrypted stream.

**Phase 2 — transport.** *Goal:* avsc-rpc rides the P2P stream. Sketch: wire
avsc-rpc onto a Hyperswarm duplex, round-trip an AVRO RPC message. *(covers
old 3.1)*

**Phase 3 — roles & routing.** *Goal:* nodes carry responsibilities by topic,
and requests route to the right node. Sketch: name→32-byte-topic; a node
announces what it serves; a client resolves name→topic→peer; then a second node
with different responsibilities + routing + the no-peer fallback. *(covers old
3.2 / 3.3)*

**Phase 4 — pub/sub mesh.** *Goal:* the *other* messaging primitive, for contrast
with phase-3's RPC. Sketch: every member joins one topic `{server:true,client:true}`
so the swarm meshes them; each publishes line-delimited JSON on an interval and
receives the others' — one emits, the rest receive, no hub (1:many vs RPC's 1:1).

**Phase 5 — managed code distribution & responsibilities.** *Goal:*
single-concern nodes pull their own code and pick up assigned responsibilities —
"what runs where" data-driven; the cluster becomes *managed*. Sketch: a
`manager` seeds a Hyperdrive of role-code, a minimal node pulls + runs it
(trust = signed key); then the manager assigns responsibilities (code + topics);
capstone = the end-to-end demonstrator (manager + workers + client, all
monitored). **Built — 5.0:** manager seeds a signed drive, a generic worker
replicates by the trusted key and pulls + runs one role (`echo`), a client proves
it live. Trust = a signed key is intrinsic (drive key = manager's public key,
deterministic from a seed). Two execution pathways — `memory` (no OS disk, the
Pear-native target) and `checkout` (`bare-fs` + `require`, the bridge into the
non-P2P world for testing/hybrid). **5.1:** placement is data-driven — the manager
also seeds a signed `assignments.json`; workers self-assign by reading the manifest
(3 workers / 2 roles, incl. a shared role), not from argv. **5.2:** the connection
moves to **protomux** — replication + each role's RPC as named channels on one
connection, which unlocks **multi-role-per-worker** (one worker, many roles, one
connection per client; de-risked in `probes/avsc-rpc-on-protomux`). The substrate
spl's many-handlers-per-peer inherits in Round 3. **5.3:** worker **identity +
connect-by-key** — derived keypairs, a signed registry `name → {key, roles}`, and a
client targeting a *specific* worker by key (`probes/connect-by-key`); both
addressing modes now exist as blocks. Next single-concern steps: live re-assignment;
pub/sub over protomux; membership/health.

## Carries forward

- Round 1's **cluster + components** feed Round 2 (the test rig), Round 3
  (spl), and the Pear cycle — which is why those come after.
- POC insights feed the **Platform design review (Ch5–7)** and **deployment
  (Ch8)**, and surface the deferred docs (the Pear headless-embed/OTA subpage,
  pear-full-square write-ups, the barification cookbook).

## Open questions (resolve along the way)

- Runner/test-rig in Bare (`bare-subprocess`) vs a shell wrapper. (Lean: Bare.)
- **`pear-full-square` layout — decided: one repo *per round*.** The round's
  shared rig + components evolve as one codebase; phases/iterations are
  milestones (commits/tags) + a scenario script per phase, not separate
  sub-projects. A standout, genuinely-standalone POC may *graduate* to its own
  repo — the exception, not the default. (Per-POC repos rejected: they'd
  fragment the shared cluster.) Round 1 = one repo (e.g. `p2p-dev-cluster`);
  whether Round 2's test rig is a sibling repo or a `test/` area is decided at
  that boundary.
- The `manager`'s concrete role by Phase 4 (registry/coordinator: holds
  responsibilities + seeds role-code).
- name/path → 32-byte-topic hashing (Phase 3).
- Code-distribution trust: the signed-Hypercore key as the anchor; how a node
  learns which key/drive to trust.
