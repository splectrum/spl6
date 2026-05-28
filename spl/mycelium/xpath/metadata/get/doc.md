---
summary: Read a node at a metadata address, schema-aware.
---

Schema-aware read with the metadata lens: only
underscore-prefixed segments (or paths inside a metadata
subtree) are visible. Type resolution and into-file JSON
navigation.

For data reads use `spl.mycelium.xpath.data.get`;
for unfiltered reads use `spl.mycelium.xpath.raw.get`.
