---
summary: Write content to a node at a metadata address, schema-aware.
---

Schema-aware write with the metadata lens: only
underscore-prefixed segments (or paths inside a metadata
subtree) are writable. Attempts to write to non-metadata
paths return an error.

For data writes use `spl.mycelium.xpath.data.put`;
for schema-agnostic metadata writes use `spl.mycelium.xpath.metadata.uri.put`.
