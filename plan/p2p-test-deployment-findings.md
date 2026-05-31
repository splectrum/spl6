# P2P test & deployment patterns — findings (internal)

Internal working notes (not splectrum.world). Distilled from a working
discussion; to be developed into Chapter 3 POC harnesses and example repos
(`pear-full-square`), and informing Chapter 4 (transport integration) and
Chapter 8 (the VPS swarm). Home automation is used as the worked example —
a good test case, and a relatable/popular domain in its own right.

## The core principle: translation layers vs hole-punching

**Hole-punch success is inversely proportional to the number of
NAT / translation / encapsulation layers between the peer and the wire.**
- Docker's default **bridge network adds a NAT layer**; Kubernetes adds
  **pod SNAT + (often) an overlay + Service/kube-proxy** for UDP inbound —
  each layer can make the peer look like a **symmetric NAT**, which
  hole-punching can't cross → **relay fallback** (`blind-relay`) or failure.
- This is **substrate-agnostic** — true for any orchestrator, not just Docker.
- **Escape hatch:** put the peer on **host networking** (Docker
  `--network host` / K8s `hostNetwork` / a plain process), or accept the
  relay fallback. Minimise layers for the peer; let the rest live behind it.

## Two distinct modes (don't conflate)

1. **Contained testing** — determinism, isolation, reproducibility; one host;
   exercises **logic/protocol only**.
2. **Distributed deployment** — real NAT, real traversal; isolation,
   portability, security; the only way to test **traversal** for real.

Containers serve both, for *different* reasons. Keep the purpose straight.

## Contained test harness (the reusable fixture)

- **docker-compose, N peer containers**, each emitting **structured stdout**
  (tagged or JSON lines), monitored via `docker logs` / `docker compose logs`.
  Structured stdout is **agent-monitorable** — an AI can read and assert on
  it (fits "write for the AI reader" / entity = process).
- **Local private DHT:** one container runs a bootstrap node
  (`DHT.bootstrapper(port, host)`); peers point at `bootstrap: ['127.0.0.1:port']`.
  Result: **offline, deterministic, isolated** — no public `hyperdht.org`
  dependency. (The "~30-min to become routable" caveat is **public-mainnet
  only** — irrelevant for a local private DHT.)
- **Reusable template** for `pear-full-square` / example repos: "spin up a
  private DHT + N peers, narrate to stdout."
- **Build note:** peers run on **Bare** + native prebuilds (**UDX** is a
  native addon) — Linux images are fine, just a build step. Could prototype
  the transport logic on **Node first** (modules are dual-runtime), then swap
  the image to Bare.
- **Tests well:** AVRO-over-Hyperswarm (wire), namespace→topic, multi-peer
  discovery + replication (Hypercore/Autobase), `pear-runtime`/OTA mechanics.
  **Partial:** `flush`/`flushed` timing (clean-LAN ≠ real internet).
  **Does NOT test:** hole-punching / NAT traversal (containers connect
  directly on the bridge or via the local DHT).

## What needs real nodes (traversal)

Hole-punch success across NAT types, symmetric→relay behaviour, and
real-internet timing need **geographically-distributed nodes behind real
NATs** — i.e. **Chapter 8's 2–3 VPS swarm** — or fiddly NAT *emulation*
(network namespaces + iptables; still won't cover all NAT types). Contained
harness proves the **logic**; the distributed swarm proves **traversal**.
Complementary, not either/or.

## Container isolation (for remote/public peers)

Containerising a peer adds **host-side isolation** (namespaces, dropped
capabilities, resource limits) → **blast-radius reduction** if the peer is
compromised. Worth it on exposed nodes. Qualifications:
- **Process isolation, not a hard boundary** (shared kernel; escapes exist).
  VM / gVisor / Kata for higher assurance — usually overkill for a peer.
- **Orthogonal to the P2P crypto model** — it protects the *host from the
  peer*; it doesn't change what the peer exposes on the network (same key
  identity, Noise E2E, DHT announce).
- **NAT-vs-reachability tension** — the same isolation (bridge/overlay) that
  helps security *hurts* hole-punch. On public/inbound-reachable nodes, use
  host networking or explicit UDP port mapping.

## Containers-in-P2P as connectivity-without-config (deployment)

P2P (Hyperswarm/HyperDHT) **replaces manual network configuration** — no
port-forwarding, no static IPs, no VPN: peers find each other by key/topic
and hole-punch. A peer container just needs **UDP egress + the DHT**. This
makes containerised-P2P a strong **deployment** pattern (portable peers, no
per-node net config) — *provided* the orchestrator's own NAT doesn't block
the punch (host networking, or accept relay).

## Kubernetes / k0s specifics

- **Same NAT class as Docker, usually more layers** (pod SNAT + overlay +
  Service/kube-proxy for UDP inbound). Doesn't fix the problem; reproduces it.
- **Intra-cluster pod-to-pod is direct/flat** — fine, but that's logic-only
  testing, like the docker-compose local case.
- **`hostNetwork` (+ `hostPort`)** is the escape hatch — the K8s analog of
  `--network host` — at the cost of pod-level network isolation.
- **Over-engineering caution:** K8s networking is built for
  client-server-behind-Services, which is *at odds* with P2P's
  "be-reachable / punch-holes" model — you end up on `hostNetwork` anyway,
  partly defeating the point. For a few peers (a harness, or a small swarm),
  **docker-compose or plain processes are simpler**. k0s earns its place only
  at genuine **multi-node** scale.
- **Pear has its own deploy/OTA** (`pear stage`/`seed` + `pear-runtime-updater`)
  — overlaps with what k8s does for **Pear-native** components, so it may
  remove the need for k8s on those parts entirely.

## Worked example / test case: home automation

A good case because it's **local-first with a real cross-boundary need**, so
it exercises both modes — and it's a popular, relatable domain (candidate
real-life example + a `pear-full-square` POC).
- **Local LAN: no NAT problem** — components reach each other directly. Local
  orchestration (k0s *if* multi-machine; else compose / systemd / Pear) keeps
  services running.
- **Cross-boundary (remote access, multi-site, identity, encrypted state
  sync): P2P** — no cloud, no port-forward. This is where P2P shines.
- **Layering — "the right place":** the **P2P peer/gateway sits at the network
  edge** (`hostNetwork` / plain process / Pear app outside the overlay) so it
  can hole-punch for remote/multi-site; **local services live behind it** in
  the cluster; internal LAN traffic needs no punch.
- **k8s is optional** (justified by multi-node home hardware); for a single
  box, lean simpler — and check whether Pear's own P2P deploy/OTA removes the
  need for k8s on the P2P-native parts.

## Benchmark plan (settle placement empirically)

Measure **throughput / latency / hole-punch success** across peer placements:
(a) plain LAN process, (b) container bridge / k8s pod (pod-NAT + overlay),
(c) host networking, (d) through-router-NAT (remote / multi-site). The
contained harness + a couple of real nodes (Ch8) is the bench. Output: a
**placement rule grounded in numbers**, not guesses.

## POC implications / next steps

- Build the reusable **"local private DHT + structured-stdout peers"** harness
  in `pear-full-square` (the Chapter 3 fixture).
- Ties to the logged networking POC items (in `documentation/infrastructure-hub.md`):
  hole-punch across NATs, `flush`/`flushed` timing, private-bootstrap ops.
- **Home automation** as a candidate end-to-end POC scenario (and a possible
  splectrum.world *real-life* example later).
- Informs **Ch4** (where the spl peer sits relative to the networking layer)
  and **Ch8** (the VPS swarm = the traversal bench).
- Related deferred decision: `open-questions/test-strategy.md`.
