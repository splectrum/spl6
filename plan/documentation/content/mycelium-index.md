# Mycelium

Mycelium is SPLectrum's data fabric — the engineering foundation from which
the data repositories are built. It weaves the five substrate languages into one
P2P native fabric.

## Git — mutable structure

Git provides the mutable side of the fabric. The data repository — a git
repo on the P2P substrate — is the elementary unit: identity, boundary,
history. Data entities live as git objects (trees and blobs), versioned
through commits, reconciled through merge. The merge layer is pluggable —
text, record, log, schema-aware, AI-assisted — selected per data shape.
Commit is the quality-gated state change: testing, review, AI agents
participate natively through git's ecosystem.

## Kafka — immutable data change events

Kafka provides the immutable side. Data change events are Kafka records
(key + value + headers) on append-only ordered logs (topics). A record is
atomic and self-contained. The headers are an extensible metadata surface —
provenance, lineage, visibility travel with every record. Topics are
single-writer, owned and maintained by the data repository that produces
them. Other repos subscribe via topic references.

## AVRO — encoding

AVRO gives structure to the data. Schema-defined binary encoding from base
level up — the shared language for records on topics, schemas in git, type
resolution across the fabric. Schemas co-locate in the data repository as
versioned metadata. Active in Round 2; Round 1 operates with opaque bytes.

## URI — addressing

URI identifies what and where in the fabric. Operations — get, put, remove
— work across three visibility modes: data (hides metadata), metadata
(only metadata), raw (everything). The underscore prefix opens the metadata
dimension at any node. All addressing is local, forward-only from the
current context root. No protocol prefixes, no trailing slash. Path rebases
on context switch.

## XPath — navigation

XPath navigates the fabric's structure — read-only extraction, never
mutation. It traverses git objects, Hypercore log entries, and (when AVRO
is active) decoded record internals as one seamless surface. Two navigation
modes: data forward (self and descendants from local root) and functional
backward (self and ancestors to repo root). A native engine with its own
function set, including git and kafka read operations.

## Pages

- [Fabric](fabric) — how URI, git and kafka topics knit together
- [XPath](xpath) — navigation characteristics
- [Vocabulary](vocabulary) — the engineering terms
