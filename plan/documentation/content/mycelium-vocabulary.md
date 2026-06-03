# Mycelium Vocabulary

Engineering vocabulary grounded in the seed (P0–P5). The seed vocabulary
is partial — only what is translated from the principles. Terms are
extended for the P2P substrate where the seed doesn't yet cover a concept.
This page will grow.

## From the seed

**Data entity** — object structure with data and associated functionality.

**Data owner** — holder of a set of data entities. The subject in
engineering terms.

**Data state** — the owner's data reality, in a data repository.

**Data world** — totality of data state across all owners. In a P2P swarm,
the data world is enumerable — a full listing of all active data is
achievable, though individual owners hold subviews.

**Data world subview** — the total view achievable from a data repository.
Partial relative to the data world.

**Protocol** — engineering artefact of a language game. An API with meaning
— the action vocabulary in its operators makes it a meaning unit, not just
a technical interface.

**Operator** — protocol method.

**Persona** — structured set of protocols taking on a role.

**Data state propagation** — change becomes visible through the fabric.
Visibility is sharing, no separate mechanism.

## Extended for the P2P substrate

**Data repository** — the git repository on the P2P substrate that
constitutes a data owner's reality. The boundary, identity, and history.

**Topic** — a Hypercore log carrying immutable data change event records
in Kafka record shape. The owning data repository maintains the topic;
other repos subscribe.

**Topic reference** — a data owner's declared dependency on a remote topic.
Lives in git as versioned wiring. The mechanism is subscription + sparse
replication.

**Peer** — the physical runtime hosting one or more data owners.
Infrastructure vocabulary — the owner is the logical entity, the peer is
the physical host.

**Functionality as metadata** — the engineering commitment. What lives in
metadata are the schemas (contracts describing protocols and operators) and
references. Code (operator implementations) is content, stored in git. The
metadata describes the functionality; the content implements it.
