# spl6 — Overview

## Context

spl5 proved the mycelium fabric architecture end-to-end: stream
records, namespace-as-filesystem dispatch, pack-at-boundary, handler
contracts, input schemas, the help system — 73 tests passing on
local TCP RPC. spl5 is now archived.

spl6 takes those proven concepts onto P2P infrastructure. Pear has
evolved from a CLI runtime to an embeddable library (`pear-runtime`)
that gives any Bare application P2P updates, worker execution, and
Hyperdrive distribution.

The Splectrum vision has always been P2P: "create the tools to enable
P2P networks where distributed applications run in their own
peer-to-peer environment." spl5 proved the data model and dispatch on
localhost. spl6 runs that model on the network it was designed for.

## The landscape

### What spl5 proved (carries forward)

- **Stream record** as universal message shape (key + value + headers)
- **Namespace-as-filesystem** handler dispatch (no registration)
- **Pack at boundary** — plain objects in memory, AVRO at crossings
- **Handler contract** — handler(record) -> record, thin wrappers on lib/
- **Per-handler input schemas** (input.avsc with position conventions)
- **Two-reality model** for subtree-aware operations
- **Help system** composing doc.md + schema docs + ancestor context
- **CLI global flags** framework

These are fabric concepts. They're transport-independent.

### What spl6 replaces

- **TCP RPC on localhost** — the transport, not the protocol. AVRO RPC
  itself stays; it speaks over duplex streams. Hyperswarm connections
  are duplex streams.
- **lib/rpc-server lifecycle** (PID files, TCP listener management) —
  replaced by swarm join/leave. Graceful shutdown survives.
- **Git subtrees as distribution** — shared modules replicate via the
  swarm. Git stays for source control; distribution becomes a fabric
  concern.
- **Single-machine assumption** — dispatch resolves to "find a peer
  serving this topic" instead of a local filesystem require().

### What P2P enables

- **pear-runtime as library** — embed P2P updates without changing the
  application.
- **Hyperswarm transport** — AVRO RPC over encrypted P2P streams.
- **Hyperdrive for data** — namespace nodes addressable via Hyperdrive.
- **Location transparency** — a handler is a key on the swarm. Callers
  don't know or care where it runs.
- **Private swarm under splectrum.world** — own DHT bootstrap nodes,
  ~$15/month for 3 nodes.

## The unified approach

**spl5's proven fabric concepts + Pear's P2P library = the
architecture Splectrum's vision describes.** Not a rewrite — a
transport swap underneath proven patterns.

Stream records travel over Hyperswarm instead of TCP. Dispatch resolves
via swarm topic instead of filesystem path. Handlers run on whichever
peer serves that topic. Protocol, data model, handler contract, schema
system — all unchanged.
