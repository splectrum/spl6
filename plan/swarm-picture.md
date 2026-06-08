# The SPLectrum Swarm — a picture from the POCs

How the proven primitives compose into the swarm's operating model.
This document synthesises what the Chapter 3 POCs proved and what the
swarm app demonstrated into a coherent picture of how a SPLectrum swarm
works in practice. It's the bridge between the POC catalogue
(`p2p-building-blocks.md`) and the Mycelium design
(`mycelium-design.md`) — what the infrastructure looks like when you
stand in front of it.

## Vocabulary

**Circle** — a running swarm. One concern, one trust domain, one
signing key. The living instance of a solution — a group with shared
purpose, trust, and boundary. You belong to circles the way you belong
to groups in life: each is autonomous, bounded, and purposeful.

**Actor** — a participant's platform presence across their circles. The
actor holds all the memberships — one container per circle, all running
on the actor's machine. The actor is the person (or entity) as seen by
the platform; the local machine is where their circles meet.

**Component** — a functional unit built on Mycelium. A repo with its
data owners, protocols, and operators, attached to a FUSE Hyperdrive
on a container. A component has meaning — it's a piece of SPLectrum,
not just infrastructure.

**Solution** — the design of a circle. Which components compose, how
they interact, what the circle as a whole achieves. Multiple circles
can run the same solution (different instances, different members).

**Bridgehead** — the container that establishes a foothold on a circle's
swarm. One container per circle membership. The actor's representative
in that circle.

The stack: **software** (tools and libraries) → **platform**
(architecture and substrates) → **components** (functional units) →
**solutions** (circle designs) → **circles** (running swarms) →
**actors** (participants across circles).

## What a circle is

A circle is a set of peers that discover each other through a shared
DHT, replicate signed data through Hyperdrives, and execute code
distributed from those drives. Trust is the key — if you trust a
drive's signing key, you trust the content. There is no central server,
no registry service, no deployment pipeline. The swarm is the
infrastructure.

Each peer is a **data owner** in Mycelium terms — it holds a git
repository on Hyperdrive (mutable structure), maintains Hypercore topics
(immutable data change events), and subscribes to other owners' topics.
The circle is a **data world**: the totality of data state across all
owners, enumerable, replicable, and reactive.

A circle is concise — one concern, one trust domain. An actor
participates in multiple circles simultaneously, each a separate swarm,
each a separate container on their machine. This mirrors human
experience: we are members of many groups, each with its own purpose
and trust boundary.

## The bridgehead

Each circle membership runs as a container — a **general-purpose swarm
membership manager**. One container, one membership, one keyed identity.
Spinning up a container is joining a circle. No further steps.

The bridgehead handles everything that needs to run continuously and
hold credentials:

- **DHT connectivity** — bootstrapping, peer discovery, connection
  management. The container is the node as far as the circle sees it.
- **Drive replication** — Hyperdrive content syncs automatically to any
  peer that connects. Signed content, sparse replication, persistent
  corestore on a volume.
- **Key management** — the signing seed stays inside the container
  process. Apps and users never touch it. The bridgehead signs on their
  behalf.
- **HTTP API + browser UI** — browse drive contents, run apps, inspect
  state, manage the node. The programmatic and visual interface to the
  membership.
- **FUSE mount** — the Hyperdrive projected as a local filesystem,
  propagated to the host. The user's hands-on interface.

The bridgehead is the **engine**. It runs Node.js (for FUSE via
fuse-native) and bare (for swarm-native code) in a single process,
sharing the same drive objects. No lock conflicts, no separate sidecar.

### What the POCs proved

The managed-cluster POC (phase 5) proved the core pattern: a manager
seeds role-code and a signed registry into a Hyperdrive; generic workers
replicate by the trusted key, read the manifest, pull their role, and
run it. Trust = the signing key. The app owns all runtime code.

The swarm app (phase 7) proved the bridgehead model: `docker compose up`
and you're in the circle. Seed node bootstraps the DHT and hosts the
content drive; peer nodes join, sync, and serve. Both expose HTTP API,
browser UI, and FUSE — same capability, different roles.

## The FUSE Hyperdrive

The FUSE drive is the **steering wheel**. The Hyperdrive mounted as a
read-write filesystem on the host. Everything the user interacts with
comes through the mount point.

