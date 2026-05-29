# Tool spec — doc-dispatch (agent-backed cross-repo authoring)

**Status:** candidate tool. First proving ground: Chapter 3 dispatch
POC (`../chapters/ch3-pocs.md` §3.2/§3.3). Integration target: Chapter
4 (`../chapters/ch4-integration.md` §4.3). Not built yet. Related:
`../open-questions/client-server-resolution.md`,
`../chapters/ch2-documentation.md`.

## Why

While setting up Chapter 2, we tried to have an agent rooted in `spl6`
write a documentation page directly into the sibling
`the-world-of-splectrum` repo. The sandbox refused the cross-repo
write.

That refusal *is* the design lesson: you don't reach into another
repo's reality directly — you dispatch a request to the peer that owns
it, and it acts in its own reality. The sandbox enforced exactly the
peer isolation the fabric is built on. So the documentation workflow —
"produce/update a page in the repo that owns the docs site, under that
repo's conventions" — is a natural spl operation, not an ad-hoc agent
launch.

## The pattern

- **input** — a stream record. `key` = the target (the page / namespace
  owned by some repo). `value` = the prompt/spec (what to write/update).
- **resolution** — find the peer that owns the target. This is the
  *named-target* generalisation of the client-server resolution
  question: the target need not be the caller's cwd; it's a named peer
  (here, the docs repo).
- **execution** — dispatch to that peer; it runs the work **in its own
  reality** — its `.claude/`, tone-of-voice, process, editorial
  pipeline — the executor being an AI agent.
- **output** — the artifact (a draft/submission) returned into the
  target repo's pipeline as a record; human review before publish.

## Handler shape

- `handler(record) → record`, unchanged.
- `key` = target namespace/page; `value` = prompt/spec (+ params).
- The implementation is an **AI agent** rather than a deterministic
  `lib/` function — a new flavour: **agent-backed handler**. The
  "library" it wraps is an AI process operating in the target repo's
  reality.
- Stays within pack-at-boundary: the prompt/spec is the record in; the
  agent's output is packed back as the record out.

## How it maps onto the architecture

- **Subject reality / two-reality:** the handler executes in the
  *target* repo's reality (its conventions, process), not the caller's.
  The doc repo is the subject.
- **Orchestrator types:** a dispatching handler — it may itself call
  sub-handlers (resolve target, fetch sources, write, check against
  tone-of-voice).
- **Peer = repo:** the target repo is a peer owning its namespace (the
  docs). "A handler is a key; the repo is a peer."
- **Client-server resolution:** doc-dispatch is the named-target form —
  resolve the peer that serves the target, dispatch there. Local form
  today (subprocess/agent in that repo); swarm form later (topic →
  peer).
- **Transport / permission boundary:** the sandbox/permission boundary
  between repos is the local stand-in for the peer boundary. Crossing
  it = dispatch + authorisation, not direct filesystem reach.

## Open considerations (for POC / spec maturation)

- **Agent-backed handler contract:** sync vs async; how an agent run
  becomes a deterministic-enough record; retries / idempotency.
- **Convention inheritance:** how the executor picks up the target
  repo's conventions (`.claude/`, tone-of-voice, process) — handler's
  job, or the peer's?
- **Authorisation:** how a dispatch is permitted to act in another
  repo's reality (today: explicit permission; later: peer auth).
- **Output discipline:** always produce a draft/submission into the
  pipeline for human review — never publish directly.
- **Grounding:** external research (web) availability in the executing
  context (the Chapter 2 attempt was also blocked from web).
- **Relationship to Chapter 2:** Chapter 2's "prompts written here,
  executed by the-world-of-splectrum" is the *manual* form of this
  tool. doc-dispatch is its automation — so Chapter 2 is also a live
  source of requirements for this spec.
