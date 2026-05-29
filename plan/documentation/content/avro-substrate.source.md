---
layout: default
lastmod: 2026-05-03
title: "AVRO"
---

[Home](/) > [Engineering](/engineering/) > [Substrate](/engineering/substrate/) > AVRO

# AVRO

AVRO is constitutive to mycelium alongside git. Git provides the subject reality boundary. AVRO provides the language of articulation.

AVRO is load-bearing across every layer — core API, schema contracts, protocol registration, service routing, record interpretation, boundary interfaces. Mechanisms that appear distinct at different layers turn out to be one thing expressed through schemas in fabric metadata.

## Architectural decisions

**Relational, not representational.** No schema registry. Schemas live in fabric metadata as facts — present or absent. A reader schema does not ask "is this record type X"; it asks "can this record be read as X." The same record may conform to multiple reader schemas simultaneously. Conformance is discovered at the point of contact, not assigned by an authority.

**Schemas in metadata, not injected.** Context metadata cascades during traversal. When XPath resolves a path, it accumulates metadata — including schemas in scope. Record interpretation is not a separate concern; it's a consequence of schemas being present along the path. No schema present, no internal visibility — architecture of absence. No injection verb.

**Carrier and meaning separation.** The data schema is the carrier language; the schema name (namespace path) resolves the meaning language. The data schema carries content without committing to what it means. The namespace places that structure into a meaning context — it declares which language game is being played. Multiple conformance is multiple readings through different meaning languages — same carrier, different namespace, different result. AVRO's nominal gate (name check before structural resolution) enforces language commitment natively.

## Type system and resolution

**Physical and logical types.** Physical types carry data structure; logical types declare functional capability. AVRO carries both dimensions on the same type definition. A single schema identifier IS both concept (physical structure) and protocol operation (logical capability). "Put it there" — put is an operation (logical). "What is put?" — put is data (physical). Same AVRO identifier, both dimensions coexist. Every operation is both invokable and queryable.

**Resolution axes.** Physical types resolve within data scope — forward-looking from process POV into self and descendants. Logical types resolve on the ancestor axis — from process POV up to subject reality root. The carrier/meaning split expressed as axis selection. A logical type is discovered on the ancestor axis; what it produces is a physical schema that lands in the data scope.

**Protocol and concept.** Protocol is the meaning context for operations. Concept is the meaning context for data schemas. Both under mycelium — `spl.mycelium.protocol` and `spl.mycelium.concept`. Protocol flavours generic operations (get, put, remove). Concept flavours generic data structures (table, record, list). A table in natural language, in Victorian times, in prehistoric times — different schema flavours, all readable as a natural language table.

**Versioning as resolution.** Versioning is metadata, not name. Compatibility becomes: does a functional implementation exist that can read this data? A discovery, not a policy.

- *Latest* — highest version, input must conform to latest schema.
- *Adaptive* — highest version whose reader schema can read the input. The data determines which implementation handles it.

Header metadata annotates the handler identified — full traceability. Degradation is two-stage: first same-logical-type (is there a version that can read this?), then alternative-logical-type (which alternative handles this?). Exception handling becomes orthogonal — just more logical types available for resolution. Max version as context metadata constrains the adaptive range.

## AVRO's role in the fabric

**Core API — get, put, remove as AVRO RPC.** The three substrate operations expressed as AVRO RPC schemas. XPath expression represented in the AVRO message. Opaque content carried in request and response bodies. Uniform return shape `[{key, value}, ...]` as an AVRO schema. Flat addressing and query expressions handled uniformly in the same schema.

**Reader schema as process contract.** A process declares its reader schema — what it needs from its input records. The reader schema is the process's lens, not the record's identity. The footprint watcher uses reader schema conformance to verify completeness — "can these records be read as my input type." Reader and writer schemas evolve independently; AVRO compatibility rules are the native mechanism. No custom versioning machinery.

**Protocol library registration.** Each protocol library owns a namespace branch. Operations within that branch are reachable through the namespace path. No flat registry; facts in the fabric. Language composition without collision: two languages can define an operation with the same local name (`compare`, `validate`, `transform`) and never conflict because the namespace path disambiguates. The local name is the operation; the path is the language context.

