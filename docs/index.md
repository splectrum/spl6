# avsc — Avro for Bare

Pure JavaScript [Apache Avro](https://avro.apache.org/docs/1.12.0/specification/) implementation, forked from [mtth/avsc](https://github.com/mtth/avsc) and adapted for the [Bare](https://github.com/holepunchto/bare) runtime.

**Source:** [github.com/bare-for-pear/avsc](https://github.com/bare-for-pear/avsc)

---

## Reference

- [Barification](barification) — what changed from upstream, platform dependencies, polyfills
- [Type System](types) — schema definition, primitives, complex types, logical types, schema evolution
- [Serialization](serialization) — binary encoding, the Tap buffer, schema fingerprints
- [Container Files](containers) — block encoding/decoding streams, file headers, codecs
- [Schema Parsing](schemas) — JSON schemas, Avro IDL, import resolution, namespaces

## Upstream Documentation

The Avro type system API is documented in the upstream wiki. All upstream API documentation applies — the only difference is the runtime:

- [API Reference](https://github.com/mtth/avsc/wiki/API)
- [Quickstart](https://github.com/mtth/avsc/wiki/Quickstart)
- [Advanced Usage](https://github.com/mtth/avsc/wiki/Advanced-usage)
