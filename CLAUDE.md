# CLAUDE.md — Splectrum (spl6)

## What This Is

Splectrum is a framework at the intersection of
philosophy of language, systems theory, and software
engineering. Three fabrics: Mycelium (data fabric),
Splectrum (language fabric), HAICC (cognition fabric).

Philosophy drives engineering. The seed principles
(P0-P5) ground all design decisions.

## Documentation

splectrum.world is the public site for SPLectrum philosophy and
engineering work. Repo: `splectrum/the-world-of-splectrum`
(`~/splectrum/the-world-of-splectrum`); site files in `docs/`.

spl6's Chapter 2 produces **prompt docs** for that repo to create/update
pages — it has its own editorial process, so we don't edit the site
pages directly from here.

## Mission

spl6 carries spl5's proven mycelium fabric onto P2P
infrastructure. spl5 proved the fabric end-to-end on
local TCP RPC — stream record, namespace-as-filesystem
dispatch, pack-at-boundary, handler contracts, input
schemas, help system. Those concepts are transport-
independent. spl6 takes them toward Hyperswarm/HyperDHT
and pear-runtime: same protocol, data model, and handler
contract, a different pipe underneath.

Not a rewrite — a transport swap under proven patterns.

The living plan and chapter sequence is in `plan/`
(start at `plan/README.md`). The original seed plan is
frozen at `initialise/plan.md`.

## Current State

Chapter 1 (initialisation) — **migration complete**. The
proven fabric is carried forward like-for-like and runs
on the existing TCP transport. 73 tests pass.

Sequence ahead: Chapter 2 (documentation), then
Chapter 3 (P2P transport POCs — prove AVRO-over-Hyperswarm
in isolation), then Chapter 4 (integrate the swarm
transport into spl). The TCP path stays as the local-dev
transport; Hyperswarm is added, not substituted, until it
is proven.

## How We Work

- **Entity:** Any participant. Human, AI, process.
- **Maximum beneficial autonomy:** If the system can
  do it, it should.
- **Technology decisions are AI's domain.** Decide.
- **Build, don't plan endlessly.** If wrong, fix it.
- **Migrate before changing.** When carrying code forward,
  import like-for-like first and get a green baseline;
  make changes as deliberate, separate steps.
- **Philosophy first.** Engineering follows from the
  seed principles.
- **KISS.** Simplest mechanism that serves the purpose.
- **Engineering as conversation.** Natural language at
  the interaction level, rigid implementation beneath.
  Keep the human in the loop on direction.
- **Ask in prose.** Pose open questions in the
  conversation — no multiple-choice / option-picker
  questions.
- **Agree the approach before acting.** Discuss and
  confirm before starting any agent, background process,
  or outward/cross-repo action. A question about whether
  something is *possible* is not authorization to *do*
  it — get an explicit go on the specifics first.

## Memory

This file (CLAUDE.md) is the single, in-repo memory —
kept lean. No out-of-repo memory bank. As it grows,
offload detail into other repo files (e.g.
`.claude/rules/`) and keep CLAUDE.md as the lean entry
point. Every repo operates this way for collaborative AI.

## Autonomy Target

Physical fully AI autonomous — structure, code,
environments, testing, deployment. Logical interactive
collaborative — scope, meaning, design, direction.

## Codebase Structure

Namespace-mapped layout. Directory = namespace node.
`index.js` = code for that name. Other files =
auxiliary. Schema directories use `schema.avsc`.

```
spl/                  — spl namespace root (lib/spl symlink)
  avsc-rpc/           — spl.avsc.rpc (RPC layer)
    protocol.js       — RPC protocol definition
    display.js        — human-readable rendering
    server/index.js   — thin protocol layer on lib/rpc-server (TCP)
    cli/index.js      — CLI client, multi-client identity
  mycelium/           — spl.mycelium (fabric)
    runtime.js        — Bare runtime essentials
    resolve.js        — repo root resolution
    schema.js         — schema loader + helpers
    process/          — spl.mycelium.process
      dispatch/index.js — namespace-path handler resolution
      execute/index.js  — execution context, response type packing
      help/index.js     — help composition (doc.md + schema + ancestors)
    xpath/            — spl.mycelium.xpath
      helpers.js        — schema resolution, into-file navigation
      raw/              — raw visibility + schema aware
      data/             — data visibility (hides _) + schema aware
      metadata/         — metadata visibility + schema aware
      raw/uri/          — raw URI (no schema)
      data/uri/         — data URI
      metadata/uri/     — metadata URI
    git/              — spl.mycelium.git
      status/           — git status (two-reality)
      log/              — git log
      diff/             — git diff
      add/              — git add
      commit/           — git commit
      push/             — git push (subtree-aware)
      pull/             — git pull (subtree-aware)
      subtree/          — subtree management
        list/ register/ pull/ push/ add/

_schema/              — local schema registry (metadata)
  alias-mapping.txt   — stream type → data schema
  uri-schema.txt      — URI → schema (for schema-aware xpath)
  spl/data/           — AVRO data schemas
    stream/             — stream record, descriptor, operator
    mycelium/process/   — execute context, help
    mycelium/xpath/     — node record
    mycelium/git/       — status, log, diff, subtree

_client/              — default client identity
  context.txt         — command → stream type mapping
_test/                — test framework (subtree: splectrum/spl6.test)
  _client/context.txt — test client identity
  suites/             — test suite files
  resources/          — test fixtures
  harness.js          — spl executor + assertions
  runner.js           — suite loader + reporter
_server/              — server instance (pid, logs, cmd/) — gitignored
.gittrees             — subtree prefix → remote → branch

bin/                  — entry points
  spl                 — global CLI (~/.local/bin/spl)
  spl-server          — TCP RPC server
  spl-test            — test runner
  setup               — platform deps installer

lib/                  — dependencies
  avsc/              — AVRO types (subtree: bare-for-pear/avsc)
  avsc-rpc/          — AVRO RPC (subtree: bare-for-pear/avsc-rpc)
  git/               — git operations (subtree: bare-for-pear/git)
  rpc-server/        — TCP server lifecycle, PID, IPC, logging (subtree: bare-for-pear/rpc-server)
  spl -> ../spl      — namespace require symlink
  bare-*/            — platform deps (gitignored)
```

