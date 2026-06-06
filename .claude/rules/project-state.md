# Project State

Snapshot of where the work stands. Update at commit points
when the state shifts. Reflects current reality, not history
— the git log is the history.

## Last session (2026-06-06) — swarm app complete (all 7 phases)

Built the swarm app end-to-end: apps with code mobility, FUSE drives
(read-write) on the host, local execution with bare, per-node world
view, and settled architecture. Design doc captures the full model.

### Swarm app — what's proven

**Phase 1+2** — seed node (DHT + Hyperdrive + persistent volume), peer
node (join + replicate), browser UI SPA with dashboard, node switcher,
drive browser, status views.

**Phase 3** — apps on the drive. Registry + three demo apps (hello,
drive-stats, peer-ping). `/api/run` loads app source from Hyperdrive,
evals it. Apps tab in browser UI. Code mobility proven: peer runs code
replicated from seed.

**Phase 4+5** — FUSE drive + local execution. Container runs Node.js
(for FUSE via fuse-native) alongside bare. Single process, same drive
object, no lock conflicts. FUSE projected to host via rshared bind mount
(requires `sudo mount --make-rshared /` on WSL2). Drive carries
executable apps at `/apps/`; bare binary overlaid from container image
onto FUSE at `/bin/bare` (not replicated via Hyperdrive — keeps sync
fast). Proven: `ls` the drive from host, run an app with bare from the
mount, no install.

**Phase 6** — world view drive. Each node gets its own writable
Hyperdrive (separate corestore namespace). Periodic status/peer updates,
app execution logging to `/runs/`. Exposed via API (`/api/world/*`),
FUSE on host (`mnt/*/world/`), and World View tab in browser UI.

**Phase 7** — read-write FUSE. Write ops (create, write, truncate,
unlink, mknod) with buffered writes flushed on release. Proven from
host: touch creates files, echo/cp writes content, lands on Hyperdrive,
visible via API and browser UI.

### Architecture settled

- **Node container** = general-purpose swarm membership manager. One
  container per membership. Handles connectivity, replication, keys, API.
- **FUSE drive** = the user interface. Filesystem is the app contract —
  any language, any runtime.
- **Two tiers**: container-side (node internals, credentials, swarm) and
  host-side (user tools, bare, apps via FUSE). Container is the engine,
  FUSE is the steering wheel.
- **Security model**: container is trust boundary. Private key never
  leaves node process. Apps write through FUSE/API — node validates and
  signs. Untrusted code outside, trusted code inside.
- **Holepunch stack works on Node.js** — Hyperswarm, HyperDHT, Corestore,
  Hyperdrive all load and run under Node.js, not only bare.
- **Corestore namespaces** for multiple drives per node
  (`store.namespace('world')`).
- **FUSE overlay** — local files (e.g. bare binary) served alongside
  drive content without storing on Hyperdrive.

### Key findings this session

- `Hyperdrive(store, { name: 'world' })` hangs — use
  `store.namespace('world')` for multiple drives per corestore
- Shebang lines (`#!`) break `new Function` eval — strip before running
  via API
- `module.parent` is null in `new Function` context — use `__filename`
  guard for dual-mode apps (direct exec vs require)
- Docker rshared bind mounts need `sudo mount --make-rshared /` on WSL2
- Stale FUSE mount points cause "transport endpoint not connected" — 
  entrypoint must `fusermount -u` before `mkdir`
- 90MB bare binary on Hyperdrive kills peer sync — overlay from container
  image instead
- FUSE write: bash `>` redirect doesn't create new files (kernel doesn't
  call `create` after `getattr` ENOENT on some versions); `touch` first
  then write works, as does Python `os.open` with O_CREAT

## Working end-to-end

Chapter 1 migration on TCP: 73 tests passing. Unchanged.
Swarm app: all 7 phases proven. Design: `phase-7-swarm-app/design.md`.

## Next up

1. **spl7 preliminary plan** — shape the next project's scope and
   carry-forward items.
2. **spl6 closure** — wrap up, final state, hand off to spl7.
