# Open question — Code analysis + improvement proposal before the P2P changes

**When to address:** after the POCs, before starting Chapter 4. Related:
`client-server-resolution.md`, `../chapters/ch3-pocs.md`,
`../chapters/ch4-integration.md`.

The migration carried spl5 forward like-for-like, so whatever latent
issues existed came with it — e.g.:
- the server-repo-bound handler/schema resolution (see
  `client-server-resolution.md`),
- the absence of any orchestrator type actually exercising internal
  `dispatch()` (the re-entry seam is designed for but unused),
- the client-server resolution model still being implicit.

**Question:** before starting the Chapter 4 P2P integration, should we
run a structured analysis of the migrated codebase and produce an
improvement proposal — clarifying and hardening the base so the
distributed work builds on solid ground rather than carrying latent
issues into the harder transport changes?

The Chapter 3 POCs will also surface what the implementation actually
needs. Decide scope and timing after the POCs, alongside the
client-server resolution question.
