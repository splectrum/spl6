# Open question — Global invocation → client-server resolution

**When to address:** scheduled into **Chapter 5 (Platform design
review)**, after the POCs and integration. This file holds the canonical
statement; Chapter 5 settles it. Related: `../tools/doc-dispatch.md`,
`../chapters/ch3-pocs.md` (§3.2), `../chapters/ch4-integration.md`
(§4.3), `../chapters/ch5-platform-design-review.md`.

## The limitation today

The global `spl` connects to one fixed server (localhost:24950) whose
handler and schema roots are bound to the *server process's own repo*:
- `spl/mycelium/process/dispatch/index.js` (`getRoot`) requires
  handlers from there.
- `spl/mycelium/schema.js` (`schemaRoot`) reads `_schema` from there.

With several repos on one machine that means `spl` runs the
server-repo's implementation against the caller's data; "serves any
repo on the filesystem" only holds if every repo shares an identical
`spl/` + `_schema/`.

## Proposed direction

Make the global entry point a thin client-side *resolver*. From the
invocation context — cwd → repo, plus client identity — it works out
**which client-server combination** is targeted (two selectors: which
client identity, which server/peer) and connects the client to its
*local* server. That server then owns the namespace mappings for
processing, which may themselves be distributed/decentralised (a topic
served locally or forwarded to another peer).

This separates client-side client-server selection from server-side
namespace dispatch: the global tool never needs the whole topology,
only the right local entry point; the server handles dispatch or
fan-out into the fabric from there.

It is the local, single-machine form of the P2P dispatch model
(repo = peer; `spl` = router to the peer for your context), so it is
forward-compatible with §3.2 and §4.3.

## To decide after the POCs

- per-repo peer vs in-process local path
- how a peer is addressed (unix socket / port / topic) and auto-started
- how client identity is selected

Deferred deliberately — not Chapter 1 (pure migration); the POCs should
inform the dispatch/transport model before this is settled.
