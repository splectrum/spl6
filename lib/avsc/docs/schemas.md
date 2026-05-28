[avsc — Avro for Bare](./) > Schema Parsing

# Schema Parsing

JSON schemas and Avro IDL — how avsc parses them into Type instances.

---

## JSON Schemas

```javascript
const type = avro.readSchema(`{
  "type": "record",
  "name": "com.example.Entry",
  "fields": [
    { "name": "key", "type": "string" },
    { "name": "value", "type": "bytes" }
  ]
}`)
```

`readSchema` parses JSON text into schema attributes. `Type.forSchema` takes attributes and returns a Type instance.

## Avro IDL

More readable format for protocols with multiple types and messages:

```
@namespace("com.example")
protocol MyProtocol {

  record Entry {
    string key;
    bytes value;
  }

  record Container {
    array<Entry> entries;
  }
}
```

### Parsing IDL

```javascript
// Async — resolves imports from filesystem
avro.assembleProtocol('./protocol.avdl', (err, attrs) => {
  // attrs.types — defined types
  // attrs.messages — defined messages
})
```

### IDL Imports

```
import idl "common-types.avdl";
import schema "external-type.avsc";
import protocol "other-protocol.avpr";
```

Resolved from the filesystem using `bare-fs` and `bare-path`.

## Protocols

A protocol defines types and messages scoped under a name and namespace:

```javascript
{
  protocol: 'Name',
  namespace: 'com.example',
  types: [ /* type definitions */ ],
  messages: {
    method: {
      request: [{ name: 'arg', type: 'string' }],
      response: 'string',
      errors: ['ErrorType'],
      'one-way': false
    }
  }
}
```

Protocols are the bridge to avsc-rpc — avsc parses and resolves the types, avsc-rpc takes the protocol and creates a service.

## Namespaces

Dot-separated paths that qualify type names:

```javascript
'com.example.Entry'  // fully qualified

{
  namespace: 'com.example',
  name: 'Entry'      // resolves to com.example.Entry
}
```

Inner types inherit the namespace of their enclosing type unless explicitly overridden.
