# Infrastructure — the bare-p2p-pear documentation hub

Structure-and-vision working note for the splectrum.world **engineering /
infrastructure** section. The analogue of `engineering-structure.md` for
the Infrastructure layer. We author here; the-world-of-splectrum executes.

Research basis: a five-cluster live research pass (late May 2026) against
docs.pears.com, github.com/holepunchto, the npm registry, and
pears.com/news. Findings + currency caveats are folded in below.

## Vision / stance

- **Deep, steward-minded coverage, as a community resource.** Not the
  consumer's "modules we adapted" framing — a genuine reference on the
  bare + P2P + Pear stack that helps us *and* others. Open-source
  mentality: we contribute into this, our way.
- **Type of coverage matters, not page count.** Optimise for the *kind*
  of treatment, not economy. Each component gets proper conceptual +
  practical coverage (what it is, how it works, where it sits in the
  stack, honest limitations); cross-component concepts get their own
  treatment; and the ecosystem/community dimension plus an honest
  "state of the information" are first-class, not afterthoughts.
- **Write for the AI reader; humans come free.** The primary consumer of
  these pages is increasingly an AI agent consulting them to build or
  integrate — a precise, demanding reader. Test each page by: *if an agent
  needed this component, does the page hold what it would go looking for?* —
  the real symbol/option names and signatures, the gotchas and failure modes,
  how it composes with its neighbours, the canonical sources, and honest
  markers on what's uncertain or moving. That also serves humans (they rarely
  need *less*; the brief orientation is their on-ramp). It means "what an
  agent needs to **act**, synthesised" — *not* the full spec (link the README
  for that), so it stays consistent with synthesise-don't-mirror. And because
  a confidently-wrong fact misleads an agent that acts on it, "don't
  fabricate / mark the uncertain" matters *more* here, not less.
- **It stays the Infrastructure layer.** This is *not* SPLectrum and is
  not elevated to a peer of it. To the Platform it remains third-party
  physical software the Platform weaves down to. The shift is in stance
  and depth, not in placement.
- **Voice stays neutral / factual.** Not SPLectrum's voice; not a
  positioning Subject. Plain technical reference.
- **It mirrors the ecosystem's own 2026 framing.** Holepunch's "Pear
  Evolution" post (pears.com/news/pear-evolution, May 2026) now presents
  the stack as a unified foundation — Bare (run everywhere) + P2P
  building blocks (distributed infra) + Pear (embeddable runtime,
  deployment, OTA). Our hub's top-level shape follows that.
- **pear-full-square = our POC org.** Useful POCs land there and surface
  in the "currently building" section. **bare-for-pear = the
  barification work** (our forks/adaptations of modules to Bare).
- **Synthesise properly; an agent keeps it fresh.** The model is *not*
  thin link-stubs and *not* verbatim README dumps — it's proper,
  synthesised, implementation-grade pages: our orientation and structure
  on top (what it is, where it sits, how the pieces relate, the gotchas),
  then enough organised detail to implement from. The stack ships weekly,
  but the refresh mechanism is **an agent** — see
  `../tools/doc-freshness-agent.md` — which re-pulls each page's listed
  sources, diffs, auto-fixes mechanical drift (versions, dead links,
  `lastmod`) and flags the judgment calls. So depth is maintainable;
  drift is no longer a reason to stay thin. The same source-check applies
  at authoring time (the errors we hit — libjs, crypto, stale versions —
  were authoring slips a source-check catches, not arguments for thinness).
- **Our own POC tests are a primary input** (pear-full-square): for things
  like barification, first-hand experience beats exhaustive doc-reading —
  write what we've proven, and mark genuinely-open parts open (and as POC
  items).

## Page map (deep coverage, by cluster)

Organic growth: lay the full map as holding pages, fill foundation-first
(what we need for the Chapter 3 POCs), keep growing in parallel. Each
page carries a **Sources** block (canonical links) for refresh.

