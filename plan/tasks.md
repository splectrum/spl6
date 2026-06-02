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

  Probes committed (scrubbed run logs): holepunch-under-bare, udx-on-bridge,
  connect-via-public-dht (phase-1); avsc-rpc-under-bare, observability-under-bare
  (phase-2). Hygiene: `scrub.sh` (masks IPs/keys in committed logs), `.env`
  parameterised config. Module fix: avsc/avsc-rpc forks now declare deps (pushed
  to bare-for-pear); image clones them via https.

  **Next: phase-5 — managed code distribution & responsibilities** (a manager
  seeds role-code on a Hyperdrive; nodes pull + run it, trust = signed key; "what
  runs where" data-driven). Then Round 2 (script test rig), Round 3 (spl on the
  cluster). Programme: `p2p-poc-roadmap.md`.

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
