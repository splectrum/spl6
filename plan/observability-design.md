# Operational visibility — design notes

Internal design notes for **self-instrumented P2P code**: operational event
streams built into the fabric from the ground up, not print-debugging bolted on
per bug. Motivated by the Phase 1 connection investigation
(`poc/p2p-docker-dev/journey/phase-1-peers-connect.md`), where visibility was a
supporting actor — the daemon exit codes carried the diagnosis, and the decisive
evidence came from purpose-built probes, not the session log. As P2P scenarios
get more complex (routing, multi-peer, code distribution), we need this as a
first-class capability.

Calibrated: the layered model and the seam principle are settled; specific
schemes are marked **open** and settle as the code teaches us (Phase 2 onward).

## Two needs, not one

Conflating these is the trap:

1. **Per-node leveled logging** — `trace/debug/info/warn/error`, structured
   fields, a verbosity dial. Production-maturity; well-understood.
2. **Cross-peer operational streams** — an "operation" (an RPC, a connection
   setup, a code-distribution, a re-route) **spans multiple peers**. Levels on
   one node can't reconstruct it; you need **correlation** (a trace/op id +
   connection id + peer keys) threaded through the protocol so separate nodes'
   streams stitch together. This is distributed-tracing territory — the
   genuinely P2P-hard part, and the heart of the requirement.

## What the ecosystem gives us (verified under Bare — see probe)

`poc/p2p-docker-dev/probes/observability-under-bare/` confirms, on the cluster's
own Bare/distroless image:

| Building block | What it is | Under Bare | Fit |
|---|---|---|---|
| **pino-bare** | pino port — fast leveled JSON logging, child loggers | ✓ works (early/light maint.) | per-node logging (need 1) |
| **hypertrace** (`holepunchto`) | within-process class/function tracing; `{id,object,parent,caller}`; ~zero overhead off | ✓ works (v1.4.2) | within-process deep dives |
| **hypertrace-prometheus** | Prometheus/Grafana export for hypertrace | (not tested) | metrics/collection later |
| **pear-inspect** / `pear --log` | live remote inspect + sidecar logs | (Pear-era) | live debugging on Pear |

**Gaps found:** (a) no off-the-shelf **cross-peer correlation** (hypertrace is
within-process only); (b) the **Holepunch modules we bundle are not
hypertrace-instrumented**, so hypertrace traces *our* code, not hyperswarm
internals.

## The model (recommendation)

Five layers, mostly assembled from existing parts + one piece that is ours:

1. **Event schema + per-node logging.** Adopt **pino's schema** (level, time,
   structured fields, `msg`) and child/bound-context loggers. **Recommendation:
   own a thin pino-schema-compatible emitter** rather than depend on pino-bare —
   it's a *foundational* concern, pino-bare is early/lightly-maintained, and we
   own runtime code (the roadmap invariant). Staying pino-format-compatible keeps
   pino's tooling (pretty-printers, transports, shippers) available, and we can
   swap to pino-bare/pino if it matures. *(open: own-emitter vs adopt pino-bare.)*
2. **Cross-peer correlation — OURS, at the fabric seams.** No off-the-shelf
   answer. Thread a correlation context (trace/op id + connection id + the peer
   keys we already have) through the protocol/RPC, emitted **once at the
   transport/dispatch seams**. Borrow the distributed-tracing model (trace id →
   span → parent span) *lightly* — swarm-appropriate, not full OpenTelemetry.
   *(open: exact id scheme + how it rides the protocol — settles at Phase 2.)*
3. **Within-process deep tracing — hypertrace, opt-in.** Use it to instrument
   *our* fabric classes (transport, dispatch, execute) for a deep dive; ~zero
   overhead when off; Prometheus export available. Not always-on.
4. **Live debugging — pear-inspect / `pear --log`** once we're on Pear.
5. **Collection / query — deferred (pressure-timed).** The cross-run/cross-peer
   aggregation+comparison gap (felt during the Phase 1 bisect). Options when it
   bites: hypertrace-prometheus for metrics, or a simple collector over the JSONL
   streams. Correlation ids (layer 2) are what make later aggregation meaningful.

## The principle

**Instrument at the seams, not per-handler.** In Phase 1 we kept bolting
`peer-error`/`peer-open`/`client` onto `node.js` by hand — the anti-pattern. In
spl's model (thin handlers, infrastructure in `lib/`, pack-at-boundary), the
**transport and dispatch layers** are where operational events should be emitted
*once*, with correlation context, so every app/handler inherits visibility. An
operational event stream becomes a **native output of the fabric** — every
onion/transport crossing emits a structured, leveled, correlation-carrying event.
This fits the architecture we already have rather than fighting it.

## Settled enough to adopt now

- **Levels:** `trace/debug/info/warn/error`; operational lifecycle events are
  `info`; default threshold `info`, dialled by env.
- **Format:** one JSON object per line, pino-compatible (`level`, `time`, plus our
  fields); stdout is the substrate (Phase 0.2 model). Daemon-layer (docker events)
  stays the authority for liveness/exit, merged by the capture tool.

## Open (settle as code teaches us)

- Own thin emitter vs adopt `pino-bare` (foundational call — confirm with Jules).
- Correlation-id scheme + protocol propagation (settles when avsc-rpc crosses
  peers — **Phase 2**).
- Whether to instrument fabric classes via hypertrace or plain emit at the seams.
- Collection/query layer choice + when (pressure-timed).

## Implementation path (tied to the roadmap)

- **Phase 2 (avsc-rpc over Hyperswarm)** — first real cross-peer operation;
  introduce the correlation context here. Adopt the event schema + levels now so
  Phase 2 emits consistently (no repeat of the ad-hoc Phase-1 debt).
- **Round 2 (test rig)** — asserts against the structured stream; per the Phase 1
  retro it needs **multi-scenario capture + comparison** and **teardown
  visibility** (the live follower dies before teardown today).
- **Platform (Ch 5–7)** — operational event stream as a first-class fabric output;
  settle seam instrumentation and the correlation model in the mature design.
