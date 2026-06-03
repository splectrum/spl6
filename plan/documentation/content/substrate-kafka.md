# Kafka — substrate language of mobility

Our brand of kafka: the record primitive and the immutable log. Logical
design only — Mycelium integration and infrastructure implementation are
documented separately.

## The role

Kafka gives the architecture its sense of mobility — the envelope for data
leaving the tree to travel. Data at rest has context from position and
ancestry. Data in motion carries that context explicitly, in a self-contained
record.

## Active adoption

Two primitives:

**The record** — key + value + headers. A self-contained datum with
identity (key), payload (value), and extensible context (headers). Our
version of the Kafka record: the pure Kafka shape, with our own header
semantics layered at the Mycelium level.

**The immutable log** — a single-partition topic. Append-only, ordered.
The log is the source of truth. Offset = position in the log. Everything
derived from the log is expendable and rebuildable.

That is the active scope. It will grow over time as pressure surfaces —
consumer infrastructure, retention, compaction, and other Kafka concepts
may be adopted when needed.

## The decentralisation commitment

Kafka as a logical application will be **fully decentralised**. No central
broker, ever. The record and the log are realised as P2P data structures
(single-writer, signed, replicated directly between peers). Whatever is
adopted in the future — consumer infrastructure, retention, advanced
routing — follows this commitment. There is no path back to centralised
coordination.

## What lives where

| Concern | Where it is documented |
|---|---|
| The record primitive and the immutable log | **Language substrate** (this page) |
| How kafka blends with git in the fabric | **Mycelium** (Platform) |
| Header semantics (provenance, lineage, visibility) | **Mycelium** (Platform) |
| Topics as data change event streams | **Mycelium** (Platform) |
| Topic references (subscription as referencing) | **Mycelium** (Platform) |
| Git blobs wrapped in Kafka records for log storage | **Mycelium** (Platform) |
| Hypercore as the log implementation | **Infrastructure** module |
| Consumer infrastructure (when needed) | **Infrastructure** module (deferred) |
| Retention / compaction (when needed) | **Infrastructure** module (deferred) |
