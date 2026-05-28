# Project State

Snapshot of where the work stands. Update at commit points
when the state shifts. Reflects current reality, not history
— the git log is the history.

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

Nothing mid-change. Chapter 1 migration is complete; the baseline is the
clean end-state.

## Next up

Chapter sequence (see `initialise/plan.md`):

1. **Chapter 2 — Documentation.** Documentation prompts written here,
   executed by the the-world-of-splectrum repo (in-wonder ref lib).
2. **Chapter 3 — P2P transport POCs.** Prove AVRO-over-Hyperswarm,
   namespace-to-topic mapping, multi-peer, pear-runtime updates — in
   isolation, outside spl, before any integration.
3. **Chapter 4 — spl6 integrations.** Bring the swarm transport into
   spl (single peer on DHT, topic registration, distributed dispatch,
   multi-peer, pear-runtime). TCP stays for local dev; `spl-server` →
   `spl-peer` and `lib/rpc-server` drop happen here.

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
