---
summary: Read a node at the fabric address, schema-aware.
---

Reads the node at `key` with type resolution: registered
schema name wins over file extension, which wins over
"binary" fallback. For JSON-shaped content the addressing
extends into the file (xpath-style navigation into object/array
structure). Raw visibility — sees underscore-prefixed segments.

For schema-agnostic reads, use `spl.mycelium.xpath.raw.uri.get`.