### Top-level structure — three headings (by maker)
The landing page groups everything under three actors:
- **Holepunch** (upstream stack) — **Bare** (§1 runtime + bare-\* modules
  + barification mechanism), **P2P building blocks** (§2 storage + §3
  networking + §4 crypto/security + §5 availability — *independent of
  Pear; used directly by many projects*), and **Pear** (§1 platform +
  pear-runtime). Mirrors Holepunch's own three-layer "Pear Evolution"
  framing, nested correctly under the one maker.
- **In House** (our contributions) — **bare-for-pear** (§6, barified
  modules) and **pear-full-square** (our POCs; the §7 pear-full-square
  bullet belongs here).
- **Ecosystem** (the wider field) — what others build on the stack: the
  health-tiered survey (§7, minus pear-full-square).

(The §-numbered sections below are the per-component detail; this is how
they group on the landing page.)

**Directory layout (flat, headings are landing-page-only):** dirs stay
flat under `infrastructure/` — `bare/` (exists), `p2p/` (new), `pear/`
(from `pear.md`), `bare-for-pear/` (exists), `pear-full-square/` (new),
`ecosystem/` (new). The three headings group these on `index.md`; they are
not wrapper directories. Only rename/move: `pear.md` → `pear/` (+redirect).

### Landing / overview
The unified-foundation framing (Bare + P2P + Pear — all Holepunch), the
three-heading structure above, and pointers to In House + Ecosystem. Note
it's a moving snapshot; Pear is mid-evolution.

### 1. Runtime & platform
- **Bare** — the minimal JS runtime everything targets (engine
  abstraction via libjs; libuv-based). *Refresh of existing pages.*
- **bare-\* module ecosystem** — ~60+ purpose-built modules (no stdlib;
  capability comes from modules; Holepunch maintains ~154 `bare-*` repos,
  reimplemented on libuv rather than forked). The catalogue + how native
  addons / prebuilt binaries (`bare-runtime`) work. *Refresh; add
  `bare-sidecar`.*
- **Node compatibility / barification** — *how* you port a module to
  Bare: the package.json `imports` map + `"bare"` resolution condition
  (`fs` → `bare-fs`), the `with { imports }` load-time pragma (convert a
  dep tree without editing), the `bare-node` compat layer, bundling via
  `bare-pack`, native addons via `bare-make`/`bare-addon`, and the
  no-`global.process` gotcha (→ `bare-process`). The mechanism is
  standardised and documented (one reference page +
  `bare-node`/`bare-pack` READMEs); there is **no porting cookbook** —
  practice is semi-tribal. *New page — and a genuine gap we can help
  fill (see §6).*
  - **Why it isn't enough (the overhead/limits — our fork rationale):**
    the map only remaps builtin *names*; it can't supply missing
    *capability*. It fails for: native (N-API) addons (need a
    `bare-make` rebuild across ~14 prebuild targets); **uncovered
    builtins** (`http2`/gRPC, `cluster`, `wasi`; and `bare-crypto` covers
    only hashing/HMAC/symmetric — no public-key/randomBytes/KDF/signing);
    **Node stream internals** (`bare-stream` is *streamx*, not a port —
    subtly different semantics); **dynamic/conditional `require`**
    (`bare-pack` only resolves static specifiers → runtime failure or
    silent degradation); and **unmapped transitive-dep builtins**. Plus
    global shims (`process`/`Buffer`), undocumented behavioral/error-shape
    divergence (no parity matrix), and per-upstream-bump maintenance toil.
    Rule of thumb: *map it if the only difference is the name; fork it the
    moment the difference is capability.*
- **Pear platform** — the CLI/platform: boot bundle, Hyperdrive-backed
  app distribution, atomic OTA swaps; the **v1→v2 migration**
  (HTML→JS entrypoints, `Pear` global decomposed into modules, UI →
  `pear-electron`+`pear-bridge`). *Full rewrite.*
