---
summary: Process — execution envelope, dispatch, help.
---

The process namespace holds the machinery that *runs* handlers
rather than handlers that do domain work. Three nodes:

- `dispatch` — namespace-path handler resolution. Reads the
  stream descriptor, requires the module at that path, calls it.
- `execute` — execution envelope. Peels the inner record,
  propagates execution context, dispatches, packs the result
  for the boundary.
- `help` — describes any namespace node by walking doc.md
  files and schema doc fields.
