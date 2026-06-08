# spl7 — preliminary plan

What spl7 picks up, what it delivers, and how the work is shaped.
Written at the close of spl6, before the project boundary.

## What spl6 delivered

spl6's arc was: migrate the proven fabric → explore the P2P substrate →
design Mycelium → prove the swarm primitives compose.

**Carried forward from spl5:** the Mycelium fabric on TCP — AVRO RPC,
namespace-as-filesystem dispatch, stream record, pack-at-boundary,
handler contracts, input schemas, help system. 73 tests green. This
remains the working oracle.

**P2P primitives proven (Chapter 3):** identity, connect-by-key,
protomux, replication, code mobility, isomorphic-git under Bare,
reactive dataflow. Every load-bearing primitive catalogued
(`p2p-building-blocks.md`).

**Mycelium Round 1 design (Chapter 4):** the elementary data building
block — git for mutable structure, Hypercore topics for immutable data
streams, XPath/URI navigation, opaque bytes. Design:
`mycelium-design.md`.

**Swarm app (7 phases):** bridgehead container, FUSE Hyperdrive
(read-write), code mobility, world view drive, browser UI. Architecture
settled: container-as-membership-manager, FUSE-as-user-interface,
two-tier execution. Design: `phase-7-swarm-app/design.md`.

**Substrate documentation (splectrum.world):** git, kafka, uri, xpath
pages reworked to reflect the design. URI naming scheme settled
(`[_a-z0-9][a-z0-9]*`), packed/unpacked indifference, underscore as
namespace mount, pointer records, always-array return. Landing page
updated with P2P context and git/Kafka authority split.

## spl7 centrepiece — native Mycelium on the swarm

spl7 builds the native Mycelium. The design and the primitives are
proven; spl7 makes them work together as a real data fabric on the P2P
substrate.

The deliverable is a working swarm where each peer exposes a Mycelium
tree — navigable by URI/XPath, managed by git, backed by Hyperdrive —
instead of ad-hoc files. Opaque bytes (Round 1). Simple git operations.
Enough to tool the swarm for real.

## The master data view

A swarm has a master data view: a tree structure that gives visibility
to everything in the cluster. It contains the packages available to the
swarm, runtime folders for peer state and operational data, and the
shared structure that every member sees.

The master data view uses the URI naming scheme settled in spl6 —
lowercase alphanumeric segments, no multiword separators, underscore
for orthogonal namespace mounts, files without extensions. The tree is
designed, not ad-hoc.

## Three git repo levels

The master data view is managed through three levels of git repository:

**Template.** The empty structure — the tree layout with all the
namespace nodes, metadata mounts, and folder conventions in place, but
no installed content. This is a reusable design: any swarm of this type
starts from the same template. The template is itself a git repository.

**Install.** A fork of the template, populated with the actual
functionality for a specific swarm. Packages, apps, configuration,
operational schemas — the things that make this swarm what it is (e.g.
"our dev swarm"). The install repo is the swarm's configured reality,
ready to be instantiated.

**Instance.** A fork of the install repo, created at swarm
instantiation. Each peer gets its own instance — its own git repo, its
own Hyperdrive, its own identity. Single owner, single writer. The
install repo is the upstream; the instance is the peer's live reality.

Fork (not branch) at the instance level, because each peer is a
single-writer with its own Hyperdrive and its own signing key. A branch
would share one repo across peers; a fork gives each peer isolated
ownership. Pulling updates from the install is a git pull from upstream
— available but not POC scope.

## Hyperdrive backed by git

Each peer's Hyperdrive — the replication and FUSE surface — is backed
by a git repository. The Hyperdrive provides P2P distribution and the
FUSE mount; git provides versioning, checkpointing, and the transaction
model. The git repo tracks what the peer holds and when it arrived.

This is the Mycelium design realised: git for mutable structure on
Hyperdrive. The peer's data surface is the Hyperdrive; the structured,
versioned reality underneath is git.

## Navigation and operations

**XPath/URI navigation** implements the scheme settled in spl6. Path
segments follow the naming rules. Navigation returns pointer records
(fully resolved references to the physical data — git blob, packed
file key, topic entry). Selectors always return arrays. Opaque bytes
at Round 1 — no AVRO interpretation.

**Git operations** are simple: commit (checkpoint), push (propagate to
Hyperdrive, replicates to peers). No merge — each peer is a single
writer with no conflict surface. Push latest. The master data view
gives visibility; navigation gives access.

## POC scope

The spl7 POC proves:

- The master data view as a designed Mycelium tree
- The template → install → instance lifecycle through git
- XPath/URI navigation with the naming scheme (opaque bytes, pointer
  records, always-array)
- Git operations on the P2P substrate (isomorphic-git on Hyperdrive)
- Hyperdrive-backed git as the peer's data surface
- The swarm tooled with real Mycelium structure, not ad-hoc files

**Not in POC scope:** AVRO / schema-aware navigation (Round 2), Kafka
topics (immutable data streams), merge / conflict resolution, pulling
upstream updates from install to instance, multi-writer.

## Carries forward from spl6 (beyond POC)

Items that carry forward but sit outside the POC scope. They feed into
later spl7 work or subsequent projects:

- Mycelium design Round 2 — AVRO, schema-aware XPath/URI, schema
  evolution
- Kafka topics — immutable data change event streams, the authority
  split with git
- SPLectrum / HAICC pillar design review + documentation
- Infrastructure — private swarm, HiveRelay, git-on-Hyperdrive at scale
- Pear documentation pages (splectrum.world)
- Doc-freshness agent routine + ecosystem discovery
- Backlog: harness-as-direct-RPC-client, context stream types, test
  runner auto-start/stop, CLI help rendering

## Input documents

- `plan/mycelium-design.md` — Round 1 design (the elementary data
  building block)
- `plan/p2p-building-blocks.md` — POC catalogue (proven primitives)
- `plan/swarm-picture.md` — swarm operating model synthesis
- `poc/p2p-docker-dev/phase-7-swarm-app/design.md` — swarm app
  architecture
- splectrum.world substrate pages — git, kafka, uri, xpath (settled
  commitments and naming scheme)
