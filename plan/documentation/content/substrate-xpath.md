# XPath — substrate language of navigation

Our brand of XPath: read-only extraction across all substrate structures,
with a temporal dimension. Logical design only.

## The role

XPath navigates where within a resource's structure. The query/extraction
language for the fabric — one expression traverses git objects, Hypercore
log entries, and (when AVRO is active) decoded record internals as one
seamless surface.

## Active adoption

**The principles:**
- **Read-only.** XPath extracts, never mutates. Any operation that changes
  state is a protocol operation. XPath asks questions; protocols take
  action.
- **Seamless traversal.** The substrate boundaries (git, kafka, AVRO) are
  invisible to navigation. One uniform navigable surface.
- **Temporal dimension.** Git commits and kafka offsets are points on the
  same dimension — a position in an immutable history. XPath can extract
  data at any point.

**Kept from XPath:**
- Axis-based navigation (self + descendants for data, self + ancestors
  for functional resolution)
- Location paths (step expressions)
- Functions (own set, not the standard library wholesale)

**Our own way:**
- Native XPath engine (planned)
- Custom function set — includes git read operations (version selection,
  history, diff) and kafka read operations (offset, range, latest, tail).
  All read-only. Grows as pressure surfaces.
- The full function set unlocks when AVRO opens up internal structure and
  kafka record header metadata becomes navigable.

## Composition with URI

URI identifies which resource; XPath navigates where within it. A full
address layers them: URI to the resource, XPath into its structure.

## What lives where

| Concern | Where it is documented |
|---|---|
| XPath principles (read-only, seamless, temporal) | **Language substrate** (this page) |
| Two navigation modes (data forward, functional backward) | **Mycelium** (Platform) |
| The concrete structure XPath navigates | **Mycelium** (Platform) |
| The XPath function set (as designed) | **Mycelium** (Platform) |
| The native XPath engine | **Infrastructure** module |
