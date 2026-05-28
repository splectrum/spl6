# CLAUDE.md — Splectrum (spl5)

## What This Is

Splectrum is a framework at the intersection of
philosophy of language, systems theory, and software
engineering. Three fabrics: Mycelium (data fabric),
Splectrum (language fabric), HAICC (cognition fabric).

Philosophy drives engineering. The seed principles
(P0-P5) ground all design decisions.

## Reference Library

The public reference library at
jules-tenbos.github.io/in-wonder/ is the living
engineering documentation. Source: ~/jules-tenbos/in-wonder.
One source of truth — don't keep copies elsewhere.

## Mission

spl5 is the prototyping iteration. Its mission is to
prove the mycelium fabric architecture end-to-end:
AVRO RPC server, Kafka-native stream record shape,
fabric APIs, CLI as subject, and the namespace/node
structure.

## How We Work

- **Entity:** Any participant. Human, AI, process.
- **Maximum beneficial autonomy:** If the system can
  do it, it should.
- **Technology decisions are AI's domain.** Decide.
- **Build, don't plan endlessly.** If wrong, fix it.
- **Philosophy first.** Engineering follows from the
  seed principles.
- **KISS.** Simplest mechanism that serves the purpose.
- **Engineering as conversation.** Natural language at
  the interaction level, rigid implementation beneath.

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
    server/index.js   — thin protocol layer on lib/rpc-server
    cli/index.js      — CLI client, multi-client identity
  mycelium/           — spl.mycelium (fabric)
    runtime.js        — Bare runtime essentials
    resolve.js        — repo root resolution
    schema.js         — schema loader + helpers
    process/          — spl.mycelium.process
      dispatch/index.js — namespace-path handler resolution
      execute/index.js  — execution context, response type packing
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
    mycelium/process/   — execute context
    mycelium/xpath/     — node record
    mycelium/git/       — status, log, diff, subtree

_client/              — default client identity
  context.txt         — command → stream type mapping
_test/                — test framework (subtree: spl5.test)
  _client/context.txt — test client identity
  suites/             — test suite files
  resources/          — test fixtures
  harness.js          — spl executor + assertions
  runner.js           — suite loader + reporter
_server/              — server instance (pid, logs, cmd/)
.gittrees             — subtree prefix → remote → branch

bin/                  — entry points
  spl                 — global CLI (~/.local/bin/spl)
  spl-server          — RPC server
  spl-test            — test runner
  setup               — platform deps installer

lib/                  — dependencies
  avsc/              — AVRO types (subtree: bare-for-pear/avsc)
  avsc-rpc/          — AVRO RPC (subtree: bare-for-pear/avsc-rpc)
  git/               — git operations (subtree: bare-for-pear/git)
  rpc-server/        — server lifecycle, PID, IPC, logging (subtree: bare-for-pear/rpc-server)
  spl -> ../spl      — namespace require symlink
  bare-*/            — platform deps (gitignored)

docs/                — DECISIONS.md, design submissions
```

- **Bare only** — no Node.js, no dual-runtime
- **node_modules → lib/** symlink for all module resolution
- **bin/spl** — global CLI, symlinked to ~/.local/bin
- **bin/spl-server** — RPC server, system service
- **bin/setup** — populates platform deps from npm

## What Works

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
- Test framework: 66 tests, module-organized suites
  (lib/git 19, lib/rpc-server 18, xpath 18, git 11)
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

## POC Sequence (complete)

1. ~~AVRO RPC server~~ ✓
2. ~~CLI submitting to server~~ ✓
3. ~~Stream record redesign~~ ✓
4. ~~rawuri get/put/remove~~ ✓
5. ~~datauri, metadatauri~~ ✓
6. ~~Schema-aware protocols (raw/data/metadata)~~ ✓
7. ~~Protocol resolution in cli.execute~~ ✓
8. ~~lib/git + spl.mycelium.git~~ ✓
9. ~~Test framework (spl5.test subtree)~~ ✓
10. ~~Multi-client identity~~ ✓

## Roadmap

### Next: schema review + help system

1. Review all existing AVRO schemas for completeness,
   add doc fields, fix missing information. The schemas
   are the source of truth — they need to be right before
   the help system reads from them.

2. help.json per handler directory describes inputs (name,
   type, position, doc). Help handler (spl.mycelium.process.help)
   reads these and returns structured help. CLI --help flag.

   Plan approved. Schema started (_schema/spl/data/mycelium/
   process/help/schema.avsc created). Implementation next.

   Phase 1: help handler, 5 representative help.json files,
   CLI --help flag. Phase 2: all ~35 help.json files, list
   mode. Phase 3: CLI reads help metadata to map positional
   args to named fields (spl git.commit "msg" just works).

### Then: context stream types

Context registration layer. Three mapping concerns:
1. Data schema (alias-mapping.txt — done)
2. Stream type (namespace dispatch — done)
3. Context type (protocol availability per node — roadmap)

Context aliases (spl.context.*) with colocated mappings.
Versioning as stream type internal concern.

### Identified improvements

- Test runner: auto-start/stop server for test runs

## Key Design Decisions

See docs/DECISIONS.md for full log. Key points:

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
