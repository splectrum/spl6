# Project State

Snapshot of where the work stands. Update at commit points
when the state shifts. Reflects current reality, not history
— the git log is the history.

## Last session (2026-06-02) — exploratory POC phase closed; Mycelium direction settled

Built the rest of the managed-code phase and the reactive core, and turned a
run of design discussions into a settled native-Mycelium design.

- **POCs built:** phase-5 managed code distribution (5.0 signed-drive code
  distribution → 5.1 data-driven assignment manifest → 5.2 protomux connection
  substrate + multi-role-per-worker → 5.3 worker identity + connect-by-key), and
  **phase-6 reactive dataflow** (the execution-model heart). Four+ committed probes:
  `hyperdrive-replicate-under-bare`, `avsc-rpc-on-protomux`, `connect-by-key`,
  `isomorphic-git-under-bare`, `reactive-core`.
- **Key findings:** protomux is the connection substrate (many handlers = named
  channels); connect-by-key is the base management op; **isomorphic-git runs under
  Bare unmodified — no fork** (the biggest unknown, downgraded); the reactive core
  (live-tail → react → emit, cascade) works; RocksDB is the storage floor (bundled
  in Pear; libatomic is distroless-only).
- **Decided/designed:** Chapter 4 reframed from "transport swap" → **native Mycelium
  design + build** (re-seat spl's core onto the substrate, Round 3, fs/TCP as oracle).
  New living docs: `plan/p2p-building-blocks.md` (the primitive catalogue) and
  `plan/mycelium-streaming-layer.md` (execution model — three cadence tiers, git/log
  mutability boundary, commit-broadcast, merge rule, availability schemes). CLAUDE.md
  mission updated.
- **Net:** every load-bearing primitive is proven under Bare; the exploratory POC
  phase is **complete**. Next is the Mycelium build (Round 3), not more POCs.

## Working end-to-end

Carried forward from spl5 (Chapter 1 migration), running on TCP:

- 6 URI protocols (raw/data/metadata × get/put/remove)
- 6 schema-aware protocols (type resolution, into-file navigation)
- lib/git + spl.mycelium.git (status, log, diff, add, commit, push, pull, subtree ops)
- lib/rpc-server (server lifecycle, PID, IPC, logging)
- Two-reality model, multi-client identity, CLI context aliases
- Help handler (spl.mycelium.process.help) with doc.md prose + schema-doc shape + children listing (any family node renders as an index)
- Every namespace node has doc.md — tree is fully self-navigable
- CLI global flag framework (--help functional; --async, --json stubbed)
- Test suite: 73 tests passing (lib/git 19, lib/rpc-server 18, xpath 18, git 11, process/help 7)
- 5 subtrees re-registered (avsc, avsc-rpc, git, rpc-server; _test → splectrum/spl6.test)

## Settled conventions

### Operator shape

`spl.data.stream.operator` is `{args: bytes[], returns: bytes[]}` — bulk by
default. args = input (one element per invocation), returns = output.
Execute envelope is `{mode, root}` only. Handlers currently consume args[0]
for single-invocation flows; multi-element bulk flows arrive when a
handler needs them.

### Per-handler input schemas

Each handler directory may carry an `input.avsc` (sibling to `index.js`,
`doc.md`). This describes one invocation's input record. Fields with
`position: "key"` route to the stream record key (fabric address);
other fields become the AVRO-encoded args record. CLI reads input.avsc
and maps CLI positionals to schema fields in declaration order; handler
decodes args[0] against the non-key fields of its own schema.

The generic operator is no longer a semantic placeholder — it's the wire
format only. Per-handler shape comes from input.avsc.

Migrated so far (24 handlers): git.commit / git.add / git.subtree.*
(register / add / push / pull), all xpath operations (raw/data/metadata
× get/put/remove × uri/schema-aware, 18 handlers), process.help.

Not migrated (and may not need it): git.status, git.log, git.diff,
git.push, git.pull, git.subtree.list, process.dispatch, process.execute —
each has either no input or inputs derived from execution context.

### Help system

Schemas own shape (doc fields populated). doc.md owns prose — YAML
frontmatter with `summary`, markdown body. One doc.md per namespace node,
recursive. Help composes by walking root → target collecting ancestor
summaries, reading target doc.md + schema.avsc doc. Help's target is the
stream record key (namespace path = fabric address for help).

### CLI global flags

Flag registry with three action kinds: rewrite / exec / client. Flag
extraction pass before argv parsing, apply pass after. Extend by adding
entries to `flagRegistry` in spl/avsc-rpc/cli/index.js.

## In progress

**Chapter 3 — P2P transport POCs (active).** Round 1 dev cluster in
`poc/p2p-docker-dev` (subtree → `pear-full-square/p2p-docker-dev`), one
self-contained folder per phase + a top README (product + journey). Built &
runnable: phase-0 (node + one structured event stream), phase-1 (peers connect on
a private DHT; `firewalled:false` direct connect — holepunch is for NAT traversal
and fails on a no-NAT bridge), phase-2 (avsc-rpc over the encrypted stream via
`createChannel(conn)`, the same call spl uses on TCP), phase-3 (roles & routing,
name→topic→peer, multi-peer + no-peer fallback, thin observability emitter),
phase-4 (pub/sub mesh — the 1:many contrast to RPC), phase-5 (managed code
distribution, 5.0: a manager seeds role-code into a **signed Hyperdrive**; a generic
worker replicates it by the **trusted key**, pulls + runs the role; a client calls it
— proving the worker runs distributed code. First use of the storage stack;
**trust = a signed key** intrinsic, deterministic from `CLUSTER_SEED`. Two execution
pathways — `memory` (no OS disk, the **Pear-native** target) and `checkout` (`bare-fs`
+ `require`, the deliberate **bridge to non-P2P** for testing/hybrid); both proven.
Design aim: Pear-native is the final model, checkout a first-class escape hatch.
5.1: placement is **data-driven** — the manager seeds multiple roles + a signed
`assignments.json`; workers self-assign by reading the manifest off the drive, not
from argv. 5.2: the connection moves to **protomux** — replication + each role's RPC
as **named channels** on one connection (`store.replicate(conn)` + `Protomux.from(conn)`),
which kills the `info.topics` hack and **unlocks multi-role-per-worker**. 5.3: each
worker has a **keyed identity** (`H(CLUSTER_SEED‖name)` → `DHT.keyPair`; seed never
leaves the manager), the manager seeds a signed **registry** `name → {key, roles}`,
and a client targets a *specific* worker via **connect-by-key** (`swarm.joinPeer`) —
both workers run echo, only the targeted one serves. Both addressing modes
(service-addressed, identity-addressed) now exist as building blocks. **phase-6** —
the execution-model **heart**, proven (probe `reactive-core`): live-tail a log →
react → emit, a cascade (source→transform→sink); `createReadStream({live})` is pushed
not polled, cursor = `contiguousLength`. Subsumes live-reassignment. **Framing:** the
round's deliverable is a *catalogue of swarm primitives for structure* — living map
`plan/p2p-building-blocks.md` (primitives × build/run/manage, proven/open). Committed
probes (scrubbed): `hyperdrive-replicate-under-bare`, `avsc-rpc-on-protomux`,
`connect-by-key`, `isomorphic-git-under-bare`, `reactive-core`. **The exploratory POC
phase is complete** — every load-bearing primitive (identity + connect-by-key,
protomux multi-channel, replication, code mobility, native git, reactive dataflow) is
proven under Bare. Next move is the **Mycelium build (Round 3)** — spl's fabric
composed from these, validated against the fs/TCP oracle — not more POCs; remaining
open cells are build-it-when-needed or deferred. `scrub.sh` log-masking,
`.env`-parameterised config. Programme: `plan/p2p-poc-roadmap.md`; building blocks:
`plan/p2p-building-blocks.md`; working list: `plan/tasks.md`.

**Direction (pivot, recorded) — native P2P Mycelium that unifies the substrates.**
Gear toward designing & implementing Mycelium **natively P2P on the log family**
(not just a transport swap under the fs/TCP fabric), because it **naturally unifies
the language substrates**: Kafka = the log, AVRO = record encoding, Git = the
version layer, URI/XPath = addressing, filesystem = a derived checkout. So
`streaming-fabric.md` is now the **Mycelium direction**, not just input to Platform.
It holds: log-as-substrate; Kafka↔Hypercore (single-writer + Autobase, no
consensus); storage model = native log family with the OS filesystem as a
git-mirrored checkout (a Hyperdrive cache over the git object store, tested vs plain
`.git`); cascading-references composition; the *minimal-base / open-implementations*
principle. `observability-design.md` — graduated two-tier instrumentation; thin
emitter built in phase-3. Roadmap invariant: the application owns all runtime code.
**`mycelium-streaming-layer.md`** (new) is the **execution-model companion** to
`streaming-fabric.md` (storage): reactive dataflow over logs; three cadence tiers
(git commit/push = slow durable heartbeat, data-change-event streams = the working
cadence, RPC = the fast minority); local code DNA; commit-broadcast as the worked
example; the git/log boundary by mutability (immutable records → log, mutable
structure/code/references → git); merge decision rule (judgment → git 3-way + AI +
tests-on-commit; determinism → Autobase). **This design pair replaces the old
"Chapter 4 = transport swap" framing** — P2P is a substrate that reshapes the server
model, storage and addressing, not a pipe; spl's *conceptual* core carries forward,
the substrate-facing layer is redesigned. **Discipline:** the fs/TCP spl6 build stays
the working **oracle**; the native P2P Mycelium grows alongside and is validated
against it (Round 3 → Platform).

**Chapter 2 — Documentation (splectrum.world Infrastructure hub).** Substantially
built: landing + three headings (Holepunch / In House / Ecosystem); Holepunch =
Bare + the synthesised P2P building-block stack; Ecosystem = a curated survey.
Authored as prompt docs here, rendered in the-world-of-splectrum. Doc model in
`.claude/rules/conventions.md` (synthesise + agentic freshness check; write for
the AI reader; prompts carry content + structure only). Deferred / POC-gated: the
Pear page, pear-full-square write-ups, the barification cookbook, the
doc-freshness-agent stand-up.

Code baseline unchanged — Chapter 1 migration end-state, 73 tests green on TCP.

## Next up

Chapter sequence (living plan: `plan/README.md`):

1. **Chapter 2 — Documentation.** Infrastructure hub on splectrum.world
   substantially complete (the Holepunch stack + Ecosystem — see *In
   progress*). What's left is POC-gated (Pear page; pear-full-square; the
   barification cookbook) or optional now (stand up the doc-freshness
   agent). Platform/Mycelium remains the separate Ch5–7 sequence.
2. **Chapter 3 — P2P transport POCs (active).** Round 1 dev cluster: phases
   0–4 + phase-5 (managed code) built through 5.3 — see *In progress*. The
   POCs exercised the full building-block set (`plan/p2p-building-blocks.md`)
   and surfaced the core decisions now captured in the Mycelium design pair.
   Remaining: a few management cells, then Round 2 (script test rig) and
   Round 3 (spl on the cluster). Detail: `plan/p2p-poc-roadmap.md`.
3. **Chapter 4 — native Mycelium design + build (was: transport swap).** Not a
   pipe-swap (already proven in phase-2) but **re-seating spl's proven core onto
   the P2P substrate**: dispatch-as-channels, storage-as-log, distribution-as-drives,
   `spl-server` → keyed `spl-peer`. Designed in `plan/mycelium-streaming-layer.md`
   + `plan/streaming-fabric.md`; first realised in **Round 3**, validated against
   the fs/TCP oracle. Enabling threads: the commit-broadcast concept POC and the
   isomorphic-git-under-Bare probe.
4. **Chapters 5–7 — Platform.** Design review (ground vision in
   integrated code + POC insights; distil the mature pillar; resolve
   client-server resolution + code-grounding) → documentation (render
   the settled design on splectrum.world; carries the spl5→spl6
   retrospective) → implementation (realise it). Deferred to here
   deliberately: Platform is the most transport-entangled layer.
   Direction set (pivot): a **native P2P Mycelium on the log substrate that
   unifies the language substrates** — the review *realises* this (inheriting
   `plan/streaming-fabric.md`'s storage model, the observability model, and the
   minimal-base / open-implementations principle), rather than re-deriving the
   pillar from scratch.
5. **Chapter 8 — Infrastructure.** Private swarm, HiveRelay,
   git-on-Hyperdrive (git-over-P2P / repos-as-Hyperdrives — elaborated in
   `plan/streaming-fabric.md`) — production infra, last.

### Carried-over backlog (spl5-era, still valid)

Lower priority than the chapter sequence; revisit when pressure surfaces.

1. **Harness as direct RPC client** (pressure-point item, not yet urgent).
   Extract `spl/avsc-rpc/client/` from CLI; make harness a direct client
   using it. Reason: multi-client identity already treats tests as a
   client; subprocess-fork-per-test gets expensive as the suite grows.
   Pressure signals: suite slow to run, assertions needing richer access
   to the onion than JSON gives, CLI churn breaking unrelated tests.
2. **Context stream types** — registration layer for protocol availability
   per node. Follows alias-mapping / stream-type work.
3. **Test runner auto-start/stop** — runner owns spl-server lifecycle so
   `bin/spl-test` works from a cold environment.
4. **CLI help rendering** — today `spl help X` dumps raw JSON. A minimal
   renderer (summary + context breadcrumb + children list + inputs table)
   would make the system genuinely self-documenting at the terminal.
