---
lastmod: 2026-06-05
title: "p2p-git — Minimal Git Engine for Embedding"
description: "isomorphic-git stripped to a minimal footprint for embedding in P2P applications. Transaction model via the git index."
location: engineering/infrastructure/bare-for-pear/p2p-git/index.md
---

# p2p-git — Minimal Git Engine for Embedding

isomorphic-git stripped to a minimal footprint for embedding. Object
operations, refs, index, merge, log, walk. No porcelain, no network,
no packfiles, no working tree.

**Source:** [bare-for-pear/p2p-git](https://github.com/bare-for-pear/p2p-git)

---

## What It Does

Git object-level operations as a stripped, embeddable engine. 42 exports
from the original 70. 8,336 lines removed, 78 files deleted.

Designed for P2P applications where the object store lives on any
pluggable fs backend (bare-fs, Hyperdrive, or other). The embedder
provides storage; p2p-git provides git operations.

## Transaction Model

Git's index is the transaction staging area:

1. **writeBlob** — content into the object store, returns OID
2. **updateIndex** — stage the change (path → blobOid in the index)
3. Repeat — all changes staged in the index
4. **commit** — the index becomes a committed tree, transaction closes

The index persists — it survives crashes. Staged but uncommitted changes
can be committed later. No working tree, no `git add`. Blobs created
directly, index updated directly.

## No Working Tree

The standard git workflow (edit files → add → commit) is replaced by direct
object construction. There is no filesystem working tree, no `git add`
reading from disk, no filesystem dependency for git operations. Suitable for
environments where the object store lives on Hyperdrive or other P2P storage
with no local filesystem.

## What Was Removed

- **Porcelain** — add, checkout, status, clone, fetch, pull, push, stash.
  The working-tree workflow is not needed for embedded use.
- **Network** — HTTP transport, smart protocol, remote management. Object
  exchange is the embedder's concern.
- **Packfiles** — loose objects only, each individually addressable.
- **Working tree** — WORKDIR/STAGE walkers, .gitignore handling.
- **Shallow clones** — replaced with empty sets.

## What Remains

**Objects:** readBlob, writeBlob, readTree, writeTree, readCommit,
writeCommit, readTag, writeTag, readObject, writeObject, hashBlob.
**Index:** updateIndex. **Refs:** resolveRef, writeRef, expandRef,
expandOid, deleteRef, listBranches, listTags, listRefs, currentBranch.
**Branching:** branch, deleteBranch, tag, deleteTag. **History:** log,
findMergeBase, isDescendent. **Merge:** merge (3-way text).
**Navigation:** walk, TREE. **Config and utility:** getConfig, setConfig,
init, findRoot, listFiles, version.

## Design Decisions

**Stubs over removal for entangled dependencies.** GitPackedRefs and
GitRefSpecSet are stubbed rather than removed — GitRefManager references
them throughout. Safe because loose-objects-only never has packed refs.

**Merge retains the index dependency.** Git's merge uses the index to
track 3-way merge state. Removing it would require rewriting merge. Kept
as-is.

**The stripping was the learning exercise.** Every removed file was
understood before removal. The dependency structure is mapped. Further
stripping can proceed confidently when pressure surfaces.

## Current State

Proven under Bare. 42 plumbing operations tested. Not yet exercised:
merge, diff, tag operations, the updateIndex → commit flow end-to-end,
large repos.
