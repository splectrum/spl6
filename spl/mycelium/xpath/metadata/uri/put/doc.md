---
summary: Write bytes to a node at a metadata address.
---

Writes `args[0]` as the content of the node at `key`.
Metadata lens — writing to non-metadata paths returns an
error.

For schema-aware metadata writes use `spl.mycelium.xpath.metadata.put`.
