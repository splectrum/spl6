---
summary: Write bytes to a node, data lens.
---

Writes `args[0]` as the content of the node at `key`.
Data lens — writing to a metadata path returns an error.
No type inference.

For metadata writes use `spl.mycelium.xpath.metadata.uri.put`;
for schema-aware data writes use `spl.mycelium.xpath.data.put`.
