---
summary: Write content to a node at the fabric address, schema-aware.
---

Writes `args[0]` as the content of the node at `key`.
Schema-aware variant: respects registered schemas and
into-file navigation when writing. Raw visibility — writes
regardless of underscore-prefix segments.

For schema-agnostic writes (pure bytes in), use
`spl.mycelium.xpath.raw.uri.put`.
