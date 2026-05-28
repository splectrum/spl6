---
summary: Subtree management — .gittrees-driven two-reality support.
---

spl5 uses git subtrees to embed upstream modules (lib/avsc,
lib/git, lib/rpc-server, etc.) while keeping their history
separable. `.gittrees` records the registered prefixes,
remotes, and branches.

Handlers:
- `list` — show registered subtrees
- `register` — add a subtree to .gittrees without fetching
- `add` — register + initial subtree add (fetch history)
- `pull` — pull upstream into a subtree
- `push` — push subtree changes back upstream

Subtree reality: running from inside a registered prefix
scopes git operations (status, log, diff) to that subtree's
history rather than the outer repo's.
