# Chapter 2 — Documentation

**Status: ▶ next.**

Documentation prompts written here (spl6), executed by the
`the-world-of-splectrum` repo (the splectrum.world site, served from
`docs/`) through its own editorial process — submission → draft → blog
→ ref-lib absorption. We author prompt docs and submissions in *its*
voice (`tone-of-voice/`, `process/`, `posting-guide.md`); we do not
edit the published pages directly from here.

> Note: the cross-repo authoring pattern itself is a candidate spl tool
> — see `../tools/doc-dispatch.md`. For now the flow is manual:
> prompt/submission authored, executed in the doc repo's own context.

### 2.1 Pear page rewrite

Current `pear.md` describes the old `pear run` model (deprecated June
2026). Full rewrite for the library approach:
- pear-runtime as embeddable library
- Constructor, API (ready/close/run/updater)
- P2P updates via Hyperdrive
- Worker execution
- Migration from `pear run` (lower priority, separate page)
- Links: github.com/holepunchto/pear-runtime, docs.pears.com

### 2.2 Hyperswarm / HyperDHT page (new)

Peer discovery and networking. Doesn't exist on the site yet.
- Topic-based peer discovery
- DHT architecture (public mainnet, private, hybrid)
- Bootstrap nodes — default public, custom for private swarms
- Noise protocol end-to-end encryption
- UDP hole-punching
- splectrum.world private swarm setup

### 2.3 Hypercore / Hyperdrive page (new)

Distributed storage primitives. Doesn't exist on the site yet.
- Hypercore: append-only log, public key identity, replication
- Hyperdrive: filesystem on Hypercores
- Hyperbee: B-tree on Hypercore
- Corestore: multi-core management
- Crypto model: discovery keys vs public keys vs encryption keys
- Traffic analysis surface

### 2.4 P2P security model page (new)

Doesn't exist on the site. Full security picture:
- Cryptographic access control (Ed25519, Noise)
- DHT visibility — public vs private swarms
- Metadata leakage (connection patterns, block sizes, timing)
- Private swarm as mitigation
- VPN/overlay as additional layer
- Key management responsibilities
- HiveRelay blind storage model

### 2.5 Bare pages — version refresh

Existing pages are structurally accurate. Needs:
- Module catalog version bump (verified April → verify current)
- Fix stale links (docs.pear.sh → docs.pears.com, broken .html paths)
- Add `--inspect-port` flag (missing from CLI table)
- Check for any new modules added upstream since April

### 2.6 spl5 retrospective / spl6 direction page (new)

What spl5 proved, what carries forward, what P2P transport changes.
For the engineering section of the site:
- Fabric concepts proven (stream record, dispatch, boundary packing)
- Transport shift (TCP → Hyperswarm)
- Location transparency (namespace path → swarm topic)
- Connection to the Splectrum vision

### 2.7 bare-for-pear module pages — complete gaps

The April submission (git, rpc-server, testing pages) was written in
spl5 but never landed on the site. Assess what's still accurate,
update for spl6 context, resubmit.
