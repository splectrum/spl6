---
summary: Add a subtree — fetch history and register.
---

Fetches the upstream remote and imports its history into
the local repo as a subtree, then records the entry in
`.gittrees`. The url is optional — if omitted, the
platform's default format resolves it (GitHub by default).

For register-only (no fetch), use
`spl.mycelium.git.subtree.register`.
