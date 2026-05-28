---
summary: The spl namespace — Splectrum's language fabric.
---

The `spl` namespace is the root of Splectrum's code tree.
Each directory below this is a namespace node; the directory
path IS the namespace path. Handlers live at `index.js`;
schemas colocate as `schema.avsc`; human-facing docs as
`doc.md`.

Top-level children:
- `avsc-rpc` — AVRO RPC layer (server, CLI, protocol)
- `mycelium` — the data fabric (xpath, process, git)
