---
summary: Write bytes to a node at the given fabric address.
---

Writes the given content to the node at the URI. Creates
parent directories as needed. Raw visibility — writes
regardless of underscore-prefix (metadata) segments.

URI variant: schema-agnostic, bytes in / bytes out. No type
inference. Use `spl.mycelium.xpath.raw.put` for the
schema-aware variant (type resolution via schema registry
or file extension, with into-file navigation for JSON).
