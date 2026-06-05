---
lastmod: 2026-06-05
title: "p2p-git — Stripped Git Plumbing"
description: "isomorphic-git stripped to plumbing only — the git engine for Mycelium. No porcelain, no network, no packfiles."
location: engineering/infrastructure/bare-for-pear/p2p-git/index.md
---

# p2p-git — Stripped Git Plumbing

isomorphic-git stripped to the plumbing API. Object operations, refs, merge,
log, walk — and nothing else. The git engine for Mycelium.

**Source:** [bare-for-pear/p2p-git](https://github.com/bare-for-pear/p2p-git)

---

## What It Does

Git object-level operations as a stripped, P2P-ready engine. 41 exports from
the original 70. 8,336 lines removed, 78 files deleted.

**Object operations:** readBlob, writeBlob, readTree, writeTree, readCommit,
writeCommit, readTag, writeTag, readObject, writeObject, hashBlob.

**Refs:** resolveRef, writeRef, expandRef, expandOid, deleteRef, listBranches,
listTags, listRefs, currentBranch.

**Branching:** branch, deleteBranch, tag, deleteTag.

**History:** log, findMergeBase, isDescendent.

**Merge:** merge (3-way text merge).

**Navigation:** walk, TREE.

Entry point: `src/plumbing.js`.

## What Was Removed

Everything the P2P substrate provides natively or Mycelium doesn't need:

- **Porcelain** — add, checkout, status, clone, fetch, pull, push, stash,
  cherry-pick, notes. The working-tree workflow is not used in the P2P
  native path.
- **Network** — HTTP transport, smart protocol, remote management. Object
  exchange uses Hyperdrive sparse replication.
- **Packfiles** — pack index, packed object storage. Loose objects only —
  each object is a single drive entry, individually replicable.
- **Working tree** — WORKDIR/STAGE walkers, .gitignore handling.
- **Shallow clones** — replaced with empty sets (no shallow support needed).

## Design Decisions

**Stubs over removal for entangled dependencies.** GitPackedRefs and
GitRefSpecSet are stubbed (return empty) rather than removed, because
GitRefManager references them throughout. The stubs are safe — loose-objects-
only mode never has packed refs, and no remotes means no refspecs. A deeper
refactor can remove the entanglement when pressure surfaces.

**Merge retains the index dependency.** Git's merge implementation uses the
index to track 3-way merge state. Removing the index would require rewriting
merge. Kept as-is — merge is the most valuable complex operation to retain.

**The stripping was the learning exercise.** Every removed file was understood
before removal. The dependency structure is mapped and the remaining code is
known well enough to continue stripping or refactoring confidently.

## Current State

Proven under Bare. All 41 plumbing operations tested: init, write/read
blob/tree/commit, refs, log, walk, branch, listBranches. Not yet exercised:
merge, diff, tag operations, large repos.

## Intention

Foundation for the [Mycelium](https://github.com/pear-full-square/mycelium)
git component. Mycelium calls into p2p-git for object operations and wraps
it with fabric semantics. Further stripping may continue as the Mycelium
component matures.
