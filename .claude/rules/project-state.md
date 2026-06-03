# Project State

Snapshot of where the work stands. Update at commit points
when the state shifts. Reflects current reality, not history
— the git log is the history.

## Last session (2026-06-03) — Mycelium design (Chapter 4) + doc rework started

Proper Mycelium design session: data layer design, vocabulary, documentation
structure, substrate page rework. spl6 reframed to close after Mycelium design +
POC.

- **spl6 reframed.** Chapters 4–8 replaced by: Ch4 Mycelium design, Ch5 Mycelium
  POC. spl6 closes after Ch5. The build-out (Platform implementation, infrastructure,
  production) is the next project. Plan/README.md and tasks.md updated.
- **Mycelium design (Round 1) drafted.** `plan/mycelium-design.md` — the data layer
  at the physical level (opaque bytes). Key decisions settled:
  - **Mycelium is a hybrid between the git and kafka paradigms.** Git for mutable
    structure; kafka for immutable data change event streams. Both P2P-native on
    Hypercore/Hyperdrive.
  - **No filesystem in the native path.** Git objects on Hyperdrive + Hypercore logs
    are the two native data structures. The filesystem is an external bridge only.
  - **XPath navigates git tree/blob objects directly** — latest commit tree or the
    index. No filesystem traversal.
  - **Tracked/committed replaces dirty.** Changes go straight into git objects (blob +
    index via plumbing API). Commit is the quality gate.
  - **Git without packfiles.** Loose objects only on Hyperdrive. RocksDB handles
    compression.
  - **isomorphic-git plumbing API** as the primary interface (writeBlob, readTree,
    etc.). No porcelain in the native path. Three implementations via pluggable fs:
    P2P native (partial, for Mycelium), standard-compatible P2P (Hyperdrive fs,
    full porcelain), standard on bare-fs (oracle).
  - **The Kafka record** (key + value + headers) is the native record shape on
    Hypercore topics. Headers are an extensible metadata surface (provenance, lineage,
    visibility). Visibility rides the headers, no separate streams.
  - **Data state propagation** is the one interaction mode — it just happens (subscribe
    → see changes). Two cadences: git commit (structural, quality-gated) and data
    change events (atomic, the working cadence). Direct protocol invocation is a
    SPLectrum concern, not Mycelium.
  - **Topic references** replace the old reference model. One mechanism for all
    external data dependencies.
  - **Recursive composition**: parent repo registers child repos (git-ignored, own
    data owner). Registration node = child's repo root.
  - **Vocabulary settled**: seed-grounded (data entity, data owner, data state, data
    world, protocol, operator). Extended for P2P (topic, topic reference, peer).
- **Documentation rework started.** Substrate pages (git, kafka) drafted as "our
  brand" — what we adopt, what we simplify, where each concern lives (substrate /
  Mycelium / infrastructure). Mycelium overview (bullet-point map). First-pass
  Mycelium concept pages (index, fabric, xpath) written but need rethinking —
  jumped to writing before proper discussion.
- **URI constraints captured** (not yet on a page): no trailing slash, no protocol
  prefixes, forward-only from local root, path rebases on context switch, underscore
  prefix = metadata dimension, registered child repo root = registration node.
- **Design principle noted**: aggressive simplification ("Musk style") — remove what
  we don't need, push concerns to where they belong. Decentralisation in design.

## Working end-to-end

Carried forward from spl5 (Chapter 1 migration), running on TCP:

- 6 URI protocols (raw/data/metadata × get/put/remove)
- 6 schema-aware protocols (type resolution, into-file navigation)
- lib/git + spl.mycelium.git (status, log, diff, add, commit, push, pull, subtree ops)
- lib/rpc-server (server lifecycle, PID, IPC, logging)
- Two-reality model, multi-client identity, CLI context aliases
- Help handler (spl.mycelium.process.help) with doc.md prose + schema-doc shape +
  children listing
- CLI global flag framework (--help functional; --async, --json stubbed)
- Test suite: 73 tests passing
- 5 subtrees re-registered

## Settled conventions

### Operator shape

`spl.data.stream.operator` is `{args: bytes[], returns: bytes[]}` — bulk by
default. Execute envelope is `{mode, root}` only.

### Per-handler input schemas

Each handler directory may carry an `input.avsc`. Fields with `position: "key"`
route to the stream record key; other fields become the args record.

### Help system

Schemas own shape. doc.md owns prose. One doc.md per namespace node, recursive.
Help composes by walking root → target.

### CLI global flags

Flag registry with three action kinds: rewrite / exec / client.

## In progress

**Chapter 4 — Mycelium design (active).** Round 1 (opaque bytes) data layer design
drafted (`plan/mycelium-design.md`). Documentation rework in progress: substrate
pages for git and kafka drafted; Mycelium overview drafted; first-pass concept pages
need rethinking. Next: URI/addressing substrate, the Mycelium pages (lean — how the
substrate languages blend), then POC roadmap for infrastructure modules (git first).

**Documentation structure clarified.** Three documentation levels:
- **Language substrate** — our brand of each paradigm (what we adopt/simplify)
- **Mycelium (Platform)** — how the paradigms blend in the fabric
- **Infrastructure modules** — the implementations (P2P native git, standard P2P git,
  Hypercore topics, etc.)

Code baseline unchanged — Chapter 1 migration end-state, 73 tests green on TCP.

## Next up

1. **Chapter 4 — Mycelium design (continuing).** Complete the substrate pages
   (URI/addressing). Write lean Mycelium pages (how git+kafka blend, the
   data/metadata structure, XPath navigation). Then POC roadmap for infrastructure
   modules — git first (the plumbing wrapper, Hyperdrive adapter).
2. **Chapter 5 — Mycelium POC.** Prove the design. Scope shaped by the design +
   POC roadmap.
3. **spl6 closes** after Chapter 5.

### Carried-over backlog (spl5-era, still valid)

Lower priority; revisit when pressure surfaces.

1. Harness as direct RPC client
2. Context stream types
3. Test runner auto-start/stop
4. CLI help rendering
