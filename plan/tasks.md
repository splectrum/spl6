# Tasks

Working task list. The durable home for in-flight and queued work — checked in
so it survives sessions and stays out of the always-on context window. Update
as work moves; the git log is the history.

Status: ⬜ pending · 🔄 in progress · ✅ done (drop when stale).

## In progress

- 🔄 **Round 1 — managed dev cluster** (`poc/p2p-docker-dev`).
  Phases 0→4. Done: 0.1 hello node, 0.1.1 slim image, 0.2 watchable cluster
  (long-running nodes + `init:true` clean shutdown + `capture.sh` merging app
  stdout and daemon lifecycle into one JSONL session log). **Phase 0 met.**
  Next: **Phase 1 — peers connect** (private DHT; two nodes join a topic,
  connect, exchange a hello over the encrypted stream). Brings the first
  bundled `node_modules` (Hyperswarm) — fold in the deferred `bare-signals`
  graceful `stop` then. Programme: `p2p-poc-roadmap.md`.

## Queued

- ⬜ **Stand up the doc-freshness agent routine.** Spec is validated
  (`tools/doc-freshness-agent.md`) — the cross-repo four-stage loop with a
  sign-off gate. Run it for real against the Infrastructure hub.
- ⬜ **Ecosystem discovery pass.** Hunt for new bare/p2p/pear projects to add to
  the Ecosystem survey on splectrum.world. (It grows over time.)

## Deferred (Platform-era)

- ⬜ **Build the doc-freshness loop as a SPLectrum tool.** Once we're doing spl
  tooling, realise the freshness loop as a proper tool rather than a prompt.
