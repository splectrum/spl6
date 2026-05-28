[avsc — Avro for Bare](./) > Type System

# Type System

The Avro type system as implemented in avsc.

---

## Type.forSchema

The primary entry point. Takes an Avro schema definition and returns a Type instance.

```javascript
const avro = require('avsc')

const type = avro.Type.forSchema({
  type: 'record',
  name: 'Example',
  fields: [
    { name: 'id', type: 'long' },
    { name: 'name', type: 'string' }
  ]
})
```

### Options

| Option | Description |
|--------|-------------|
| `logicalTypes` | Map of logical type names to implementations |
| `namespace` | Default namespace for unqualified names |
| `noAnonymousTypes` | Require all types to be named |
| `registry` | Shared type registry for cross-schema references |
| `typeHook` | Intercept type creation |
| `wrapUnions` | Union representation strategy |

## Type.forValue

Infers a schema from a JavaScript value.

```javascript
const type = avro.Type.forValue({
  key: '/path',
  value: Buffer.from('data')
})
```

## Primitive Types

| Avro Type | JavaScript Type | Size |
|-----------|----------------|------|
| `null` | `null` | 0 bytes |
| `boolean` | `boolean` | 1 byte |
| `int` | `number` | 1-5 bytes (varint) |
| `long` | `number` | 1-10 bytes (varint) |
| `float` | `number` | 4 bytes |
| `double` | `number` | 8 bytes |
| `bytes` | `Buffer` | variable |
| `string` | `string` | variable |

## Complex Types

### Record

Named type with ordered fields.

```javascript
{
  type: 'record',
  name: 'com.example.Entry',
  fields: [
    { name: 'key', type: 'string' },
    { name: 'value', type: ['null', 'bytes'], default: null }
  ]
}
```

### Enum

```javascript
{ type: 'enum', name: 'Mode', symbols: ['SYNC', 'ASYNC'] }
```

### Array

```javascript
{ type: 'array', items: 'string' }
```

### Map

```javascript
{ type: 'map', values: 'bytes' }
```

### Union

```javascript
['null', 'string', 'bytes']
```

### Fixed

```javascript
{ type: 'fixed', name: 'Hash', size: 16 }
```

## Logical Types

Attach semantic meaning to a physical type.

```javascript
class TimestampType extends avro.types.LogicalType {
  _fromValue (val) { return new Date(val) }
  _toValue (date) { return +date }
  _resolve (type) {
    if (avro.Type.isType(type, 'long')) return this._fromValue
  }
}

const type = avro.Type.forSchema({
  type: 'long',
  logicalType: 'timestamp'
}, { logicalTypes: { timestamp: TimestampType } })
```

## Schema Evolution

Writer schema versus reader schema resolution — Avro's native compatibility mechanism.

```javascript
const writerType = avro.Type.forSchema({
  type: 'record', name: 'Event',
  fields: [
    { name: 'id', type: 'long' },
    { name: 'name', type: 'string' }
  ]
})

const readerType = avro.Type.forSchema({
  type: 'record', name: 'Event',
  fields: [
    { name: 'id', type: 'long' },
    { name: 'name', type: 'string' },
    { name: 'source', type: 'string', default: 'unknown' }
  ]
})

const resolver = readerType.createResolver(writerType)
const val = readerType.fromBuffer(buf, resolver)
```

### Resolution Rules

- **Reader adds field with default** — compatible
- **Writer has extra fields** — compatible (ignored)
- **Type promotion** — int to long, float to double
- **Name mismatch** — incompatible (nominal gate)

## Type Methods

| Method | Description |
|--------|-------------|
| `toBuffer(val)` | Encode value to binary |
| `fromBuffer(buf, resolver?, noCheck?)` | Decode binary to value |
| `isValid(val)` | Check value conforms |
| `compare(val1, val2)` | Sort-order comparison |
| `compareBuffers(buf1, buf2)` | Binary-level comparison |
| `clone(val, opts?)` | Deep copy with optional coercion |
| `createResolver(writerType)` | Schema evolution resolver |
| `schema(opts?)` | Return the JSON schema |
| `fingerprint(algorithm?)` | Schema hash |
| `random()` | Generate random conforming value |
