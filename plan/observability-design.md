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

## Core principle: graduated instrumentation — production detects, isolation diagnoses

Production carries only enough instrumentation to **detect and localize** a
problem — a small, always-on, low-overhead operational event set ("something is
wrong, and roughly where"). It does **not** carry the heavy instrumentation
needed to fully *resolve* an issue. Diagnosis happens by **escalating
instrumentation in an isolated reproduction**: dial the level up, switch on
hypertrace, turn on full trace/data collection, and replay the scenario — heavy
instrumentation is **opt-in and ephemeral, never a production tax**. This
explicitly rejects running a heavy, high-overhead observability stack in
production just to be able to resolve issues there.

Two tiers:

- **Tier 1 — production (always-on, minimal):** leveled operational lifecycle
  events at the seams (connect / disconnect / error-with-reason / route), plus
  cheap correlation ids (connection/op id) so a cross-peer problem can be
  *localized*. Cardinality and overhead kept to a budget. Goal: *detect + locate*.
- **Tier 2 — investigation (on-demand, full, isolated):** dial levels to
  debug/trace, switch on hypertrace (~zero overhead when off — built for exactly
  this), collect full traces and full data, reproduce in isolation. Goal:
  *diagnose + resolve*. Lives in the investigation, not in production.

**The probe/scenario model is the Tier-2 vehicle.** The committed, re-runnable
probes (`poc/.../probes/`, `journey/` run logs) are precisely "instrument it in
and investigate in isolation": a Tier-1 signal points at a subsystem; you
reproduce it as a probe with full instrumentation switched on. Observability and
the probe convention are the same discipline from two ends.

**Live, conditional escalation (stream-native).** Escalation needn't always mean
reproducing in isolation. Because spl treats everything as stream records /
requests through namespace dispatch, a **monitoring request can be interleaved
into a live production system**: send a request that conditionally raises
instrumentation for a *scoped* subset — a peer, a topic, a correlation id, an
operation type — for a bounded window, with the trace/data streaming back as just
another stream. Only the targeted subset pays the overhead, only while requested —
so it stays true to minimal-by-default. This is the in-between of Tier-1 and
Tier-2: **surgical, on-demand instrumentation on production, no redeploy.** It
falls out of the request/stream model; noted now to shape dispatch.

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

1. **Event schema + per-node logging — DECIDED: own a thin emitter.** Adopt
   **pino's schema** (level, time, structured fields, `msg`) and child/bound-context
   loggers, but **own a thin pino-schema-compatible emitter** rather than depend
   on pino-bare — it's a *foundational* concern, pino-bare is early/lightly-
   maintained, and we own runtime code (the roadmap invariant). Staying
   pino-format-compatible keeps pino's tooling (pretty-printers, transports,
   shippers) available, and we can swap to pino-bare/pino if it matures. This is
   the **Tier-1** carrier: at `info` it's the minimal production set; the level
   dial is the first Tier-2 escalation lever.
2. **Cross-peer correlation — OURS, at the fabric seams.** No off-the-shelf
   answer. Thread a correlation context (trace/op id + connection id + the peer
   keys we already have) through the protocol/RPC, emitted **once at the
   transport/dispatch seams**. Borrow the distributed-tracing model (trace id →
   span → parent span) *lightly* — swarm-appropriate, not full OpenTelemetry.
   *(open: exact id scheme + how it rides the protocol — settles at Phase 2.)*
3. **Within-process deep tracing — hypertrace, the Tier-2 instrument.** Switched
   on during investigation to trace *our* fabric classes (transport, dispatch,
   execute); ~zero overhead when off (built for exactly this graduated model);
   Prometheus export available. Off in production.
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

- **Graduated, two-tier** (above): production = minimal detect/localize; full
  diagnosis is escalated in isolated reproductions (probes). No heavy prod stack.
- **Own a thin pino-schema emitter** (Tier-1 carrier) — decided.
- **Levels:** `trace/debug/info/warn/error`; operational lifecycle events are
  `info`; default production threshold `info`, dialled up for investigation.
- **Format:** one JSON object per line, pino-compatible (`level`, `time`, plus our
  fields); stdout is the substrate (Phase 0.2 model). Daemon-layer (docker events)
  stays the authority for liveness/exit, merged by the capture tool.

## Open (settle as code teaches us)

- Correlation-id scheme + protocol propagation (settles when avsc-rpc crosses
  peers — **Phase 2**). Keep it cheap enough to stay Tier-1 (ids on events); the
  full span/trace tree is Tier-2.
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
