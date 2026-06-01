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
  **Repo is restructured: one self-contained folder per phase** (own README/code/
  scripts/logs/probes) + a top README (product + journey). Each phase's story is
  its `README.md`.
  Next: **Phase 3 — roles & routing** (name→topic; a node announces what it
  serves; a client resolves name→topic→peer; multi-peer + no-peer fallback).
  Programme: `p2p-poc-roadmap.md`.

- 🔄 **Operational visibility** (`observability-design.md`). Design settled at the
  model level (researched + verified under Bare: pino-bare, hypertrace; gaps:
  no off-the-shelf cross-peer correlation). Principle: instrument at the fabric
  seams, emit a leveled, correlation-carrying event stream. **Graduated, two-tier:**
  production = minimal detect/localize; full diagnosis escalated in isolated
  reproductions (probes are the Tier-2 vehicle). Decided: own a thin pino-schema
  emitter. **Acts at Phase 2** — introduce correlation ids as avsc-rpc first
  crosses peers; adopt the event schema + levels now.

## Queued

- ⬜ **Stand up the doc-freshness agent routine.** Spec is validated
  (`tools/doc-freshness-agent.md`) — the cross-repo four-stage loop with a
  sign-off gate. Run it for real against the Infrastructure hub.
- ⬜ **Ecosystem discovery pass.** Hunt for new bare/p2p/pear projects to add to
  the Ecosystem survey on splectrum.world. (It grows over time.)

## Deferred (Platform-era)

- ⬜ **Build the doc-freshness loop as a SPLectrum tool.** Once we're doing spl
  tooling, realise the freshness loop as a proper tool rather than a prompt.
