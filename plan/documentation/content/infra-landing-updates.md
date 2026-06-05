---
lastmod: 2026-06-05
title: "Infrastructure landing page updates"
description: "Updated bare-for-pear and pear-full-square index pages with new modules."
replaces: |
  engineering/infrastructure/bare-for-pear/index.md
  engineering/infrastructure/pear-full-square/index.md
---

## bare-for-pear

Modules built for the [Bare](/engineering/infrastructure/bare/) runtime — a mix
of community forks (Node.js assumptions stripped, Bare's minimal API surface
honoured), git infrastructure, and a minimal P2P git engine. Published under
the [bare-for-pear](https://github.com/bare-for-pear) GitHub organisation.

### Modules

- [avsc](avsc/) — Avro type system, serialization, schema evolution. Fork of
  mtth/avsc, barified.
- [avsc-rpc](avsc-rpc/) — Avro RPC protocol, service definition, transports.
  Extracted from avsc v5, barified.
- [git](git/) — git CLI wrapper, subtree management, two-reality model.
  Original module.
- [rpc-server](rpc-server/) — server lifecycle, PID management, file-based
  command IPC. Original module.
- [isomorphic-git](isomorphic-git/) — full isomorphic-git with a Hyperdrive fs
  adapter. Standard git on bare-fs or P2P storage. Fork of isomorphic-git.
- [p2p-git](p2p-git/) — minimal git engine for embedding. isomorphic-git
  stripped to plumbing — object operations, index, refs, merge. No porcelain,
  no network, no packfiles, no working tree.

---

## pear-full-square

P2P application code built on the Bare + Holepunch stack. A mix of
proof-of-concept work and production modules. Published under the
[pear-full-square](https://github.com/pear-full-square) GitHub organisation.

### Modules

- [hyperdrive-fuse](hyperdrive-fuse/) — read-only FUSE mount for Hyperdrive
  v11. Mount a P2P drive as a local filesystem. The swarm as a drive.
- [mycelium](mycelium/) — the Mycelium data fabric base layer. CRUD and XPath
  navigation over git objects, with a Kafka record dispatch boundary.

### POC work

- [p2p-docker-dev](https://github.com/pear-full-square/p2p-docker-dev) —
  containerised P2P dev cluster. Phases 0–6 exploring Hyperswarm, RPC,
  pub/sub, managed code, reactive dataflow. The proving ground for the
  building blocks.
