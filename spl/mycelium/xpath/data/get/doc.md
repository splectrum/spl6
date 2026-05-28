---
summary: Read a node at the fabric address, data lens, schema-aware.
---

Schema-aware read with the data lens: underscore-prefixed
(metadata) segments are invisible. Type resolution and
into-file JSON navigation as in the raw variant.

For unfiltered reads use `spl.mycelium.xpath.raw.get`;
for schema-agnostic data reads use `spl.mycelium.xpath.data.uri.get`.
