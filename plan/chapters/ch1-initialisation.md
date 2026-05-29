# Chapter 1 — Initialisation

**Status: ✅ complete (2026-05-29).** Pure migration of spl5 onto a
fresh spl6 repo, plus spl6 identity/docs. 73 tests green on TCP.
Commits: `91849c2` (migration baseline), `3902f43` (plan scope fix +
spl6 identity/docs), `af536e1` (open questions).

Chapter 1 is a **pure migration** — carry the proven fabric forward
like-for-like on the known-good TCP path, no P2P changes. All P2P work
lives in Chapters 3 (POCs) and 4 (integration).

### 1.1 Carry forward proven code from spl5 ✅

Source: `/home/herma/splectrum/spl5` (archived). Copied as-is:
- `spl/` — the full namespace: mycelium fabric (all handlers, doc.md,
  input.avsc), the avsc-rpc protocol + display, and the TCP server/cli
- `_schema/` — all AVRO schemas, alias-mapping.txt
- `_client/` — default client identity
- `bin/` — entry points (spl, spl-server, spl-test, setup)

### 1.2 Re-register lib/ subtrees ✅

Subtrees carried forward (squashed):
- `lib/avsc` — bare-for-pear/avsc@master
- `lib/avsc-rpc` — bare-for-pear/avsc-rpc@main
- `lib/git` — bare-for-pear/git@main
- `lib/rpc-server` — bare-for-pear/rpc-server@main (retained — the TCP
  path stays the local-dev transport)
- `_test` — splectrum/spl6.test@main (new repo, seeded from spl5)

`lib/rpc-server` is dropped later (Chapter 4), once swarm lifecycle
replaces TCP lifecycle. Nothing replaces it before then, so it stays.

### 1.3 Transport stays TCP ✅

Chapter 1 keeps the existing TCP transport (`spl/avsc-rpc/server/` and
`spl/avsc-rpc/cli/`) unchanged. The Hyperswarm transport is proven in
isolation in Chapter 3 and integrated in Chapter 4; the new
dependencies (`hyperswarm`, `hyperdht`, `pear-runtime`) arrive with
that work, not here.

### 1.4 Entry points ✅

Carried forward unchanged: `bin/spl` (CLI, TCP), `bin/spl-server` (TCP
RPC server), `bin/spl-test`, `bin/setup`. The swarm-facing changes —
swarm connection, `spl-server` → `bin/spl-peer`, `setup` for new deps —
land in Chapter 4.

### 1.5 Project docs ✅

- `CLAUDE.md` reflecting spl6 mission and structure
- `.claude/rules/` (project-state, conventions)
- `initialise/` folder kept as the seed; living plan moved to `plan/`

### 1.6 Verify ✅

73 tests pass on the TCP transport path. Ready for POC work.
