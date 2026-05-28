---
summary: Register a subtree in .gittrees (no fetch).
---

Adds an entry to `.gittrees` without fetching. Use when the
subtree files already exist in-tree and you just want to
record the prefix→remote→branch mapping.

For fetch + register in one step, use
`spl.mycelium.git.subtree.add`.
