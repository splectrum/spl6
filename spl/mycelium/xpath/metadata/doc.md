---
summary: Metadata xpath — only underscore-prefixed segments.
---

Metadata visibility is the inverse of data: only paths that
contain an underscore-prefixed segment are visible. Non-metadata
paths are invisible; within a metadata subtree, all entries
(including non-underscore names) are visible because you're
already inside metadata space.

For application content, use `spl.mycelium.xpath.data`.
For unfiltered access, use `spl.mycelium.xpath.raw`.

Operations come in two variants: schema-aware and URI
(schema-agnostic).
