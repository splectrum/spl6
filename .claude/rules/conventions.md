# Working Conventions

How we collaborate on this repo. Update when a new
convention settles (comes up multiple times, or is
explicitly agreed).

## Commit pace

Work first, think through, iterate. Commit when a coherent
piece is done, not as a reflex after each change.

**Why:** Premature commits create noise and force review of
half-baked states. Design decisions are still forming during
implementation — commits should reflect settled pieces.

**How to apply:** Keep working, testing, iterating. Commit
when the user asks, or when a complete, tested, coherent
piece of work is ready.

## in-wonder ref lib docs are submissions

Docs created in `docs/ref-lib/` are submissions to the
in-wonder ref lib, processed editorially before inclusion.
They are not direct copies of the live ref lib pages.

**Why:** in-wonder has its own editorial process and voice.

**How to apply:** Write ref lib docs with clear reasoning
and narrative progression. Use whatever style works best
for the content — don't force alignment with existing ref
lib page style. Leave open areas explicitly marked rather
than forcing premature answers.

## Pressure-point approach

We deliberately defer some infrastructure investments
(e.g., extracting a test framework module) until real
pressure surfaces. The risk is that under pressure we patch
instead of invest.

**Why:** Premature abstraction against speculative needs
ossifies shape badly. But patches-under-pressure calcify
worse.

**How to apply:** When pressure arrives on a deferred item,
do the proper investment, not a workaround. Track deferred
items on the roadmap *with their reason* so the reason can
be re-evaluated later — if the reason still applies, the
item can't quietly fall off.

## Memory flow: session bank → repo

Session memory is scratch space for in-flight work. Once
conventions or state observations settle, transfer them
into `.claude/rules/` (project-state.md for state, this
file for conventions) and commit. The memory bank remains
useful for the current session; the repo is the durable
home.

**Why:** Memory that's about the project and my persona in
it should follow the repo, not drift off with me across
sessions. User-personal preferences stay outside — nothing
of that kind belongs here.

**How to apply:** During a session, write to the memory
bank freely. At commit points and session end, sync what
has bedded in to these files. Delete the transferred
entries from the memory bank so there's one source of
truth.