**Process invocation.** A complete input footprint becomes an AVRO message that triggers a transformation. RPC binding is configured on the input message schema — the schema determines routing. Local versus remote execution: same schema, different binding. Reading data through a meaning language is an RPC call through that namespace. Schema discovery, process invocation, and data interpretation collapse into one pattern: namespace identifies the language, data schema specifies the carrier contract, RPC enforces the boundary.

**Three levels of opacity.** The architecture exhibits the same pattern at three levels:

- *Fabric:* key mapped to opaque bytes. The fabric does not interpret content.
- *Process management:* input schema mapped to output schema. The management layer does not interpret the transformation.
- *Execution:* what runs behind the RPC boundary is invisible. Human, AI, local, remote — same schema contract, same process report.

**Record internal structure.** A schema discovered during traversal is used as a reader schema against record content. XPath resolution transitions from fabric navigation to record-internal navigation using the discovered schema. AVRO containers embed the writer schema with the data; reader schema is discovered in context; AVRO's native resolution handles the mapping. The same record may be readable through different reader schemas in different contexts — different structured views of the same data.

**Namespacing as architectural.** The namespace tree is simultaneously the catalogue of available languages, the catalogue of operations within each language, and the routing structure for invocation. Namespace paths are not predefined hierarchy entries — they are assembled from segments that exist independently as facts in the fabric. Carrier segment, meaning domain segment, operation segment — composed at the point of use. The act of composing the namespace is the act of creating a specific language application (P0 — the boundary is the creation). Paths that nobody composes don't exist.

**Compound operations.** Move and copy are compositions in mycelium's own process protocol library. Expressed as AVRO RPC schemas, composed from the three substrate operations. Atomicity in the schema.

**Boundary interfaces.** A subject reality declares what it exposes — which operations, which schemas. Subject-to-subject interaction runs through AVRO RPC boundaries. The security model intersects AVRO at the boundary, not inside.

## RPC as constitutive dependency

AVRO RPC is not a transport mechanism. It is the process boundary enforcement mechanism.

**Separation, not communication.** Two processes communicating through RPC can only see each other through the schema contract. No shared objects, no classpath leakage, no hidden state. Even in local in-memory execution, the boundary guarantees only schema-conformant messages pass.

**Process management opacity.** Because RPC enforces the boundary, the process management layer stays agnostic to execution internals. It sees: input complete, transformation invoked, output landed. What happened inside is not its concern. This is what makes the HAICC work division — human or AI behind the boundary — invisible to process management.

**Transport as deployment concern.** Transport pluggability is a consequence, not the motivation. The same schema contract holds whether the transport is in-memory, TCP, or HTTP. The boundary is invariant.

**Mechanically enforced process separation.** Without RPC, process separation is a convention. With RPC, it is a physical fact — no transitive dependencies between processes.

## Implementation

**avsc** — the pure JavaScript AVRO implementation. Full spec coverage in a single library (~51kB), no framework dependencies. Serialization, schema evolution, protocol definition, RPC with transport pluggability (in-memory, TCP, HTTP), middleware chain, IDL support, browser-capable distributions.

**Why JavaScript.** Minimal code surface. Transport dependencies are Node.js built-ins (`net`, `http`). No build toolchain for the core layer. Dynamic language aligns with AVRO's design philosophy — code generation not required. Same runtime as isomorphic-git.

**Transport pluggability.** Handler code is transport-agnostic. Same service definition works across in-memory (for local testing and subject-internal operations), TCP (for inter-process communication), and HTTP (for boundary interfaces).

**Bare ready.** Complete primitive available immediately — protocol definition, server creation, handler registration, client creation, message invocation. Prototyping against the real mechanism from day one.

**Note on AVRO RPC in the industry.** The industry has largely moved to gRPC, driven by HTTP/2 streaming. Mycelium's primary interaction mode is data state propagation, not streaming. The RPC need is surgical — schema-routed invocation at specific moments. AVRO RPC's transport-independent framing and pluggable transport fit the mycelium pattern more precisely than gRPC; transport pluggability for local-first deployment is what mycelium needs.
