# spl6 Plan

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

---

## Chapter 1 — Initialisation

### 1.1 Carry forward proven code from spl5

Source: `/home/herma/splectrum/spl5` (archived)

Copy transport-independent code:
- `spl/mycelium/` — all handlers, doc.md, input.avsc
- `spl/avsc-rpc/protocol.js` — the AVRO protocol definition
- `spl/avsc-rpc/display.js` — human-readable rendering
- `_schema/` — all AVRO schemas, alias-mapping.txt
- `_client/` — default client identity

### 1.2 Re-register lib/ subtrees

Subtrees that are still relevant:
- `lib/avsc` — AVRO types
- `lib/avsc-rpc` — AVRO RPC (transport-agnostic)
- `lib/git` — git operations
- `_test` — test framework (will evolve)

Drop `lib/rpc-server` — TCP lifecycle replaced by swarm lifecycle.

### 1.3 New transport layer

Replace `spl/avsc-rpc/server/` and `spl/avsc-rpc/cli/` with versions
supporting both TCP (local dev) and Hyperswarm (P2P). Protocol
definition and dispatch unchanged.

New dependencies:
- `hyperswarm` — peer discovery and encrypted connections
- `hyperdht` — DHT for the swarm
- `pear-runtime` — P2P updates (added incrementally, not day one)

### 1.4 Entry points

- `bin/spl` — CLI, swarm-based connection
- `bin/spl-peer` — peer on the swarm (replaces spl-server)
- `bin/spl-test` — updated for new transport
- `bin/setup` — updated for new dependencies

### 1.5 Project docs

- CLAUDE.md reflecting spl6 mission and structure
- .claude/rules/ (project-state, conventions)
- initialise/ folder as historical context

### 1.6 Verify

Existing tests pass on TCP transport (nothing broken from the carry-
forward). Ready for POC work.

---

## Chapter 2 — Documentation

Documentation prompts written here, executed by the
the-world-of-splectrum repo through its editorial process.

### 2.1 Pear page rewrite

Current pear.md describes the old `pear run` model (deprecated June
2026). Full rewrite for the library approach:
- pear-runtime as embeddable library
- Constructor, API (ready/close/run/updater)
- P2P updates via Hyperdrive
- Worker execution
- Migration from `pear run` (lower priority, separate page)
- Links: github.com/holepunchto/pear-runtime, docs.pears.com

### 2.2 Hyperswarm / HyperDHT page (new)

Peer discovery and networking. Doesn't exist on the site yet.
- Topic-based peer discovery
- DHT architecture (public mainnet, private, hybrid)
- Bootstrap nodes — default public, custom for private swarms
- Noise protocol end-to-end encryption
- UDP hole-punching
- splectrum.world private swarm setup

### 2.3 Hypercore / Hyperdrive page (new)

Distributed storage primitives. Doesn't exist on the site yet.
- Hypercore: append-only log, public key identity, replication
- Hyperdrive: filesystem on Hypercores
- Hyperbee: B-tree on Hypercore
- Corestore: multi-core management
- Crypto model: discovery keys vs public keys vs encryption keys
- Traffic analysis surface

### 2.4 P2P security model page (new)

Doesn't exist on the site. Full security picture:
- Cryptographic access control (Ed25519, Noise)
- DHT visibility — public vs private swarms
- Metadata leakage (connection patterns, block sizes, timing)
- Private swarm as mitigation
- VPN/overlay as additional layer
- Key management responsibilities
- HiveRelay blind storage model

### 2.5 Bare pages — version refresh

Existing pages are structurally accurate. Needs:
- Module catalog version bump (verified April → verify current)
- Fix stale links (docs.pear.sh → docs.pears.com, broken .html paths)
- Add `--inspect-port` flag (missing from CLI table)
- Check for any new modules added upstream since April

### 2.6 spl5 retrospective / spl6 direction page (new)

What spl5 proved, what carries forward, what P2P transport changes.
For the engineering section of the site:
- Fabric concepts proven (stream record, dispatch, boundary packing)
- Transport shift (TCP → Hyperswarm)
- Location transparency (namespace path → swarm topic)
- Connection to the Splectrum vision

