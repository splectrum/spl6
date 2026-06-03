# Git — substrate language of historicity

Our brand of git: the subset of the git paradigm the fabric adopts, and
what we simplify. Logical design only — Mycelium integration belongs in
the Mycelium documentation; implementation detail belongs with the
infrastructure module documentation.

## The role

Git gives the architecture its sense of time. History as a content-addressed
DAG of commits. Branching and merging as first-class operations. Every
repository complete and operational on its own. Exchange peer-to-peer with
no privileged central copy.

## What we keep

- **Object model** — blob, tree, commit. The core data structures.
  Content-addressed (SHA = identity = integrity). Immutable once created.
- **Refs** — branches as named pointers to commits.
- **Tags** — version and release markers.
- **Commit** — the quality-gated snapshot. Parent linkage = history graph.
- **Branch + merge** — 3-way merge with a pluggable merge layer.
  Standard text-based merge is one procedure; the wrapper enables
  merge procedures per data shape — record/table merge (by key,
  field-level), append-only log merge (ordering rule), schema-aware
  merge (AVRO-decoded, Round 2+), AI-assisted semantic merge. Merge
  procedure selected per context via metadata. Makes git a general
  data reconciliation tool, not just text-file version control.
- **Diff** — standard tree comparison.
- **Log** — commit graph traversal. History inspection.
- **.gitignore** — standard ignore rules.
- **Push/pull** — decentralised exchange between repos.

## What we simplify

- **No packfiles.** Loose objects only. Each object individually
  addressable and replicable on the P2P substrate. Storage efficiency
  is a substrate concern, not a git concern.
- **No working tree in the P2P native path.** Writes create objects
  directly (blob → tree → commit). The standard-compatible P2P version
  retains the working tree.
- **No index file in the P2P native path.** Tree construction is
  programmatic. The standard-compatible P2P version retains the index.
- **No smart protocol.** Object exchange uses the P2P substrate's native
  sparse replication.
- **No modules / subtrees.** Composition is a fabric concern.
- **No shallow clones / sparse checkout.** The P2P substrate provides
  sparse access natively.
- **No stash, worktrees, cherry-pick, rebase.** Merge is the
  reconciliation mechanism.
- **No hooks.** Quality gating is a fabric concern.
- **No git reflog.** Ref-log history is a substrate concern (a signed,
  subscribable stream).

## The pluggable fs

isomorphic-git (pure JavaScript, Bare-native) uses a pluggable `fs`
interface — the architectural seam enabling different implementations:

- **P2P native git** — partial git for Mycelium integration. Our
  component, our API. Uses the git object model directly (no working
  tree, no index, no porcelain).
- **Standard-compatible P2P git** — isomorphic-git's standard interface
  with a Hyperdrive fs adapter. Full porcelain. Standard git operations
  on P2P storage.
- **Standard git on bare-fs** — isomorphic-git on the OS filesystem.
  Fully standard. The correctness oracle during development.

Same git paradigm, same object model, different entry points and storage
backends.

## What lives where

| Concern | Where it is documented |
|---|---|
| The git paradigm: what we keep, what we simplify | **Language substrate** (this page) |
| How git blends with kafka in the fabric | **Mycelium** (Platform) |
| What data lives in git vs on topics | **Mycelium** (Platform) |
| Repo registration replacing modules/subtrees | **Mycelium** (Platform) |
| Quality gating replacing hooks | **Mycelium** (Platform) |
| Ref-log as data state propagation | **Mycelium** (Platform) |
| Opaque bytes (Round 1) / AVRO (Round 2) | **Mycelium** (Platform) |
| P2P native git component (our API, write path) | **Infrastructure** module |
| Standard-compatible P2P git (Hyperdrive fs) | **Infrastructure** module |
| Standard git on bare-fs (oracle) | **Infrastructure** module |
| The Hyperdrive fs adapter | **Infrastructure** module |
| The Hypercore ref-log implementation | **Infrastructure** module |
