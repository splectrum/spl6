---
summary: Create a commit from staged changes.
---

Creates a git commit on the execution-root repo with the
given message. No file selection — stage with
`spl.mycelium.git.add` first.

Two-reality aware: invoked inside a subtree, commits to
the subtree's reality. From the outer repo root, commits
to the outer repo. See `.gittrees` for registered subtrees.
