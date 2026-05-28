---
summary: The mycelium data fabric — stream record as universal shape.
---

Mycelium is Splectrum's data fabric. Every value lives as
a stream record (key, value, headers) — Kafka-native,
AVRO-typed, addressable by xpath. Handlers are stream
operators: record in, record out.

Children:
- `xpath` — addressing and node I/O across the fabric
- `process` — execution envelope, dispatch, help
- `git` — git operations exposed as fabric protocols
