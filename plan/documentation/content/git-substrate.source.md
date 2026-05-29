---
layout: default
lastmod: 2026-05-03
title: "Git"
---

[Home](/) > [Engineering](/engineering/) > [Substrate](/engineering/substrate/) > Git

# Git

Git is constitutive to mycelium alongside AVRO. AVRO provides the language of articulation. Git provides the temporal axis — historicity, identity, integrity, the hard boundary, and the decentralised exchange between realities.

Git capabilities are drawn on at the fabric, management, cognitive, and peer-to-peer levels. The same capability may serve different needs at different levels, accessed through the language of each.

## Git capabilities in scope

**Object model.** Four immutable, content-addressable object types: blob (opaque content), tree (named collection of blobs and sub-trees), commit (tree state plus parent links, timestamp, author, message), tag (named pointer to any object). Once written, immutable.

**Index.** Mutable staging buffer between working state and object store. Selective staging — choose what enters the next commit.

**DAG.** Commits form a directed acyclic graph through parent references. Encodes causality, not just temporal sequence.

**Refs.** Named pointers to objects. Branches advance with new commits; tags stay put. HEAD points to the current ref.

**Branching and merging.** Branch creation is a ref; no data copy. Three-way merge with common ancestor; merge commits record convergence with multiple parents.

**Worktrees.** Multiple working directories linked to the same repository, each with its own branch. Shared objects and refs, independent working state.

**History traversal.** DAG walking with composable filters — by path, date range, author, message content, code change (pickaxe). History simplification prunes branches irrelevant to a path's story.

**History rewriting.** Interactive rebase (pick, reword, squash, fixup, drop, reorder), filter-repo (transform across all commits), cherry-pick, amend. Enables consolidation and forgetting.

**Shallow operations.** `--depth`, `--shallow-since`, `--shallow-exclude`, deepening, unshallow. Partial history exchange.

**Replace.** Transparent object swap. All operations see the replacement. Stored as refs, pushable.

**Notes.** Arbitrary text attached to any object without changing its hash. Multiple namespaces. Not pushed by default.

**Garbage collection.** Packing and pruning. Unreferenced objects physically removed after a grace period.

**Reflog.** Local record of every ref movement. Survives rewriting. Configurable expiry. Recovery buffer.

**Decentralised exchange.** Every clone is complete. Push and fetch exchange objects peer to peer. Multiple remotes supported.

## Git's role in the fabric

**Checkpointing.** Fabric activity becomes remembered time through commits. The staging area is the gathering point; commit message and notes carry the narrative. Granularity is load-responsive — busy areas checkpoint frequently, stable areas rarely.

**Memory gradient.** Short-term is recent commits at full detail. Consolidation uses squash and filter-repo. Long-term reduces to significant milestones. Forgetting is garbage collection — physical deletion after consolidation. The reflog is a temporary safety buffer, not permanent memory.

**Attention-shaped memory.** Checkpoint behaviour is driven by the attention signal. Contexts under conscious attention checkpoint at high resolution with detailed messages and rich notes. Subconscious contexts checkpoint at low resolution with summary messages. The management layer reads the attention signal and adjusts.

**High-frequency complement.** Git's snapshot model doesn't reach high-frequency activity. An append-only complement (ring buffer, journaling structure) captures detail between checkpoints; rollup condenses it into commit messages or notes. The complement is the management layer's operational memory; Git is the consolidated memory.

**Selective recall.** History traversal filters answer "what happened to me." Path filters (context-scoped), date ranges (temporal windowing), message search, and history simplification scope the result. The memory gradient shapes recall: recent is detailed, distant is consolidated.

**Notes as annotation layer.** Process summaries, attention state, and consolidation records live in separate note namespaces. Lifecycle independent of the commits they annotate. Travel policy per namespace — some local, some shared.

**Reality operations.** Clone spawns a new subject reality — complete, operational, with full history. Branch parallels within one reality. Merge reconciles divergent configurations; conflict is the reconciliation mechanism. Fork is new-subject emergence carrying history. Worktrees are simultaneous points of view within one reality.

**Content-addressable mapping.** Blob ↔ mycelium record (opaque at each level). Tree ↔ mycelium context (named arrangement). Commit ↔ timestep (tree state plus causality and narrative). Tag ↔ significant marker.

**Decentralisation.** Every subject reality complete and independent. Push/fetch as peer-to-peer exchange. Shallow operations for partial exchange — recent configuration without full history. Replace enables consolidated history exchange. Multiple remotes — exchange relationships with many peers.

## Implementation

**isomorphic-git** — pure JavaScript Git implementation for Node.js and browser environments.

Pure JavaScript, no native dependencies. Programmatic API with individual functions for each operation. Full interoperability with canonical Git via standard `.git` format. Same runtime as avsc (AVRO). Tree-shakeable. Actively maintained.

**Programmatic access.** Plumbing-level operations available as function calls. The management layer operates Git through the same programming model it uses for everything else.

**Interoperability.** Standard `.git` format means canonical Git tooling works alongside — development and debugging with any Git client.

**Gaps to evaluate.** History rewriting coverage (interactive rebase, squash, filter-repo) and garbage collection within isomorphic-git. These serve the memory gradient — consolidation and forgetting. If insufficient: extend the library, supplement with canonical Git operations, or implement directly against the object store.
