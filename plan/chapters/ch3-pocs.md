# Chapter 3 — P2P transport POCs

**Status: ⬜ not started.**

Standalone proof-of-concept scripts, outside spl. Prove the pieces
work in isolation before integrating.

> Test/deployment harness basis: `../p2p-test-deployment-findings.md`
> (local private DHT + structured-stdout peers; the translation-layer /
> hole-punch principle; contained-vs-distributed modes; home automation as
> a worked case). These POCs build on that pattern, seeded into
> `pear-full-square`.

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

> Use-case candidate: `doc-dispatch` (`../tools/doc-dispatch.md`) is a
> concrete, swarm-independent target for proving `target → peer →
> execute-in-its-reality` here.

### 3.3 Multi-peer topology

Two peers, each serving different namespace paths. One client
resolving requests to the correct peer based on the topic. Proves
the routing layer works across peers.

### 3.4 pear-runtime P2P updates

Standalone: a Bare app with pear-runtime embedded. Publish to a
Hyperdrive, run a second instance, verify it picks up an update.
Proves the self-updating mechanism before integrating into spl.