### 2.7 bare-for-pear module pages — complete gaps

The April submission (git, rpc-server, testing pages) was written in
spl5 but never landed on the site. Assess what's still accurate,
update for spl6 context, resubmit.

---

## Chapter 3 — P2P transport POCs

Standalone proof-of-concept scripts, outside spl. Prove the pieces
work in isolation before integrating.

### 3.1 AVRO RPC over Hyperswarm

Minimal: two Bare scripts. One creates a `dht.createServer()`, wires
an AVRO RPC service on the connection. The other connects by key,
sends a stream record, gets one back. Proves the AVRO protocol
travels over a Hyperswarm encrypted stream unchanged.

### 3.2 Namespace-to-topic mapping

The design work. A peer announces topics derived from namespace paths.
A client resolves a namespace path to a swarm topic, discovers the
peer serving it, connects. This is the distributed dispatch layer —
new infrastructure that doesn't exist in the ecosystem yet.

Questions to answer in the POC:
- How are namespace paths mapped to 32-byte topic hashes?
- How does a peer announce which handlers it serves?
- How does a client discover which peer serves a given handler?
- What happens when multiple peers serve the same handler?
- What's the fallback when no peer is found?

### 3.3 Multi-peer topology

Two peers, each serving different namespace paths. One client
resolving requests to the correct peer based on the topic. Proves
the routing layer works across peers.

### 3.4 pear-runtime P2P updates

Standalone: a Bare app with pear-runtime embedded. Publish to a
Hyperdrive, run a second instance, verify it picks up an update.
Proves the self-updating mechanism before integrating into spl.

---

## Chapter 4 — spl6 integrations

Each integration builds on the POCs and the previous integration.
Independently testable.

### 4.1 Single peer on DHT

spl6 peer reachable by key over Hyperswarm. Dispatch still local —
all handlers on one peer. Validates the transport works end-to-end
through the real spl stack (CLI → swarm → AVRO RPC → dispatch →
handler → response).

Keep TCP alongside for local development.

### 4.2 Namespace topic registration

Peer announces which handlers it serves as swarm topics. The
discovery layer (from POC 3.2) integrated into spl6. Peer startup
walks the handler tree and announces topics.

### 4.3 Distributed dispatch

Client resolves namespace path to peer via swarm topic lookup.
Routes the stream record to the correct peer. Local require as
fallback if no remote peer found.

This replaces the filesystem-only dispatch in
`spl/mycelium/process/dispatch/`. The handler contract (record in,
record out) is unchanged — only resolution changes.

### 4.4 Multi-peer

Two spl6 peers, each serving different parts of the namespace. One
client reaching both transparently. Proves the fabric works as a
distributed system, not just a single node on a new transport.

### 4.5 pear-runtime integration

Embed pear-runtime into the spl6 peer for P2P self-updating
distribution. Publish spl6 to a Hyperdrive. A second peer picks up
updates automatically.

---

## Chapter 5 — Infrastructure

### 5.1 splectrum.world private swarm

2-3 VPS nodes (Hetzner/DigitalOcean, ~$5/month each), HyperDHT
bootstrap, DNS records (node1/2/3.splectrum.world). Own swarm, own
namespace.

### 5.2 HiveRelay evaluation

Assess HiveRelay for always-on availability. Blind relay, cryptographic
custody, cross-NAT access. Not a build item — an evaluation with a
recommendation.

### 5.3 Git remote on Hyperdrive (exploration)

Can a bare git repo live on a Hyperdrive, accessible to any peer on
the swarm? Replaces GitHub as coordination point. Exploratory — may
be premature.

---

## Open questions

- **Chapter ordering**: 1 then 2 can interleave — documentation prompts
  can be written while initialisation is in progress. Chapter 3 POCs
  can start as soon as spl6 has its base. Chapter 4 integrations need
  the POCs.
- **Test strategy**: does the harness become a swarm peer, or does it
  test via TCP locally with a separate integration suite for P2P?
- **bare-for-pear contribution**: does the namespace-to-topic discovery
  layer become a new bare-for-pear module, or does it live in spl6
  until it's proven enough to extract?
