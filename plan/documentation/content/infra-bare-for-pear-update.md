---
lastmod: 2026-06-05
title: "bare-for-pear — update"
description: "Add isomorphic-git and p2p-git entries to the bare-for-pear index page."
updates: engineering/infrastructure/bare-for-pear/index.md
---

Add two new entries to the modules list:

- [isomorphic-git](isomorphic-git/) — full isomorphic-git with Hyperdrive fs
  adapter. Dual backend: bare-fs (standard) and Hyperdrive (P2P).
- [p2p-git](p2p-git/) — isomorphic-git stripped to plumbing. The git engine
  for Mycelium — object operations, refs, merge, log, walk.
