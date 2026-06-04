# Distributed drive — first Mycelium application concept

Working notes from the design conversation. The distributed drive as the
first real Mycelium application: dog-fooding the fabric to build useful
infrastructure.

## The concept

A FUSE-mountable P2P distributed drive with placement control — three
copies of every block, pinned to specific regions/peers across the swarm.
Built AS a Mycelium data owner, not as standalone infrastructure.

**The drive is a git repo** with:
- Configuration in git (placement policy, peer registry, retention rules)
- State changes as git commits (the durable heartbeat)
- Data on Hypercore topics (the actual blocks + replication events)
- Colocated functionality (retention controller, repair loop, FUSE mount)
- Topic references for replication relationships

**Two cadences operating naturally:**
- Git commits for configuration changes (placement updated, peer added)
- Data change events for block-level activity (replication, health, repair)

**FUSE mount as the access layer** — any tool interacts with P2P-replicated
data as if it were a local disk. Hyperdrive already has the operations; a
FUSE adapter maps OS calls to them. `fuse-native` exists for Bare.
Holepunch had `hyperdrive-fuse` for earlier versions — concept proven.

## The AVRO pattern — three-piece separation

The drive exercises the question: where does AVRO earn its keep?

**Three pieces, cleanly separated:**
- **AVRO schema** (in the repo) — the interface. What goes in, comes out,
  and the semantic meaning. The stable contract.
- **Handler code** (in the repo or distributed) — the implementation.
- **P2P register** (separate from the repo) — the binding. Maps schema →
  handler. The control point.

**The register is not the repo.** Same repo, different register = different
execution. This enables:
- Code evolution without repo changes (update the register)
- Test register vs production register (same data, different handlers)
- Rollback = point register back to old handler
- Schema evolution and code evolution are independent

**Internally: large atomic AVRO-backed units** — substantial operations
(create drive, set placement, add peer, query health), each with a clear
schema. Not recursive decomposition into small AVRO-backed pieces. The
fine-grained code behind them is just code.

**The boundary:** would someone external (another data owner, an agent)
need a formal contract? → AVRO. Internal implementation? → code.
Keep a level of AVRO internally too (large atomic units) for managing
code evolution via the register.

## P2P design difference

Swarm-wide availability plus privacy. In P2P, data is available across
the swarm (all peers can potentially access it) while simultaneously
private (signed keys, cryptographic verification, no central authority
that can be compelled). This combination doesn't exist in centralised
architectures and changes fundamental design assumptions about access
control, replication, and trust.

## Joining a swarm = mounting a drive

The FUSE mount is the single entry point to a swarm. Mount the drive,
you're in. No setup, no configuration, no service discovery, no account
creation. One action.

Multiple swarms = multiple mounted drives. Each its own trust domain, its
own data world, its own set of data owners. Switch between them like
switching between disks.

Within each swarm, specific shared resources serve swarm-specific
concerns — shared platform code (read-only), per-node workspaces
(writable), shared data (via topic references).

The FUSE drive is a SPLectrum component — reusable, documentable,
the visible face of the platform to the user.

## Tool mounting and the spl prefix

Any tool that operates on data can be mounted on the fabric and fronted
with `spl <namespace>`. The tool's operations become handlers in the
namespace tree, the data lives on Hyperdrive/Hypercore, the spl CLI
dispatches. The tool's entire knowledge base (docs, community, training
data) stays intact — `spl git` is git, `spl xpath` is XPath.

The user who knows the tool knows the `spl` version. The AI agent who
knows the tool knows the `spl` version. The P2P substrate is invisible
to both — same operations, same concepts, same vocabulary.

## What it exercises

The distributed drive exercises the full roadmap:
- Git component (configuration management, quality-gated state changes)
- Hypercore topics (data blocks, replication events)
- XPath (navigate drive structure and configuration)
- FUSE mount (external access)
- The AVRO pattern (where it earns its keep vs ceremony)
- Retention/availability (the placement controller)
- Swarm-wide availability + privacy
