[avsc — Avro for Bare](./) > Container Files

# Container Files

Self-describing binary files that embed the writer schema with the data.

---

## What Containers Are

An Avro container file bundles a header (magic bytes, writer schema, sync marker, codec) with data blocks (sequences of records). The writer schema travels with the data — any compatible reader can decode the contents without external coordination.

## Reading

```javascript
avro.createFileDecoder('./data.avro')
  .on('metadata', (type) => { /* writer's schema */ })
  .on('data', (val) => { /* decoded record */ })
```

With a reader schema (schema evolution):

```javascript
avro.createFileDecoder('./data.avro', { readerType })
  .on('data', (val) => { /* decoded through reader's lens */ })
```

## Writing

```javascript
const encoder = avro.createFileEncoder('./out.avro', schema)
encoder.write({ key: '/path', value: Buffer.from('data') })
encoder.end()
```

## Header Extraction

Synchronous header reading:

```javascript
const header = avro.extractFileHeader('./data.avro')
// header.meta['avro.schema'] — parsed writer schema
// header.meta['avro.codec'] — compression codec
// header.sync — 16-byte sync marker
```

## Stream Classes

```javascript
const { BlockDecoder, BlockEncoder, RawDecoder, RawEncoder } = avro.streams
```

| Class | Description |
|-------|-------------|
| `BlockDecoder` | Decodes container-format input |
| `BlockEncoder` | Encodes records into container blocks |
| `RawDecoder` | Decodes raw Avro binary (no container framing) |
| `RawEncoder` | Encodes records as raw Avro binary |

All use `bare-stream` Duplex in the fork.

## Container Structure

```
[magic: 4 bytes "Obj\x01"]
[header: avro record]
  meta: map<string, bytes>
    "avro.schema": writer schema as JSON
    "avro.codec": "null" | "deflate" | "snappy"
  sync: 16 bytes
[block]*
  count: long
  size: long
  data: bytes (possibly compressed)
  sync: 16 bytes (must match header)
```
