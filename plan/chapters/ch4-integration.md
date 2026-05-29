# Chapter 4 — spl6 integrations

**Status: ⬜ not started.**

Each integration builds on the POCs and the previous integration.
Independently testable.

> Decide before starting: the two post-POC open questions
> (`../open-questions/client-server-resolution.md`,
> `../open-questions/code-analysis-before-p2p.md`).

### 4.1 Single peer on DHT

spl6 peer reachable by key over Hyperswarm. Dispatch still local —
all handlers on one peer. Validates the transport works end-to-end
through the real spl stack (CLI → swarm → AVRO RPC → dispatch →
handler → response).

Keep TCP alongside for local development. This is where
`bin/spl-server` becomes `bin/spl-peer` and the new dependencies
(`hyperswarm`, `hyperdht`) are introduced into spl. `lib/rpc-server`
is dropped once swarm lifecycle fully replaces the TCP lifecycle and
TCP is no longer needed for local dev.

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

> Integration target for `doc-dispatch` (`../tools/doc-dispatch.md`):
> once distributed dispatch exists, the cross-repo authoring tool
> becomes a real spl handler.

### 4.4 Multi-peer

Two spl6 peers, each serving different parts of the namespace. One
client reaching both transparently. Proves the fabric works as a
distributed system, not just a single node on a new transport.

### 4.5 pear-runtime integration

Embed pear-runtime into the spl6 peer for P2P self-updating
distribution. Publish spl6 to a Hyperdrive. A second peer picks up
updates automatically.
