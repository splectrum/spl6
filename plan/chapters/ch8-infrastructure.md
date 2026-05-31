# Chapter 8 — Infrastructure

**Status: ⬜ not started.**

### 5.1 splectrum.world private swarm

2-3 VPS nodes (Hetzner/DigitalOcean, ~$5/month each), HyperDHT
bootstrap, DNS records (node1/2/3.splectrum.world). Own swarm, own
namespace.

### 5.2 Always-on availability evaluation

Assess the always-on availability options — blind custody, cross-NAT
access, keeping cores/autobases available when the publisher is offline.
Candidates: the first-party set (**blind-peering** mirrors,
**blind-relay** TURN-like, **@hyperswarm/seeders** pinning) and the
community **HiveRelay** (`bigdestiny2/P2P-Hiverelay`, Apache-2.0 —
promising but pre-1.0; track, don't depend yet). Not a build item — an
evaluation with a recommendation.

### 5.3 Git remote on Hyperdrive (exploration)

Can a bare git repo live on a Hyperdrive, accessible to any peer on
the swarm? Replaces GitHub as coordination point. Exploratory — may
be premature.
