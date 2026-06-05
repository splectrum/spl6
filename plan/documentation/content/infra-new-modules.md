---
lastmod: 2026-06-05
title: "New Infrastructure Modules"
description: "Four new modules across bare-for-pear and pear-full-square: git on P2P, stripped git engine, FUSE mount, and the Mycelium base layer."
updates: |
  engineering/infrastructure/bare-for-pear/index.md (add two entries)
  engineering/infrastructure/pear-full-square/index.md (add two entries)
  New pages: bare-for-pear/isomorphic-git, bare-for-pear/p2p-git,
  pear-full-square/hyperdrive-fuse, pear-full-square/mycelium
---

# New Infrastructure Modules

Four modules built during the Mycelium Chapter 4 work. Two in bare-for-pear
(infrastructure), two in pear-full-square (P2P application code).

---

## bare-for-pear/isomorphic-git — Dual-Backend Git

Full [isomorphic-git](https://github.com/isomorphic-git/isomorphic-git) with
a Hyperdrive fs adapter. Standard git on two backends: bare-fs (OS filesystem)
and Hyperdrive (P2P storage). The upstream code is unmodified — the fork adds
the adapter and Bare runtime documentation.

The adapter maps 10 fs methods to Hyperdrive v11 (get, put, del, entry,
readdir, symlink). Implicit directories handled via an implicitDir Stats flag.
One configuration requirement for Bare: use the ESM build (CJS hard-requires
Node's crypto).

**Proven.** Porcelain and plumbing produce identical hashes on both backends.
Full round-trip (bare-fs → Hyperdrive → bare-fs, 14 objects) returns identical
content. Not yet exercised: merge, large repos, concurrent access.

**Source:** [bare-for-pear/isomorphic-git](https://github.com/bare-for-pear/isomorphic-git)

---

## bare-for-pear/p2p-git — Minimal Git Engine for Embedding

isomorphic-git stripped to a minimal footprint for embedding in P2P
applications. 42 exports from the original 70. 8,336 lines removed.

No porcelain, no network, no packfiles, no working tree. Object operations
(read/write blob, tree, commit, tag), refs, merge (3-way text), log, walk,
and the git index for transaction staging. The write cycle: writeBlob →
updateIndex → commit. Changes are tracked in the index from the moment
they're staged — the index persists, survives crashes. Commit is the
quality gate.

Loose objects only — each object individually addressable on any pluggable
fs backend. The embedder provides storage; p2p-git provides git operations.

**Proven.** 42 plumbing operations tested under Bare. Not yet exercised:
merge, the updateIndex → commit flow end-to-end, large repos.

**Source:** [bare-for-pear/p2p-git](https://github.com/bare-for-pear/p2p-git)

---

## pear-full-square/hyperdrive-fuse — Read-Only FUSE Mount

FUSE mount for Hyperdrive v11. Mount a P2P drive as a local filesystem.
The MVP is read-only — all writes return EROFS. The drive is a window into
the swarm, not a writable surface. Writes go through the fabric.

Maps OS filesystem calls (ls, cat, find) to Hyperdrive operations via
fuse-native. Runs under Node.js (fuse-native requires Node builtins — the
FUSE mount is the OS bridge by nature). Works on WSL2 (FUSE built into the
kernel). Mounted drives accessible from Windows via `\\wsl$\`.

FUSE handlers: readdir, getattr, open (read-only), read, release. Write
operations (write, create, unlink, mkdir, rmdir, rename) return EROFS.

**Proven.** Readdir, read, stat, write rejection, clean mount/unmount — all
tested in Docker. Key finding: FUSE handlers must be async-compatible
(synchronous fs calls deadlock the event loop). Not yet exercised: large
directories, concurrent reads, performance under load.

**Source:** [pear-full-square/hyperdrive-fuse](https://github.com/pear-full-square/hyperdrive-fuse)

---

## pear-full-square/mycelium — The Data Fabric Base Layer

The Mycelium data fabric as a module. CRUD and XPath navigation over git
objects. Key/value with opaque bytes (Round 1).

Two interfaces. **Internal:** plain functions — select, read, get, put,
remove, commitTree, log. Direct calls, throw on fatal error. No Kafka
records, no hidden conditional routes. **External:** a single Kafka record
dispatch mapper at the boundary — unpacks a record, calls the right
function, packs the result back with status in headers.

XPath select always returns an array. Three visibility modes: raw
(everything), data (hides underscore-prefixed), metadata (only
underscore-prefixed). The underscore convention separates data from
metadata at every node.

Happy path only. Type conflicts (file where folder expected) are fatal
errors. No silent conditional processing.

**Proven.** Put, get, select (three modes), multi-commit history, dispatch
boundary mapping — all tested under Bare on bare-fs. Not yet exercised:
Hyperdrive backend, large trees, concurrent operations.

**Source:** [pear-full-square/mycelium](https://github.com/pear-full-square/mycelium)
