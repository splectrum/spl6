# Tasks

Working task list. The durable home for in-flight and queued work — checked in
so it survives sessions and stays out of the always-on context window. Update
as work moves; the git log is the history.

Status: ⬜ pending · 🔄 in progress · ✅ done (drop when stale).

## In progress

- 🔄 **Round 1 — managed dev cluster** (`poc/p2p-docker-dev`).
  Phases 0→4. Done: 0.1 hello node, 0.1.1 slim image, 0.2 watchable cluster,
  **1.0 peers connect** (private DHT bootstrap + two nodes join a topic and
  exchange a hello over the encrypted stream, bidirectional; deps bundled under
  Bare; `bare-signals` graceful stop). **Key fix:** flat bridge has no NAT, so
  nodes run the DHT `firewalled:false` and connect directly — holepunch is for
  NAT traversal and fails on a no-NAT net (full trace:
  `poc/.../journey/phase-1-peers-connect.md`). Probes kept under `poc/.../probes/`.
  Next: **Phase 2 — avsc-rpc over Hyperswarm** (round-trip an AVRO RPC message
  over the P2P stream). Programme: `p2p-poc-roadmap.md`.

- 🔄 **Operational visibility** (`observability-design.md`). Design settled at the
  model level (researched + verified under Bare: pino-bare, hypertrace; gaps:
  no off-the-shelf cross-peer correlation). Principle: instrument at the fabric
  seams, emit a leveled, correlation-carrying event stream. **Acts at Phase 2** —
  introduce correlation ids as avsc-rpc first crosses peers; adopt the event
  schema + levels now. Open call: own thin pino-schema emitter vs adopt pino-bare.

## Queued

- ⬜ **Stand up the doc-freshness agent routine.** Spec is validated
  (`tools/doc-freshness-agent.md`) — the cross-repo four-stage loop with a
  sign-off gate. Run it for real against the Infrastructure hub.
- ⬜ **Ecosystem discovery pass.** Hunt for new bare/p2p/pear projects to add to
  the Ecosystem survey on splectrum.world. (It grows over time.)

## Deferred (Platform-era)

- ⬜ **Build the doc-freshness loop as a SPLectrum tool.** Once we're doing spl
  tooling, realise the freshness loop as a proper tool rather than a prompt.
