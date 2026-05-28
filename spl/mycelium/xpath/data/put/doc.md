---
summary: Write content to a node at the fabric address, data lens, schema-aware.
---

Schema-aware write with the data lens: writing to an
underscore-prefixed (metadata) path returns an error. Respects
registered schemas and into-file navigation.

For metadata writes use `spl.mycelium.xpath.metadata.put`;
for schema-agnostic data writes use `spl.mycelium.xpath.data.uri.put`.
