# spl6 Plan — closed

spl6 is complete. This repo is a read-only reference for spl7.
The original seed plan is frozen at `initialise/plan.md`.

## How this folder is organised

- **`overview.md`** — context, landscape, and the unified approach.
- **`chapters/`** — one file per chapter.
- **`open-questions/`** — decisions deferred, one per file.
- **`tools/`** — specs for candidate spl tools surfaced along the way.
- **`references.md`** — running list of external resources.
- **`documentation/`** — working notes for the splectrum.world workstream.
- **`mycelium-design.md`** — Round 1 design (key reference for spl7).
- **`p2p-building-blocks.md`** — POC catalogue (key reference for spl7).
- **`swarm-picture.md`** — swarm operating model synthesis.
- **`spl7-preliminary.md`** — spl7 scope and approach.

## Final status (2026-06-08)

| Chapter | State |
|---|---|
| 1 — Initialisation | ✅ complete — migration baseline; 73 tests green on TCP |
| 2 — Documentation | ✅ complete — engineering structure, subject phase, substrate layer, Infrastructure hub |
| 3 — P2P transport POCs | ✅ complete — every primitive proven under Bare. Catalogue: `p2p-building-blocks.md` |
| 4 — Mycelium design | ✅ complete — Round 1 design + substrate pages reworked. Round 2 deferred to spl7 |
| Swarm app | ✅ complete — all 7 phases. Design: `phase-7-swarm-app/design.md` |

**spl6's arc:** migrate the proven fabric → explore the P2P substrate →
design Mycelium (Round 1) → prove the swarm primitives compose into a
working app. Done.

**spl7** picks up at `~/splectrum/spl7`. Workspace repos at
`~/pear-full-square/` (mycelium, hyperdrive-fuse).

## Open questions (carried forward)

See `open-questions/`:
- `test-strategy.md`
- `client-server-resolution.md` — global `spl` as client-side resolver
- `bare-for-pear-contribution.md`
