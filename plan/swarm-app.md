# Swarm app — plan

The closing deliverable of spl6. A containerised entrypoint to the SPLectrum
P2P swarm: join, browse, use. Two containers, composed via docker-compose,
images on GitHub Container Registry (`ghcr.io/splectrum`).

Two parts: **infrastructure** (the swarm, containers, browser UI) then
**git integration** (the swarm as a remote, git tools distributed via the
drive).

## Architecture

Two containers on a private DHT (flat bridge network, no NAT):

### Seed node (persistent, always-on)

The origin. Runs two roles in one container:

- **DHT bootstrapper** — `HyperDHT.bootstrapper(port, host)`. The rendezvous
  point for the private swarm. Must be up before any peer joins.
- **Hyperdrive host** — Corestore on a Docker volume (survives container
  restarts), Hyperswarm peer replicating the drive to anyone who joins.
  This is where drive contents live durably.

Minimal surface: no UI, no HTTP. Just DHT + replication.

### Peer node (user's entrypoint, ephemeral)

The user-facing peer. Joins the swarm, replicates the drive, provides:

- **Browser UI** (HTTP on a mapped port) — browse drive contents, swarm
  status, launch processes
- **Process execution** — pull code from the drive, run it in the container
  (the Phase 5 code mobility pattern)
- **Git-over-HTTP** (Part 2) — isomorphic-git backed by Hyperdrive behind
  a git smart HTTP interface

Can run fully isolated or with host integration (mount propagation, port
mapping).

## What's on the drive

The drive carries the SPLectrum P2P toolchain — the git components and
infrastructure modules that a peer needs. Software lives on the swarm,
gets used on the host.

- **Git components** — isomorphic-git, p2p-git, and the supporting modules
  from bare-for-pear. Available on the drive, downloadable to the host for
  local use
- **hyperdrive-fuse** — downloadable FUSE mount module for hybrid local/P2P
  work with local repos
- **mycelium** — the fabric base layer module
- **App/role registry** — metadata about available software, entry points,
  dependencies (evolves from Phase 5's `/registry.json`)

## Container registry

Images on `ghcr.io/splectrum`:

- `ghcr.io/splectrum/swarm-seed` — the seed node
- `ghcr.io/splectrum/swarm-peer` — the peer node

Public. Tagged by version. Users pull and run — that's the install experience.

---

## Part 1 — Infrastructure

### Phase 1 — Seed node + private DHT

Prove: a container that bootstraps a private DHT and hosts a Hyperdrive
on a persistent volume. A second instance (manual, no UI) can join and
replicate the drive.

- DHT bootstrapper + Hyperswarm peer in one process
- Corestore on a Docker volume
- Seed some test content onto the drive
- docker-compose with flat bridge network + .env config
- Verify: second container joins, replicates, reads the content

Building blocks: Phase 1 (DHT), Phase 5 (drive replication). Composition,
not invention.

### Phase 2 — Peer node + browser UI

Prove: the peer container joins the swarm, replicates the drive, and
serves a browser UI that lets you browse drive contents.

- HTTP server (Node.js built-in `http` or Bare equivalent)
- Static HTML/JS served from the container
- API endpoints: list directory, read file, swarm status
- Browser renders drive contents as a navigable tree

Building blocks: drive replication (proven), HTTP (trivial). The UI is new.

### Phase 3 — Process execution + drive content

Prove: software on the drive can be launched from the UI, and modules
can be downloaded to the host.

- UI "launch" button → pull code from drive → execute in container
- hyperdrive-fuse, mycelium, git components seeded onto the drive
- Download mechanism from browser UI to host filesystem

Building blocks: code mobility (Phase 5). Wiring.

---

## Part 2 — Git integration

### Phase 4 — Git-over-HTTP

Prove: local repos can push/pull to the swarm via standard git.

- Git smart HTTP protocol server in the peer container
- isomorphic-git operations on Hyperdrive behind the HTTP interface
- `git clone http://localhost:port/repo` works
- Push from local → appears on drive → replicates to seed → available
  to other peers

The git components (isomorphic-git, p2p-git) live on the drive and are
used by the peer container itself — the swarm serves the tools that make
the swarm work.

Building blocks: isomorphic-git on Hyperdrive (proven), git HTTP protocol
(new composition). This is the load-bearing new work.

### Phase 5 — Swarm as remote + host-side git tools

Prove: the swarm functions as an additional remote alongside GitHub/local.

- `git remote add swarm http://localhost:port/repo` in a local repo
- Push/pull cycle: local → swarm → replicates across peers
- Git tools from the drive usable on the host (downloaded in Part 1,
  wired up here)
- FUSE mount for hybrid work — browse swarm repos as local filesystem

The end state: our repos have GitHub as one remote, the swarm as another.
The swarm remote is P2P, signed, replicated.

---

## Code location

`pear-full-square/p2p-docker-dev` — the existing POC repo (vendored into
spl6 as subtree at `poc/p2p-docker-dev`). A new phase alongside the
existing phases 1–6.

```
phase-7-swarm-app/
  seed/              — seed node (Dockerfile, source)
  peer/              — peer node (Dockerfile, source, UI)
  docker-compose.yml — both containers + network
  .env.example       — bootstrap IP/port, cluster seed, drive key
  journey/           — session logs, iteration notes
```

## Runtime

Both containers can run Bare — the browser UI replaces FUSE as the primary
interface, so the `fuse-native` Node.js dependency doesn't apply. FUSE is a
separate downloadable that runs on the host under Node.js.

## What this proves

The swarm primitives (all proven individually in Chapter 3) compose into a
working user-facing application: join a swarm by pulling a container, browse
what's available, use the swarm as a git remote, run software from the
swarm. The minimum viable P2P experience.