- **pear-runtime (embeddable library)** — the centerpiece of the 2026
  shift: embed the P2P runtime as a library (constructor, ready/close/
  run, Bare workers, OTA via `pear-runtime-updater`). **Experimental/MVP
  — document version-pinned, flagged.** *New page.*

### 2. Storage primitives (the Hypercore family)
- **Hypercore** — append-only signed log; the foundation. *New.*
- **Hyperbee** — KV / B-tree on a Hypercore (metadata/index layer). *New.*
- **Hyperdrive** — filesystem = Hyperbee (metadata) + Hyperblobs
  (content) over a Corestore. *New.*
- **Corestore** — manage many Hypercores (one per app). *New.*
- **Autobase** — multiwriter: linearize many writers into one
  eventually-consistent view. The collaboration primitive. *New.*
- **Hyperblobs** — blob store; content layer of Hyperdrive. *New.*

### 3. Networking & transport
- **HyperDHT** — Kademlia DHT: topic discovery + distributed
  hole-punching; identity = public key. *New.*
- **Hyperswarm** — topic-based discovery + connection lifecycle over
  HyperDHT (the layer apps import). *New.*
- **UDX** — reliable UDP at the bottom (no crypto, no handshake — by
  design). *New.*
- **secret-stream** — Noise handshake + libsodium encryption framing
  (why every connection is encrypted). *New.*
- **protomux** — multiple protocols over one framed stream. *New.*
- Conceptual page(s): **topic discovery**, **UDP hole-punching**,
  **public vs private DHT / custom bootstrap**, **Noise E2E**. *New.*

### 4. Crypto & security
- **Key model** — keypair (Ed25519, = identity/address) vs **discovery
  key** (BLAKE2b of public key, = find/announce without leaking
  capability) vs **encryption key** (optional block encryption). The
  load-bearing concept; well-assertable. *New.*
- **P2P security model** — two encryption layers (always-on Noise
  transport vs optional Hypercore block encryption); what a DHT observer
  sees (IP/port, topic hash, connection patterns); traffic-analysis
  surface; private swarms as mitigation; known limitations (no built-in
  anonymity). *New.* See holes below — assert only what sources state.

### 5. Availability & relays
Keep these four distinct (commonly conflated):
- **blind-peering** — always-on mirrors that keep your cores/autobases
  available offline. *New.*
- **@hyperswarm/seeders** — signed (mutable-record) seeder swarm;
  pinning tier. *New.*
- **blind-relay** — TURN-like UDX relay for when hole-punching fails;
  forwards already-encrypted traffic. *New.*
- **@hyperswarm/dht-relay** — bridge the DHT over TCP/WebSocket so
  browsers (no UDP) can participate. *New.*
- (**blind-pairing** — invite/pairing without infra learning the room
  key; clean example of the "blind infrastructure" pattern.) *Optional.*

### 6. bare-for-pear (our contributions)
The barification work — our forks/originals adapted for Bare (avsc,
avsc-rpc, git, rpc-server). *Pages exist; assess April submission,
update for spl6 context, keep the contributor framing.*

