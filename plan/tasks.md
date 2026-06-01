# Tasks

Working task list. The durable home for in-flight and queued work — checked in
so it survives sessions and stays out of the always-on context window. Update
as work moves; the git log is the history.

Status: ⬜ pending · 🔄 in progress · ✅ done (drop when stale).

## In progress

- 🔄 **Round 1 — managed dev cluster** (`poc/p2p-docker-dev`).
  Phases 0→4. Done: 0.1 hello node, 0.1.1 slim image, 0.2 watchable cluster,
  **1.0 peers connect** (private DHT, `firewalled:false` direct — holepunch is
  for NAT traversal and fails on a no-NAT bridge), **2.0 avsc-rpc over the swarm**
  (Echo RPC round-trips over the encrypted stream via `createChannel(conn)` — same
  call spl uses over TCP; correlation id threaded through, appears in both peers'
  streams). Module fix: avsc/avsc-rpc forks now declare deps (pushed to
  bare-for-pear); image clones them via https (npm git-deps fragile).
  **3.0 roles & routing** (RPC 1:1 — named services, route name→topic→peer;
  multi-peer + no-peer fallback; thin pino-schema emitter folded in), **4.0
  pub/sub mesh** (1:many — every member server+client, one emits, others receive,
  no hub; the contrast to the RPC primitive). **Repo restructured: one
  self-contained folder per phase** + a top README (product + journey).
  Next: **managed code distribution & responsibilities** (a manager seeds
  role-code on a Hyperdrive; nodes pull + run it, trust = signed key; "what runs
  where" data-driven) — the next POC phase folder. Programme: `p2p-poc-roadmap.md`
  (pub/sub was added as a contrast primitive beyond the original phase list).

- 🔄 **Operational visibility** (`observability-design.md`). Design settled at the
  model level (researched + verified under Bare: pino-bare, hypertrace; gaps:
  no off-the-shelf cross-peer correlation). Principle: instrument at the fabric
  seams, emit a leveled, correlation-carrying event stream. **Graduated, two-tier:**
  production = minimal detect/localize; full diagnosis escalated in isolated
  reproductions (probes are the Tier-2 vehicle). **Thin pino-schema emitter built
  in Phase 3** (`phase-3-roles-routing/log.js`: levels, `.child()` correlation
  context, `--debug` dial). Still open: env-driven `LOG_LEVEL` (needs Bare env
  access), the seam-level instrumentation, and graduating the emitter to a
  shared component.

- 🔄 **Streaming fabric — log as substrate** (`streaming-fabric.md`). Settled
  direction: SPLectrum is streaming at heart; the log is the substrate;
  Kafka↔Hypercore (single-writer logs + Autobase, ordering decentralised, no
  consensus). The streaming/topic setup should become a reusable component other
  repos + substrate types attach to (topic/append/replay/subscribe over
  stream-records + AVRO). Open: retention/compaction (Hypercore has sparse +
  clear/truncate but no built-in retention), multi-writer-per-topic choice,
  component API. Acts at Round 3 (spl on cluster) → Platform (Mycelium) → Ch 8.

## Queued

- ⬜ **Stand up the doc-freshness agent routine.** Spec is validated
  (`tools/doc-freshness-agent.md`) — the cross-repo four-stage loop with a
  sign-off gate. Run it for real against the Infrastructure hub.
- ⬜ **Ecosystem discovery pass.** Hunt for new bare/p2p/pear projects to add to
  the Ecosystem survey on splectrum.world. (It grows over time.)

## Deferred (Platform-era)

- ⬜ **Build the doc-freshness loop as a SPLectrum tool.** Once we're doing spl
  tooling, realise the freshness loop as a proper tool rather than a prompt.
