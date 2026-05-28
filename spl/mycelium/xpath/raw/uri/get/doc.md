---
summary: Read bytes from a node at the fabric address.
---

Reads the node at `key` as-is — no type resolution, no
into-file navigation. The response is a node record with
content as raw bytes. Raw visibility — sees underscore-prefixed
segments.

For schema-aware reads (type resolution, into-file JSON
navigation), use `spl.mycelium.xpath.raw.get`.
