---
layout: default
lastmod: 2026-05-03
title: "Kafka"
---

[Home](/) > [Engineering](/engineering/) > [Substrate](/engineering/substrate/) > Kafka

# Kafka

Kafka is constitutive to mycelium alongside AVRO and git. AVRO is the language of structure. Git is the language of historicity. Kafka is the language of mobility. Each has its own grammar that mycelium conforms to rather than invents; mycelium speaks all three.

## The Kafka record as data in context

A Kafka record is a data bucket in context. Its components:

- **Value** — the data payload. Opaque to the envelope. Could be four bytes or an entire subject reality.
- **Key** — unique identity. What makes this datum addressable outside the tree.
- **Headers** — contextual metadata. Dimensional space for carrying whatever history and interpretive context the extraction requires. Headers are self-describing — headers about headers — so the envelope can describe itself.
- **Offset** — order of arrival. Always meaningful; every arrival has an order. Whether order matters for the content is a different concern from the fact that arrival order is a fact.
- **Timestamp** — historicity. The moment of extraction is itself a datum.

Identity, context carriage, arrival order, historicity, self-description — the structural requirements for data leaving the tree and travelling self-sufficiently.

## Data at rest, data in motion

Data in the tree is data at rest. It speaks tree language — position, hierarchy, context through ancestry. No motion envelope.

Data extracted into a Kafka record is data in motion. The tree provided context through ancestry; once extracted, context travels explicitly in headers.

The mutable protocol sits at the boundary. Kafka records arrive — data in motion, enveloped, carrying context. The mutable protocol unpacks them, applies the change, maintains the living surface in the tree. The point where motion becomes rest.

Extraction imposes no fidelity requirement on context carriage. Headers can carry full provenance, partial, or none. With origin coordinates, data can travel a long transformation chain and find its way home. Without, it can't. Both possible; no imposition.

## Logical types and the Kafka record

A logical type annotates a physical type with context. A Kafka record wraps a data payload with context. The same structural gesture at different scales.

The Kafka record's logical type declares the nature of the transformation that produced the value. Input arguments in the headers provide the dimensional context. The value carries the output. Every record is a process trace — carrying the story of its own making.

The zero case: `noop`. Data with no transformation story. The logical type exists but says "nothing happened here." Raw data is explicitly marked as untransformed rather than ambiguously silent about its provenance.

**The logical type spectrum.**

- **Interpretation** — `splectrum.natural.heidegger` — pure reading context. The payload is what it is; the logical type names which language to read it in. Retrospective.
- **Transformation** — `date`, `decimal` — encoding context. The payload is a physical type; the logical type names the mapping between raw form and meaningful form.
- **Intent** — action types. The payload is something to be acted upon; the logical type names what should happen; headers carry the arguments. Prospective.

The envelope is indifferent to whether its content is contemplative or imperative. The distinction between event and command is a concern within particular language games, not a structural constraint.

Examples: `decimal` — value is bytes, headers carry precision and scale. `date` — value is an int, logical type names the "days since epoch" interpretation. SPLectrum meaning languages — value is text, logical type names the producing language, headers carry concept vocabulary. Action types — value is the operation payload, headers carry arguments.

A bare physical type without any logical type would not be in the fabric — being in the fabric already means being in context.

## Three extraction languages

Data can be extracted from the tree into any of the three committed languages.

- **AVRO** — extraction as shaped response. A get query returns an AVRO container. Data described by its schema. No offset, no partition — not entering a stream.
- **Git** — extraction as historical snapshot. A commit captures data as it was at a moment. Extraction into the language of versioning.
- **Kafka** — extraction as streaming datum. Data in motion with its context. The full envelope.

Each extraction language provides its own envelope. The logical type does different work in each — appropriate to that language.

## Fractal indifference

A subject reality as a whole can be the value payload of a Kafka record. Key identifies it. Headers carry whatever context matters — origin, purpose, state. Offset marks its arrival. And the subject reality contains Kafka records in its own queues.

The record is indifferent to scale. It doesn't know if its value is four bytes or an entire world. The grammar doesn't change at different magnitudes.

Subject reality replication, migration, and cloning get a natural expression — a subject reality travelling between nodes is a Kafka record. No special protocol needed; the streaming language already handles it. Records contain realities that contain records.

## Atomicity

A Kafka record is atomic. An extracted piece of data. It does not natively maintain relationships to other records — no structural cross-referencing. Linking between records is a metadata responsibility, not a structural one. The relational structure lives in the tree; the extraction lives in the stream. If linkage is needed, it's carried in headers by deliberate choice. Architecture of absence.

## Topic and partition

Kafka's topic and partition structure is Kafka's own organisational scheme — how it manages its physical storage. Separate concerns from mycelium's fabric tree; they might align, they might not. Mycelium's tree is not mapped onto Kafka's topic/partition model.

## Open questions

- **Header self-description.** The format and conventions for self-describing headers — a record that carries context but can't tell you how to read it is incomplete.
- **Logical type namespace structure.** The hierarchy for logical types (`splectrum.natural.heidegger` as a path) needs formal definition — registration, composition, relation to concept vocabularies.
- **Data change record format.** The mutable protocol applies data change records from Kafka queues, but the format is not yet defined. This intersects with record structure — the data change record is a Kafka record with specific conventions for expressing mutations.
