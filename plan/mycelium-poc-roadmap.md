# Mycelium POC roadmap

The build path for the Mycelium data layer: git first, then kafka, with
XPath growing alongside. Each step builds on the previous and is testable
against it as oracle.

## Module homes

- **bare-for-pear** — infrastructure modules. The isomorphic-git forks
  (fork 1 and fork 2). Forked dependencies alongside avsc, avsc-rpc, etc.
- **pear-full-square** — P2P/Pear application code. The Mycelium git
  component, XPath navigator, topic management. POC and production code.
- **splectrum** — data repos with embedded functionality. The actual
  Mycelium data repositories. Not JS source code.

## Git — the migration path

### Step 1 — bare git (done)

isomorphic-git on bare-fs. Standard git operations under Bare on the OS
filesystem. Proven in the `isomorphic-git-under-bare` probe: init, commit,
log, working-tree reconstruction. Pure JS, no fork, ESM build.

No module to extract — isomorphic-git is an npm dependency, bare-fs is a
Bare built-in. Just use them.

### Step 2 — fork 1: full isomorphic-git on Hyperdrive

Fork isomorphic-git. Add the Hyperdrive fs adapter — a thin adapter
(readFile, writeFile, stat, readdir, mkdir, unlink) mapping to Hyperdrive
entry operations. Standard git (full porcelain: add, commit, checkout,
status, log, diff, merge) running over Hyperdrive storage.

**Test against:** original isomorphic-git on bare-fs (step 1). Same
operations, same git objects, different storage backend. One variable:
the Hyperdrive adapter.

**Delivers:** standard-compatible P2P git. Useful on its own — a
bare-for-pear module.

### Step 3 — fork 2: stripped to plumbing

Clone fork 1. Strip to the plumbing API only:
- Object operations: writeBlob, readBlob, writeTree, readTree,
  writeCommit, readCommit, readTag, writeTag
- Refs: resolveRef, writeRef
- Standard 3-way text merge
- Diff (tree comparison)
- Log (commit graph traversal)

Remove: porcelain (add, checkout, status), HTTP transport, smart protocol,
credential handling, working-tree operations, index-file operations, and
all utilities only those depend on.

The stripping is the learning exercise — go through the codebase,
understand what each piece does, keep what we need, discard the rest.

**Test against:** fork 1 on Hyperdrive (step 2). Same Hyperdrive storage,
same object operations, less code. One variable: code removal. If the
same git operations produce the same objects, nothing essential was removed.

**Delivers:** a stripped git engine — object operations + text merge on
Hyperdrive. The foundation for the P2P native git component.

### Step 4 — Mycelium git component (new module)

A new module calling into fork 2. This is Mycelium's P2P native git — the
fabric-specific layer on top of the git engine.

**Adds:**
- The native write path (blob → tree → commit, no working tree, no index)
- XPath-compatible tree navigation (walk trees, read blobs by hash)
- Ref-log on Hypercore (subscribable, signed, live-tailable — data state
  propagation at the commit cadence)
- Pluggable merge dispatch — reads context metadata, selects the merge
  procedure:
  - Text-based (delegates to fork 2's standard 3-way merge)
  - Record/table (merge by key, field-level conflict detection)
  - Append-only log (ordering rule, no conflict)
  - Schema-aware (AVRO-decoded, Round 2)
  - AI-assisted (semantic merge)
- The tracked/committed model (index as write overlay, commit as quality
  gate)
- Recursive repo registration (parent registers child, registration node
  = child's repo root, child git-ignored)
- Loose-objects-only enforcement

**Test against:** fork 2 for the git engine operations (same objects, same
hashes). Fork 1 and original as transitive oracles.

**Delivers:** P2P native git for Mycelium integration.

## The chain

```
Original isomorphic-git (bare-fs) — the oracle
    ↑ tested against
Fork 1: full isomorphic-git + Hyperdrive adapter — standard P2P git
    ↑ tested against
Fork 2: stripped to plumbing + text merge — the git engine
    ↑ calls into
Mycelium git component — fabric logic (new module)
```

Each step isolates one concern: step 2 proves the adapter, step 3 proves
the stripping, step 4 adds the fabric layer. If something breaks, you
know which step caused it.

## XPath — the navigator (running thread)

XPath grows alongside the infrastructure — each step validates what was
just built. The navigator is how you verify the fabric works.

### After git step 4 — minimal git navigator

Navigate the git tree: walk tree objects, read blob values, the three
visibility modes (data, metadata, raw). Forward-only from root. Self +
descendants for data; self + ancestors for functional resolution.

**Test against:** bare-fs git navigation as oracle. Same paths, same
values, different storage.

**Delivers:** proof that the native git data structure is navigable
without a filesystem.

### After kafka step 2 — add log navigation

Extend with log navigation: read at offset, range, latest. The
sequence/time axis.

**Test:** one expression reaches both a git blob and a topic record.

### After integration (kafka step 4) — seamless traversal

Navigate across both stores in one expression. The seam between
git-backed and log-backed paths is invisible to navigation.

**Delivers:** the unified XPath navigator for Round 1 (opaque bytes).

## Kafka — the topic infrastructure

After git. The kafka side is structurally simpler — Hypercore IS the log.

### Step 1 — Kafka record on Hypercore

Define the Kafka record shape (key + value + headers) as the block format
on a Hypercore topic. Write records, read by offset, read range, read
latest. Test: records written can be read back with the correct shape.

### Step 2 — live-tail (subscription)

`createReadStream({live})` as the subscription mechanism. A subscriber
sees new appends as they happen. Test: write to a topic, subscriber
receives. The reactive data state propagation trigger.

### Step 3 — topic management

Create, list, inspect topics owned by a data repository. Topic references
(subscription declarations) as git-tracked wiring. Test: a repo declares
a topic reference, the peer replicates it, the data is locally addressable.

### Step 4 — integration with Mycelium git component

Topic references wired to the git component. Ref-log on Hypercore
connected. The two sides (git + kafka) operating as one fabric in a data
repository. Test: a commit propagates via ref-log; a data change event
propagates via topic; XPath navigates both.

## Scope

Round 1 throughout — opaque bytes. No AVRO, no schema-aware access, no
internal structure interpretation. Get the physical data layer working
end to end, then add the semantic layer (Round 2).