- **Bare only** — no Node.js, no dual-runtime
- **node_modules → lib/** symlink for all module resolution
- **bin/spl** — global CLI, symlinked to ~/.local/bin
- **bin/spl-server** — TCP RPC server, system service. Stop it by
  dropping an empty `shutdown` file into `_server/cmd/` (graceful);
  don't kill PIDs.
- **bin/setup** — populates platform deps from npm

## What Works

Carried forward from spl5, running on TCP:

- AVRO RPC server + CLI over TCP on Bare
- lib/rpc-server: server lifecycle (start/stop/restart),
  PID file, file-based command IPC (_server/cmd/),
  request logging
- Stream record with resolved descriptor union in headers
- Dispatch from namespace path (no registration)
- Execute handler: peel onion, pack at boundary
- Response type header for non-NodeRecord schemas
- 6 URI protocols: raw/data/metadata × get/put/remove
  (visibility filtering, no schema interpretation)
- 6 schema-aware protocols: raw/data/metadata × get/put/remove
  (type resolution: schema → extension → binary,
  into-file JSON navigation via xpath addressing)
- lib/git: git operations module (status, log, diff,
  add, commit, push, pull, subtree management)
- spl.mycelium.git: thin protocol handlers on lib/git
- Two-reality model: repo vs subtree based on local root
- .gittrees: subtree prefix → remote → branch mapping
- Multi-client identity: _<name>/_client/context.txt
- CLI context aliases with modifiers (raw, meta)
- Help system (spl.mycelium.process.help): doc.md prose +
  schema-doc shape + ancestor context + children listing
- CLI global flag framework (--help functional)
- Test framework: 73 tests, module-organized suites
  (lib/git 19, lib/rpc-server 18, xpath 18, git 11,
  process/help 7)
- 5 subtrees registered (avsc, avsc-rpc, git, rpc-server, _test)
- lib/git: remote management + configurable platform
  (GitHub default, pluggable)

## Key Principles

- Pack at boundary only — plain objects in memory, AVRO
  at RPC/onion crossings
- Read with fallback — try schema decode, fall back to
  plain object if already unpacked
- / means local root, paths resolve forward only
- Handlers are thin — infrastructure in lib/, protocol
  in spl/. Same pattern for git, rpc-server
- Client owns its language — context mappings translate
  to stream types. Identity travels with subject reality
- Two key/value shapes, one role each:
  - Stream record / xpath node: `key + value + headers`
    — fabric storage & addressing
  - Operator: `args + returns` — function I/O. Both are
    arrays (bulk by default). Single invocation is one
    args element; fan-out / filter / reduce are native.
    Handler input shape is defined by the handler, like
    a function signature

## Key Design Decisions

- Stream descriptor: { type } only — zero-cost dispatch
- Dual header entry: descriptor (base) + type-specific
  entry (mode, root, etc.)
- Handler contract: handler(record) → record. No
  dispatch arg. Orchestration in orchestrator types.
- Dispatch from namespace path: no registration.
  require(spl/path/to/handler)
- One function per module export
- spl/ root directory for all spl namespace code
- Execution context: root.repo = absolute filesystem
  path, root.local = /segment/path from repo root
- Node record: { type, created, modified, value:
  { type, length, contents } }. Metadata structured,
  content opaque bytes.
- Pack at boundary: plain objects in memory, AVRO
  serialization at RPC/onion boundaries only
- Schema directory convention: name/schema.avsc
  (matches code: name/index.js)
- No JSON serialization — AVRO is the wire format