**Why we reimplemented rather than used the standard mechanism.** The
package.json `imports`-map + `"bare"` mechanism (§1) did **not** work
cleanly for some of these libraries, so we did our own barification. That
first-hand "where the standard mechanism breaks, and what we did instead"
is the spine of these pages — and it fills the missing cookbook. (See §1
for the mechanism's documented overhead/limits.)

Position in the landscape (so the pages aren't insular): barification is
**overwhelmingly first-party** (Holepunch's ~154 `bare-*` repos). Notable
third-party porters are few — **pino-bare** (Matteo Collina, the cleanest
pure-JS reference port), **Tether/QVAC** (the only broad sustained program
— C++ AI engines as Bare addons), and **RangerMauve/hyper-sdk** (dual
Bare/Node). The community mostly *consumes* `bare-*` to build apps rather
than porting libraries. **Opportunity:** there is no barification cookbook
— documenting *how we barified* avsc/git/rpc-server is contributable
content with little prior art, and fits the steward angle.

**License flag (act before contributing):** `avsc` is a fork of MIT
`avsc`, but `avsc-rpc` / `git` / `rpc-server` carry **no license file** —
publicly visible ≠ reusable. Add licenses if we intend them to be used or
contributed. Ties to `../open-questions/bare-for-pear-contribution.md`.

**Backlog — barification cookbook (high-value, deferred).** The standout
contribution where pears.com is fragmented: a first-hand porting cookbook —
how we barified **avsc / avsc-rpc / git / rpc-server**, what actually broke
in each, and what we did instead — plus the **remap-vs-fork decision
guide**. Durable and experiential (low drift), and a genuine upstream void
(no cookbook exists; the practice is semi-tribal). Conditions:
- *Do it with the bare-for-pear rework*, not as a one-off — and after the
  Holepunch/Bare foundation pass. The hook is already placed: the
  dual-runtime page's "when remapping isn't enough" section cross-links here.
- *Gating input:* capture the per-library war stories first (from the repos
  / first-hand); then the prompt is short and substantial. Do **not** write
  a generic version — that just restates the dual-runtime pitfalls section.
- *Precondition:* resolve the license gap above if we're publishing
  "how we did it."

### 7. Currently building
A living ecosystem layer — "what's being built on this, now," us + others.
**Health-assessed, not a link dump** (verified late May 2026). Tier by
credibility so readers can trust it:

- **Flagship / production-oriented (verified active + healthy):**
  - Apps: **Keet** (keet.io, first-party chat) · **Agregore Browser**
    (distributed-web browser, ~914★, AGPL, by RangerMauve) · **Holesail**
    (P2P tunnels, no port-forwarding, ~276★, AGPL) · **PearPass** (Tether
    password manager, ~462★) · **CoMapeo / Mapeo** (Digital Democracy;
    funded, real field deployment; MIT).
  - Libraries: first-party core (Hypercore/Hyperdrive/Hyperswarm/
    Hyperbee/Autobase) · **hyperdb** (P2P-first DB) · **autopass** (lib
    behind PearPass) · **hyperschema** · **hyperbeam** (1:1 pipe,
    stable) · community **hyper-sdk** (RangerMauve, high-level SDK,
    ~298★).
  - Mobile/dev: **bare-expo / bare-kit** (supported mobile embed path).
- **Promising / watch (early, experimental):** **HiveRelay**
  (`bigdestiny2/P2P-Hiverelay`, Apache-2.0) — community always-on relay /
  availability layer (blind custody, durability proofs, federation/
  operator incentives) on top of / competing with first-party
  blind-peering/blind-relay/seeders. Active but pre-1.0, tiny adoption,
  AI-assisted single maintainer, core-function issues open; the
  Blindspark/Umbrel/Lightning angle is aspirational. Track, don't depend.
  Also: pear-expo, react-native-pear-end.
- **People worth knowing:** **RangerMauve** — the significant independent
  maintainer (Agregore, hyper-sdk, adapters).
- **Community index:** **awesome-pears** (gasolin/awesome-pears, CC0) —
  link it, but with the caveat that it's *uncurated for health* (mixes
  dead/renamed/demo repos with production tools). Concept primer: Hypha
  Co-op's "Dripline" (hypha.coop). Community largely lives in **Keet
  rooms**, not Discord/forums.
- **pear-full-square POCs:** our POC repos — what each probes, status,
  what it proved. This is where the Chapter 3 POCs surface publicly.

**Licensing caveat (matters for the open-source stance):** several repos
ship with **no license file** — including first-party `corestore`, and
community ghost-drive / seekdeep and others. Publicly visible ≠ legally
reusable. Note license per project; flag the unlicensed ones.

## Foundation first (what the POCs need)

Front-load the pieces Chapter 3 leans on: **HyperDHT + Hyperswarm**
(discovery/transport), **Hypercore + Corestore** (storage identity),
**Pear platform + pear-runtime** (the runtime model and updates), and the
**key model / security** basics. The rest (Autobase, UDX deep-dive,
relays, full ecosystem) fills in parallel as POCs touch them.

## Information availability & holes

Solid and assertable from authoritative sources: the layered
architecture; the three-key model; Noise XX + Ed25519 + libsodium;
always-on transport encryption; topic/discovery mechanics; the
component map and current versions.

Thin / hard to document accurately (flag, link upstream, don't
over-assert):
- **Hole-punching algorithm** (HyperDHT) — only described as "a series
  of techniques" upstream; the real protocol needs source-reading.
- **UDX** — no docs.pears.com page; README-only; `latest` vs `next`
  dist-tag split (1.19.2 vs 1.20.x) is a trap.
- **Autobase** — quorum / `signedLength` / fast-forward semantics churn;
  hardest to keep current.
- **DHT privacy** — enhancement issues (#50, #2) are open/unresolved; no
  onion routing / anonymity. The security page must frame anonymity as a
  *known limitation, not a feature*, and must not assert forward-secrecy
  or a formal threat model (not published).
- **"Blind" guarantees** — that relays/blind-peers see only ciphertext
  is architecturally implied; docs.pears.com prose supports the
  blind-relay phrasing, but don't quote verbatim guarantees the READMEs
  don't make.
- **RocksDB / hypercore-storage migration** — the defining 2026 storage
  change (Hypercore 11, Corestore 7); **underdocumented upstream**, and
  several READMEs lag the published npm state.

## Corrections & flags (vs spl5-era plan notes)

- **"HiveRelay" is a community project, not a first-party Holepunch
  component** — `bigdestiny2/P2P-Hiverelay` (Apache-2.0): an always-on
  relay / availability layer built on the stack. It is *not* the official
  availability set, which is **blind-relay** (TURN-like), **blind-peering**
  (mirrors), **@hyperswarm/seeders** (pinning), **@hyperswarm/dht-relay**
  (transport bridge). So HiveRelay belongs in "currently building" (watch
  tier) and as a candidate in the ch8 availability evaluation — not as a
  first-party building block. (ch8 §5.2 updated accordingly.)
- **`pear run` removal is confirmed (~end June 2026)** by the "Pear
  Evolution" post; migration → `pear-runtime` / `hello-pear-electron`.
  (One research pass read the CLI ref and thought it not-yet-deprecated;
  the blog announcement is the authoritative, newer signal. Verify the
  exact cutover near the date.) The Pear rewrite is therefore the
  *centerpiece* of the shift, not a routine refresh.
- **docs.pear.sh is dead** → use **docs.pears.com**; `.html` paths gone
  (extensionless, trailing slash). **holepunch.to** is legacy →
  **pears.com**.
- **`--inspect-port`** — not found in the current CLI reference; verify
  against live `pear run --help` before adding, likely drop.

## Pear — verified state & POC questions (primary-source pass, late May 2026)

For the Pear page. Verified from Holepunch primaries (Pear Evolution post
2026-05-28, migration doc, pear repo + ARCHITECTURE.md, npm).

**Assert (verified):** Pear = installable P2P runtime + dev + deploy
platform; boots on Bare from a minimal `boot.bundle`; codebase/apps in a
Hyperdrive/corestore; **atomic OTA swaps** (extract new swap, repoint
`/current`). **`pear run` is deprecated — removal ~end June 2026**
(verbatim), replaced by the embeddable **pear-runtime** library. **v1→v2:**
HTML→JS entrypoints; the `Pear` global decomposed into modules — verified
**pear-electron** (UI), **pear-bridge**, **pear-run**, **pear-message**,
**pear-updates**; `Pear.config`→`Pear.app`; compat mode
(`Pear.constructor.COMPAT = true`); migration via the **hello-pear-electron**
boilerplate + transitional `pear.pre`. `pear-runtime` = npm 1.1.4
(2026-05-21), **self-described MVP/experimental**; `pear-runtime-updater`
3.1.0. CLI today = 14 commands — link, don't mirror.

**Do NOT assert (moving/unverified — link to live docs):** no published v2
ship date (don't cite a v2 version; the "v2.5/v2.6 + build/provision/multisig"
claim was an unverified artifact, contradicted by the live CLI — exclude);
module names **pear-pipe / pear-messages / pear-wakeups** unconfirmed.

**Verify-in-code / POC** (feeds pear-full-square / Ch3; items 1–4 also bear
on Ch4 integration):
1. Is `pear-runtime` production-ready for spl6? (MVP label vs 1.1.4 semver.)
2. **Most spl6-relevant:** two runtime surfaces — raw `PearRuntime` vs
   `pear-electron`'s `Runtime().start({bridge})`. Which is the integration
   point for a **headless/terminal** app with no Electron UI? POC a
   non-Electron embed using `PearRuntime` directly.
3. What migration really requires for a **terminal/Bare** app — the
   documented path is Electron/GUI-centric; likely only `PearRuntime` + the
   OTA updater matter for us.
4. The `touch`/`stage`/`seed` → `pear-runtime-updater` OTA handshake
   (load-bearing for any deploy story) — POC the full release→update loop.
5. Whether `pear run` is actually gone by our publish date ("around" end-June
   2026 — dates slip); re-check near the date, phrase as "scheduled."

## Networking & transport cluster — research notes & POC items (authoring pass, 2026-05-31)

Authoring input for the P2P networking pages.

**The stack (verified — one correction to the earlier framing):** UDX
(reliable UDP, no crypto) carries everything; **@hyperswarm/secret-stream
(Noise XX) is embedded *inside* HyperDHT**, which does discovery + distributed
hole-punch over UDX and emits **already-Noise-encrypted** sockets; Hyperswarm
wraps HyperDHT with topic discovery + connection lifecycle. **protomux** is
orthogonal — it multiplexes protocols on top of an established (encrypted)
connection. So you do **not** manually stack secret-stream at the
Hyperswarm/HyperDHT level; standalone secret-stream is only for a BYO
transport. Identity = an **Ed25519 public key, which is also the connectable
address**.

**Must handle on the pages:**
- **UDX dist-tag trap:** `latest`=1.19.2 (old), active line **`next`=1.20.6**;
  `npm i udx-native` gives the old one and the README (on `main`) documents
  the newer API — pin `@next`/exact. (Hyperswarm has a stray `tmp`=4.13.0;
  `latest`=4.17.0 is right.)
- **`flush` vs `flushed`:** `swarm.flush()` (in-flight ops settle) ≠
  `discovery.flushed()` (announced on the DHT) — confusing them is the classic
  "no peers found" bug.
- **Connections are Noise-encrypted by default** (don't double-wrap); topics
  are **32-byte buffers**; protomux needs a **framed** stream and
  `createChannel` can return `null`.
- **Hole-punch is under-documented upstream** — only named in READMEs; the
  algorithm is in a blog + source. Symmetric NAT fails → relay fallback;
  vendor figure ~95% direct / ~5% relay (RELAYED). Cover at orientation level;
  the deep algorithm is a POC-fed subpage.

**Versions (2026-05-31):** hyperdht 6.32.0, hyperswarm 4.17.0, udx-native
`latest` 1.19.2 / `next` 1.20.6, @hyperswarm/secret-stream 6.9.1, protomux
3.11.0. Churning: protomux, hyperdht, udx; stable-ish: hyperswarm,
secret-stream.

**Sources/freshness:** GitHub READMEs are authoritative (udx/hyperdht on
`main`; hyperswarm/protomux/secret-stream resolve on `master`). docs.pears.com
building-blocks pages are SPA shells (the hyperdht one 301-redirects) — source
from raw READMEs. Repo/package name mismatch: repo `hyperswarm-secret-stream`,
package `@hyperswarm/secret-stream`.

**Verify-in-POC (feeds pear-full-square / Ch3 — the POC-critical cluster):**
1. **Hole-punch success across real NAT-type pairings** (symmetric → relay) +
   the exact algorithm (read hyperdht source) — the headline networking POC.
2. **`flush`/`flushed` → announce-propagation timing** (how long after
   `flushed()` before a remote `lookup` reliably sees you) — two-peer timing.
3. Private/custom-bootstrap DHT operations (durable private swarm) — bears on
   splectrum.world's own swarm (Ch8).
4. UDX `framed` streams under protomux; secret-stream handshake reuse — by test.

## Information stores & quality

There is **no single authoritative, current, complete store** — the truth
is distributed across five, each good for one thing. This fragmentation
is part of *why* a coherent neutral hub helps the community, and why each
page must cite specific sources and stay honest where upstream is silent.

| Store | Good for | Quality / caveats |
|---|---|---|
| **docs.pears.com** (src `holepunchto/pear-docs`, `SUMMARY.md` = TOC) | Concepts, guides, how-tos, building-block + Bare-module catalogs | Good for concepts + *stable* APIs; **lags the release pace**; some leaf pages return only nav chrome; **no UDX page**; security/privacy thin. `SUMMARY.md` is diffable. |
| **github.com/holepunchto** (~600 repos) | The *real* API docs (READMEs), `DESIGN.md` for internals, issues hold un-promoted knowledge | Most current prose — but **READMEs lag npm** (Corestore); only some repos cut Releases; privacy/threat detail lives in open issues #50/#2/#22. |
| **npm registry** (`registry.npmjs.org/<pkg>`) | Authoritative **currency** (versions, dist-tags, times) | Best machine-readable freshness; npmjs.com site 403s fetchers (use the API); **dist-tags mislead** (UDX latest vs next). |
| **pears.com/news** (blog) | **Direction & announcements first** (Pear Evolution, PearPass, "P2P from Scratch") | High-signal for narrative, not reference; stable slugs. |
| **gasolin/awesome-pears** (community) | Breadth index | Useful but **uncurated for health** (dead/renamed/demo mixed in). |

Avoid as dead/stale: `docs.pear.sh`, `holepunch.to`/`docs.holepunch.to`
(→ pears.com), the `becdeg.com` "What's New" mirror (frozen Jan 2025).

## Refresh model

Each page ends with a **Sources** block (canonical links + the npm
package). Refresh rounds re-check, then bump `lastmod`. Low-effort,
high-signal checklist (cheapest first):
1. **Diff `holepunchto/pear-docs` → `SUMMARY.md`** — structural doc
   changes show here first.
2. **npm registry JSON** (`registry.npmjs.org/<pkg>`) — read `dist-tags`
   + `time` for versions/dates. (npmjs.com pages 403 fetchers; the
   registry API doesn't. Always check `dist-tags`, not just `latest` —
   see the UDX trap.)
3. **pears.com/news/** — scan new slugs; pivots (like Pear Evolution)
   land on the blog before docs catch up. Watch for "P2P from Scratch"
   sequels.
4. **github.com/orgs/holepunchto/repositories?sort=updated** — activity
   heartbeat; spot new first-party repos.
5. **Community link rot** — re-validate the curated tier; lean on
   awesome-pears for the long tail.
6. **Standing flag:** confirm whether `pear run` was actually removed at
   end-June 2026 and whether migration docs landed.

Per-page authoritative sources (storage / networking / runtime / crypto)
are captured in the cluster research; each page's Sources block pins the
specific docs page + GitHub repo + npm package for that component.

## Process

Authored here as prompt docs carrying proposed content; rendered in
the-world-of-splectrum's voice/conventions. Neutral/factual. Single vs
multi-page is editorial per component (the building blocks each warrant
their own page; the conceptual mechanics may group).
