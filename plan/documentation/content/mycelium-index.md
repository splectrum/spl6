---
lastmod: 2026-06-03
title: "Mycelium"
description: "Mycelium is SPLectrum's data fabric: a hybrid between git and kafka, both native on the P2P substrate."
replaces: engineering/splectrum/mycelium/index.md
---

# Mycelium

Mycelium is SPLectrum's data fabric — the engineering foundation from which the
other fabrics build upward. It is **a hybrid between git and kafka**, both native
on the same P2P substrate.

Git provides the mutable data structure: versioned tree of data entities, branching,
merging, quality-gated state changes. Kafka provides the immutable data change event
streams: append-only ordered logs, subscribable, replayable, atomic. Both are
P2P-native — signed, replicated, sparse-accessible — on Hypercore/Hyperdrive.

Mycelium has one interaction mode: **data state propagation**. Data state changes and
becomes visible to other data owners through the fabric. Visibility is sharing — no
separate mechanism. Direct owner-to-owner communication is not a Mycelium concern; it
emerges at higher levels in the SPLectrum language fabric.

## The three fabrics

Mycelium is the substrate; the language and process fabrics embed into it as metadata.

- **Mycelium** (data) — where data state lives. The ground.
- **SPLectrum** (language) — what data state means. Protocols with meaning, operators,
  personas. Embedded as metadata in Mycelium.
- **HAICC** (process) — how data state changes and is acted on. Human-AI
  collaboration, process definitions, work division. Embedded as metadata in
  Mycelium.

## Vocabulary

Engineering vocabulary grounded in the seed (P0–P5).

- **Data entity** — object structure with data and associated functionality.
- **Data owner** — holder of a set of data entities. The subject in engineering terms.
- **Data state** — the owner's data reality, in a data repository.
- **Data world** — totality of data state across all owners. In a P2P swarm, the data
  world is enumerable — a full listing of all active data is achievable.
- **Data world subview** — the total view achievable from a repo. Partial relative to
  the data world.
- **Protocol** — engineering artefact of a language game. An API with meaning — the
  action vocabulary in its operators makes it a meaning unit.
- **Operator** — protocol method.
- **Data state propagation** — change becomes visible through the fabric. No separate
  mechanism.
- **Data repository / repo** — the git repository on Hypercore/Hyperdrive that
  constitutes a data owner's reality.
- **Topic** — a Hypercore log carrying immutable data change event records. The owning
  repo maintains the topic; other repos subscribe.
- **Topic reference** — a data owner's declared dependency on a remote topic.

## Two cadences

Data state propagation operates at two cadences — both the same concept at different
tempos.

**Git commit** — structural state change. Merges data structures. Durable, versioned,
auditable. Requires a supporting quality ecosystem: testing, review, validation, AI
agent involvement. The full git machinery applies.

**Data change events** — record-level state change. Atomic. Append a record, immutable,
done. No quality ecosystem needed. The working cadence.

## Pages

- [Fabric](fabric) — the data structure: git objects, Hypercore topics, identifier
  grammar, the elementary data unit
- [XPath](xpath) — addressing and navigation across both stores, visibility modes
