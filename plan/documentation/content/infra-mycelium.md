---
lastmod: 2026-06-05
title: "mycelium — The Data Fabric Base Layer"
description: "The Mycelium data fabric base layer: CRUD + XPath navigation over git, with a Kafka record dispatch boundary."
location: engineering/infrastructure/pear-full-square/mycelium/index.md
also-update: engineering/infrastructure/pear-full-square/index.md (add entry)
---

# mycelium — The Data Fabric Base Layer

The Mycelium data fabric as a module. Blends git object operations, XPath
navigation, and URI CRUD into one API. All data is key/value with opaque
bytes (Round 1).

**Source:** [pear-full-square/mycelium](https://github.com/pear-full-square/mycelium)

---

## What It Does

Provides the elementary operations on a Mycelium data repository: select
(navigate), get/put/remove (CRUD), and commit (git state management).
The repository is a git repo — data entities are git objects (trees and
blobs).

Two interfaces:

**Internal API** — plain functions. Direct calls, throw on fatal error.
No Kafka records, no hidden conditional routes. For use by Mycelium
components and applications.

**External API** — a single Kafka record dispatch mapper at the boundary.
Unpacks a record, calls the right internal function, packs the result
back. Errors go in record headers, never thrown. For use at fabric
boundaries.

## Internal API

- **select(path, {mode})** → node[] — XPath selection. Always returns an
  array. Three visibility modes: raw (everything), data (hides `_`
  prefixed), metadata (only `_` prefixed).
- **read(path)** → Buffer | null — read value, null for directories.
- **get(path)** → Buffer — read value, throws on not found / is directory.
- **put(path, value)** → treeOid — write, creates intermediate dirs.
  Throws on type conflict (file where folder expected, or vice versa).
- **remove(path)** → treeOid — delete, throws on not found.
- **commitTree(treeOid, message, author)** → commitOid — quality gate.
- **log(ref, depth)** → commits[] — history.

Happy path execution only. Conflicts (file/folder mismatch) are fatal
errors, not silently handled. No hidden conditional processing routes.

## External API

A single `dispatch(record)` entry point. The Kafka record's `spl.operation`
header names the operation. The mapper calls the corresponding internal
function, places the result in the record's value, and stamps the status
in headers. Supports: get, put, remove, select, read.

## Three Visibility Modes

The underscore prefix (`_`) separates data from metadata at every node:

| Mode | Shows |
|---|---|
| raw | Everything — data + metadata together |
| data | Data nodes only — hides `_` prefixed entries |
| metadata | Metadata nodes only — only `_` prefixed entries |

This is the XPath navigation lens. Same paths, different views. The
metadata mode is why embedded metadata (schemas, references, configuration)
is navigable at the data layer.

## Design Decisions

**Plain functions internally.** The internal API is free to evolve without
the overhead of record construction at every step. The Kafka record is a
boundary concern, not an internal one.

**Throw on error.** Fatal errors throw — the caller decides how to handle
them. The mapper catches and stamps errors into record headers at the
boundary. No silent swallowing, no conditional routes.

**Tree modification by recursive walk.** Put and remove rebuild the git
tree from root by walking to the target path, applying the change, and
writing new tree objects back up. Intermediate directories are created
on put; type conflicts throw.

## Current State

Proven under Bare on bare-fs. Put (creates files + intermediate dirs),
get (reads content, throws correctly), select (three visibility modes
filter correctly), commit (multi-commit history with parent linking),
dispatch (record boundary mapping including error cases).

Not yet exercised: Hyperdrive backend, large trees, deep nesting,
concurrent operations, remove end-to-end.

## Dependencies

Currently uses upstream isomorphic-git. Will move to
[bare-for-pear/p2p-git](https://github.com/bare-for-pear/p2p-git)
(stripped plumbing) when integrated.

## Intention

The base fabric layer. Grows to include: Kafka topic management,
Hypercore ref-log for data state propagation, AVRO-encoded operations
(Round 2). Select will evolve to return Kafka records when topics land —
unifying git entries and log entries under one selection model.
