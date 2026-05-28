---
summary: Show working-tree status, two-reality aware.
---

Returns branch name, current reality (repo vs subtree),
the list of changed files with their status codes, and a
clean flag. Two-reality aware: invoked from inside a
registered subtree, scopes to that subtree's view.

Response schema: `spl.data.mycelium.git.status`.
