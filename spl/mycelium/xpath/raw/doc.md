---
summary: Raw xpath — full fabric visibility, no filtering.
---

Raw visibility sees every node on the fabric, including
underscore-prefixed (metadata) segments. Use raw when you
need to touch metadata files or want unfiltered reads.

Contrast with:
- `spl.mycelium.xpath.data` — hides underscore-prefixed nodes
- `spl.mycelium.xpath.metadata` — inverse; only underscore-prefixed nodes

Each family has `get`, `put`, `remove` handlers, in both
a URI variant (schema-agnostic, bytes in / bytes out) and
a schema-aware variant (type resolution via schema registry
or file extension, into-file navigation via xpath addressing).
