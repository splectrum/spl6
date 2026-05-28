---
summary: Git operations exposed as fabric protocols.
---

Wraps lib/git behind thin handler-per-operation modules.
Every git operation is a stream type — invoked, dispatched,
returned like any other fabric call. Two-reality awareness
throughout: the execution root may be the outer repo or a
registered subtree, determined by where the call is made.

Children:
- `status`, `log`, `diff` — read-only inspection
- `add`, `commit` — staging and commit creation
- `push`, `pull` — remote sync (subtree-aware)
- `subtree` — subtree management (list/register/pull/push/add)

See `.gittrees` for registered subtrees and `lib/git` for
the underlying module.
