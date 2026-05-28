---
summary: Raw URI protocols — schema-agnostic bytes in/out.
---

URI variant of the raw family. No type inference — bytes pass
through exactly as provided. Use when you want raw access
without schema interpretation or into-file navigation.

For type-aware raw access (schema registry, file-extension
inference, JSON into-file navigation), use the siblings under
`spl.mycelium.xpath.raw` directly (`get`/`put`/`remove`).