### What's on the drive

The content drive carries the circle's shared assets:

```
/apps/              — executable app scripts (shebang → bare)
/bin/bare           — the bare runtime (overlaid from container image)
/registry.json      — app registry
/README.md          — circle identity
```

The world view drive is the node's personal ledger:

```
/status.json        — current node state (refreshed periodically)
/peers.json         — connected peers
/runs/              — app execution history
```

Both drives are mounted on the host. `ls` them, `cat` files, write
results. The filesystem is the app contract — any language, any
runtime, anything that reads and writes files works.

### Overlays

Not everything on the FUSE mount comes from the Hyperdrive. The bare
binary, for example, is 90MB — replicating it to every peer would kill
sync. Instead, the FUSE layer overlays it from the container image.
The file appears on the mount at `/bin/bare` but is served from the
container's local filesystem. The overlay mechanism is general: any
local file can be projected alongside drive content without storing it
on the Hyperdrive.

### Read-write

The FUSE mount supports writes. A file written through FUSE is buffered
per file descriptor and flushed to `drive.put()` on release. The
bridgehead signs the write, and it replicates to the circle. From the
host:

```
touch /mnt/drive/world/my-result.txt
echo "result data" > /mnt/drive/world/my-result.txt
```

The write lands on the Hyperdrive, visible through the API and browser
UI. This is the foundation for boundary validation — the bridgehead can
inspect, validate, and accept or reject writes before they hit the
drive.

## Two tiers of execution

**Container-side** — node internals. The swarm connection, replication,
key management. Infrastructure that runs continuously and holds the
credentials. The bridgehead starts, the node joins, it runs unattended.

**Host-side** — user tools. Apps, git, anything the user interacts
with. Runs from the FUSE drive with bare, operates on files. No
credentials needed, no swarm connection. Talks to the bridgehead
through the filesystem boundary.

The bridgehead is the trust boundary. Untrusted code runs outside (on
the host, via FUSE). Trusted code runs inside (the node). The FUSE
mount and the API are the boundary processes — the only surfaces the
container exposes. The bridgehead controls what passes through.

### Code mobility

Apps live on the drive as self-contained scripts. The peer replicates
them from the seed's Hyperdrive. To run an app:

- **Via API**: the bridgehead loads the script from the drive, evals it
  in a sandboxed context, returns the result. The browser UI provides a
  Run button.
- **Via FUSE**: bare runs the script locally on the host. The app reads
  and writes files on the drive. No install — bare and the app are
  both on the mount.

The same app runs both ways. The contract is simple: `module.exports =
{ name, description, run(ctx) }` for the API path, or a standalone
script with a shebang for the FUSE path. Dual-mode apps use a guard
(`if (typeof __filename !== 'undefined')`) to detect direct execution.

## The messaging substrate

The POCs proved two messaging primitives on the same DHT:

**RPC (1:1)** — request/response. A node serves a named service;
clients discover it by topic and route to it. AVRO-encoded over
protomux channels. The spl fabric's native pattern. (Phase 3.)

**Pub/sub (1:many)** — fan-out. Every member meshes (server + client);
one emits, the others receive. No hub. The event distribution pattern.
(Phase 4.)

Both coexist on the same connection via **protomux** — named channels
multiplexed on one encrypted stream. RPC, pub/sub, and drive
replication share the wire. (Phase 5.2.)

**Reactive dataflow** — a Hypercore log is appended to; a subscriber
live-tails it, processes, and emits to its own log — waking the next
subscriber. Push, not poll. Cascading transforms: source → transform
→ sink. The execution model heart. (Phase 6.)

## Git on the swarm

The p2p-git module (stripped isomorphic-git, plumbing only) runs under
bare as a JS library. Git operations are function calls, not shell-outs.
The Hyperdrive is the storage — git objects (blobs, trees, commits) map
naturally onto drive content. Refs are pointer files.

On the FUSE drive, p2p-git would sit at `/bin/p2p-git`. The user runs
git commands from the mount point:

```
cd /mnt/drive
./bin/p2p-git status
./bin/p2p-git commit -m "updated"
```

