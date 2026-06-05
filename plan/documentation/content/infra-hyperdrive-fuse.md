---
lastmod: 2026-06-05
title: "hyperdrive-fuse — FUSE Mount for Hyperdrive"
description: "Read-only FUSE mount for Hyperdrive v11 — mount a P2P drive as a local filesystem."
location: engineering/infrastructure/pear-full-square/hyperdrive-fuse/index.md
also-update: engineering/infrastructure/pear-full-square/index.md (add entry)
---

# hyperdrive-fuse — FUSE Mount for Hyperdrive

Read-only FUSE mount for Hyperdrive v11. Mount a P2P drive as a local
filesystem. The drive is a window into the swarm — pure visibility. Writes
go through the fabric, not through the mount.

**Source:** [pear-full-square/hyperdrive-fuse](https://github.com/pear-full-square/hyperdrive-fuse)

---

## What It Does

Maps OS filesystem calls (ls, cat, find) to Hyperdrive operations via
fuse-native. The user sees a directory tree with files; underneath, the
data lives on Hyperdrive — P2P, replicated, signed.

The MVP is read-only. All write operations return EROFS (read-only
filesystem). The read-only constraint is deliberate: the mount is for
browsing and launching, not for editing. Data changes go through the
Mycelium fabric or `spl` commands.

## FUSE Handlers

| Operation | Behaviour |
|---|---|
| readdir | List Hyperdrive directory entries |
| getattr | File/directory stat (size, mode) |
| open | Read-only — rejects write flags |
| read | Read file content from Hyperdrive |
| release | Close file handle |
| write, create, unlink, mkdir, rmdir, rename | EROFS |

## Architecture

fuse-native runs under **Node.js**, not Bare. It requires Node builtins
(os, fs, child_process). This is appropriate — the FUSE mount is the OS
bridge by nature. Apps discovered on the drive connect to the swarm
natively; the mount itself is the OS-facing window.

Hyperdrive directories are implicit (they exist only as path prefixes).
The getattr handler probes readdir to detect implicit directories when
entry() returns null.

## Platform

Tested on WSL2 (Linux 5.15, FUSE built into the kernel — no custom kernel
needed). Requires `--cap-add SYS_ADMIN --device /dev/fuse` in Docker.
Mounted drives on WSL2 are accessible from Windows via `\\wsl$\`.

Not available on Windows natively (FUSE is Linux kernel). A future WinFsp
implementation would be the Windows equivalent.

## Current State

Proven via POC probe in Docker: readdir, read, stat, write rejection, clean
mount/unmount. Interactive mode available for browsing from a second terminal.

Key finding: FUSE handler callbacks must be async-compatible. Synchronous fs
calls from the consumer side deadlock the Node.js event loop.

Not yet exercised: large directories, deep nesting, concurrent reads,
performance under load, multi-peer replication while mounted.

## Intention

The visible face of the P2P platform. Joining a swarm = mounting a FUSE
drive. The drive is a catalogue: shared code (read-only), available apps,
swarm data. Apps on the drive execute and connect to the swarm natively for
data operations.

Future: writable per-node workspaces (path-based permissions), app startup
from the drive, integration with the mycelium module.
