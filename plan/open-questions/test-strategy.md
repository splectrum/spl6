# Open question — Test strategy

**When to address:** with Chapter 3/4 (when P2P enters the picture).

Does the harness become a swarm peer, or does it test via TCP locally
with a separate integration suite for P2P?

See `../p2p-test-deployment-findings.md` for the worked-through harness
pattern (local private DHT + structured-stdout peers, monitored via
container logs; contained-testing vs distributed-traversal modes; the
translation-layer/hole-punch principle). It informs but doesn't yet settle
this question — decide alongside the Chapter 3 POCs.