Git writes through FUSE. The bridgehead receives the write as a
`drive.put()`, signs it, replicates it. Git thinks it's writing to a
local filesystem. The bridgehead handles the P2P mechanics underneath.

This is where Mycelium's two paradigms meet on the filesystem surface:
git for mutable structure, Hypercore for immutable event streams, the
FUSE drive as the materialised view.

(Git integration is designed but deferred from the current POC round.)

## The world view

Each node maintains its own Hyperdrive — the **data world view**. Not
the circle's shared content drive, but a personal ledger of what this
node knows and has done.

The node publishes its state as files: `status.json` (identity, uptime,
peer count), `peers.json` (connected peers), `runs/` (app execution
history). Both the API and the FUSE mount expose the same view. An app
that needs circle awareness reads these files — it doesn't query the
swarm directly.

The world view is the visibility layer. The schema will evolve (it's
ad-hoc in the POC), but the pattern is settled: the node makes its
state legible as files on a drive. The same mechanism that carries apps
carries observability.

## The actor's local machine

An actor participates in multiple circles. Each circle is a container
on their machine — a bridgehead. The actor's local environment is
where the circles meet.

```
~/circles/
  project-alpha/        — FUSE mount from circle "project-alpha"
    drive/              — shared content
    world/              — this node's world view
  knowledge-base/       — FUSE mount from circle "knowledge-base"
    drive/
    world/
  tools/                — FUSE mount from circle "tools"
    drive/
    world/
```

Each circle is autonomous — its own swarm, its own trust domain, its
own container. The actor sees across their circles because the FUSE
mounts sit side by side on their filesystem. The local machine is the
integration layer, not a super-swarm. Each circle stays independent;
the actor is the bridge.

An app in one circle can read files from another circle's mount — the
filesystem makes cross-circle access natural, mediated by the actor's
local permissions, not by swarm mechanics.

## Security

The architecture produces a natural security boundary:

- **The bridgehead is the trust boundary.** The signing key never leaves
  the node process. Apps say "put this here" — the bridgehead signs it.
- **Boundary validation.** Writes through FUSE and the API pass through
  handlers the bridgehead controls. Content validation, permission
  checks, schema enforcement — all possible at the boundary.
- **Container hardening.** The POC uses `privileged: true` for FUSE.
  Production scopes to `SYS_ADMIN` + `/dev/fuse`. Further: minimal
  image, no shell, read-only root, dropped capabilities, non-root user,
  secrets injected at runtime, signed images.
- **Air gap.** The container's swarm connectivity is isolated from the
  host. The FUSE drive and API are the only surfaces. Local apps can't
  reach the swarm directly — they go through the bridgehead.
- **Circle isolation.** Each circle is its own container, its own keys,
  its own network. A compromise in one circle doesn't reach the others.
  The actor's local machine is the only place they coexist.

## Joining a circle

The experience from the actor's perspective:

1. `docker compose up` — the bridgehead starts, joins the circle's
   swarm, replicates the content drive, mounts FUSE, starts the API.
2. Browse `http://localhost:8080` — dashboard with drive browser, apps,
   status, world view. Or `ls /mnt/drive/` from the terminal.
3. Run an app — click Run in the browser, or
   `/mnt/drive/bin/bare /mnt/drive/apps/hello.js` from the command line.
4. Write to the drive — results, config, whatever. It replicates.

No install beyond Docker. No configuration beyond the compose file. The
circle membership is the container; the user interface is the filesystem.

## What carries forward

The POCs are the **developmental journey** — committed with their full
iterative path. What graduates to spl7 is the settled architecture and
the proven primitives, not the POC code:

- The bridgehead pattern (container-as-membership-manager)
- The FUSE Hyperdrive as the universal interface (read-write, overlays)
- The two-tier execution model (container-side / host-side)
- The world view drive (per-node visibility as files)
- The security model (bridgehead trust boundary, filesystem as the gate)
- The messaging primitives (RPC, pub/sub, reactive dataflow)
- The Mycelium design (git + kafka on Hyperdrive, XPath/URI addressing)
- p2p-git as a JS library under bare
- Code mobility via signed drives
- The vocabulary: actor → circles → bridgeheads → components

These compose into the infrastructure for Mycelium's native P2P
realisation — the subject of spl7.
