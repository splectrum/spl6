---
summary: Execution envelope — peels, dispatches, packs.
---

The execution envelope wraps an inner record with context
(`mode`, `root`). Peels the inner record from `value`, unpacks
the execute context, propagates it as a header on the inner
record, dispatches, then packs the result for the boundary
crossing.

In-memory, handlers see plain objects. On the wire, values
are AVRO bytes. Execute is the boundary where the packing
happens.
