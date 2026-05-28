[avsc — Avro for Bare](./) > Serialization

# Serialization

Avro binary encoding — compact, deterministic, schema-driven.

---

## Binary Encoding

No field names in the output, no type tags on primitives. The schema is the codec.

```javascript
const type = avro.Type.forSchema({
  type: 'record',
  name: 'Entry',
  fields: [
    { name: 'key', type: 'string' },
    { name: 'value', type: 'bytes' }
  ]
})

const buf = type.toBuffer({ key: '/path', value: Buffer.from('data') })
const val = type.fromBuffer(buf)
```

## Encoding Sizes

| Type | Size |
|------|------|
| Null | 0 bytes |
| Boolean | 1 byte |
| Int/Long | 1-10 bytes (zigzag varint) |
| Float | 4 bytes (IEEE 754) |
| Double | 8 bytes (IEEE 754) |
| Bytes/String | varint length + content |
| Record | concatenated field encodings |
| Array | blocks of [count, items...], terminated by 0 |
| Map | blocks of [count, [key, value]...], terminated by 0 |
| Union | varint branch index + branch encoding |
| Enum | varint symbol index |
| Fixed | raw bytes (size from schema) |

No framing, no delimiters, no padding. The encoding is fully determined by the schema.

## The Tap

avsc's internal binary reader/writer — a cursor over a byte buffer.

```javascript
const { Tap } = require('avsc/lib/utils')

const buf = new Uint8Array(1024)
const tap = new Tap(buf)

tap.writeLong(42)
tap.writeString('hello')

tap.pos = 0
tap.readLong()    // 42
tap.readString()  // 'hello'
```

Integers use zigzag varint encoding — small values take fewer bytes.

## Schema Fingerprints

Deterministic hash of a schema's canonical JSON representation.

```javascript
const fp = type.fingerprint('md5')  // 16-byte Buffer
```

Used in the RPC handshake — client and server compare fingerprints to determine protocol compatibility. The `platform.js` module provides `getHash()` using `bare-crypto`.
