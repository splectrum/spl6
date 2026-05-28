---
summary: xpath — addressing and node I/O across the fabric.
---

xpath is the mycelium fabric's addressing space. Every node
lives at a key (a URI relative to a local root) and has
content plus metadata. Three visibility lenses govern what
you see and can touch:

- `raw` — full visibility, no filtering
- `data` — hides underscore-prefixed (metadata) segments
- `metadata` — only underscore-prefixed segments

Each lens has `get`, `put`, `remove` operations in two
variants: URI (schema-agnostic, bytes in/out) and schema-aware
(type resolution via schema registry or file extension,
with into-file JSON navigation).
