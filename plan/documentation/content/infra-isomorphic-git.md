---
lastmod: 2026-06-05
title: "isomorphic-git — Dual-Backend Git"
description: "Full isomorphic-git with a Hyperdrive fs adapter: standard git operations on both bare-fs and P2P storage."
location: engineering/infrastructure/bare-for-pear/isomorphic-git/index.md
---

# isomorphic-git — Dual-Backend Git

Full [isomorphic-git](https://github.com/isomorphic-git/isomorphic-git) (pure
JavaScript git implementation) with a Hyperdrive fs adapter for P2P storage.
Unmodified upstream — the fork adds the adapter and Bare runtime documentation.

**Source:** [bare-for-pear/isomorphic-git](https://github.com/bare-for-pear/isomorphic-git)

---

## What It Does

Standard git operations — porcelain (add, commit, checkout, status, log, diff,
merge, push, pull) and plumbing (readBlob, writeTree, writeCommit, etc.) — on
two storage backends, selected by plugging in the appropriate fs implementation:

- **bare-fs** — the OS filesystem under Bare. Standard git, fully compatible.
  The correctness oracle.
- **Hyperdrive** — P2P storage. Git objects as Hyperdrive entries, individually
  addressable and replicable across the swarm.

isomorphic-git takes an `fs` parameter on every call. The adapter maps 10 fs
methods (readFile, writeFile, stat, lstat, readdir, mkdir, rmdir, unlink,
readlink, symlink) to Hyperdrive v11 operations.

## The Hyperdrive Adapter

The key mapping decisions:

- **Implicit directories** — Hyperdrive directories exist only as path prefixes,
  not as entries. mkdir/rmdir are no-ops. Stat synthesises a directory result
  by probing readdir.
- **Stats synthesis** — Hyperdrive's entry() returns seq, blob size, executable
  flag, and linkname. The adapter constructs a Stats object from these, with
  an implicitDir flag for implicit directories.
- **ENOENT** — when entry() returns null and readdir finds nothing, the adapter
  throws with code 'ENOENT'. isomorphic-git depends on this for existence
  checks.

## Running Under Bare

One configuration requirement: import the **ESM build** (`index.js`), not the
CJS build. Bare resolves the `"node"` export condition by default, which points
to CJS — and the CJS build hard-requires Node's `crypto`. The ESM build falls
back to pure-JS `sha.js`. All other dependencies are pure JS.

## Current State

Proven via POC probe. Porcelain and plumbing operations produce identical
commit hashes on both backends. A full round-trip (bare-fs → Hyperdrive →
bare-fs) with 14 git objects returns identical content. Not yet exercised:
merge, large repos, concurrent access, symlink round-trip.
