---
summary: AVRO RPC layer — protocol, server, CLI, display.
---

Wraps AVRO RPC into the pieces spl5 needs: a protocol
definition (service schema), a server integration built on
lib/rpc-server, a CLI entry point, and a display helper for
rendering records.

Children:
- `cli` — command-line entry point (`bin/spl`)
- `server` — server integration (`bin/spl-server`)
- `protocol` — AVRO service schema (file, not a node)
- `display` — human-readable record renderer (file, not a node)
