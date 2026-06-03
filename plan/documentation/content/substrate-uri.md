# URI — substrate language of identification

Our brand of URI: local, forward-only addressing with a data/metadata
dimension. Logical design only.

## The role

URI identifies which resource and what operation. The addressing scheme
for the fabric — uniform identification without a central registry.

## Active adoption

**Kept:**
- Uniform resource identification (which thing, by path)
- Operations: get, put, remove

**Our constraints:**
- Forward slash `/` as path separator
- Underscore prefix `_` opens the metadata dimension — a lateral move,
  not a deeper one. The property bag is at the node, not below it
- No trailing slash
- No protocol prefixes — all addressing is local, from `/` within a
  context
- Forward-only — paths go forward from root, no backward navigation
- `/` = current context root (not absolute, not necessarily repo root)
- Path rebases on context switch — entering a different context gives
  a new `/`. Registered child repo root = registration node in parent

**Three visibility modes:**
- **data** — data nodes only (hides underscore-prefixed segments)
- **metadata** — metadata nodes only (only underscore-prefixed segments)
- **raw** — everything, no filtering

Operations (get, put, remove) work per visibility mode, across both
stores (git-backed and log-backed).

## What lives where

| Concern | Where it is documented |
|---|---|
| URI constraints and the underscore convention | **Language substrate** (this page) |
| Three visibility modes | **Language substrate** (this page) |
| URI protocols as fabric operations (git/log specifics) | **Mycelium** (Platform) |
