# avsc-rpc API Reference

Complete API reference for avsc-rpc — Avro RPC
protocol layer for the Bare runtime.

---

## Module Exports

```javascript
const {
  Service,
  Message,
  Adapter,
  Registry,
  discoverProtocol,
  HANDSHAKE_REQUEST_TYPE,
  HANDSHAKE_RESPONSE_TYPE,
  streams
} = require('avsc-rpc')
```

---

## Service

The central class. A Service represents an Avro
protocol — a named collection of typed messages.

### Service.forProtocol(ptcl, [opts])

Create a Service from an Avro protocol definition.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `ptcl` | object | Protocol definition |
| `opts.namespace` | string | Default namespace for unqualified names |
| `opts.registry` | object | Shared type registry |

**Protocol structure:**

```javascript
{
  protocol: 'Name',
  namespace: 'com.example',
  doc: 'Optional documentation',
  types: [
    // Record, enum, fixed definitions
  ],
  messages: {
    methodName: {
      request: [
        { name: 'arg1', type: 'string' },
        { name: 'arg2', type: 'bytes' }
      ],
      response: 'string',
      errors: ['ErrorType'],   // optional
      'one-way': false,        // optional, default false
      doc: 'Description'       // optional
    }
  }
}
```

**Returns:** Service

### Service.compatible(clientSvc, serverSvc)

Check whether a client's protocol can communicate with
a server's protocol. Uses Avro type resolution — the
same mechanism as schema evolution.

**Returns:** boolean

### Service.isService(any)

**Returns:** boolean

### service.createClient([opts])

Create an RPC client for this service.

**Options:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `buffering` | boolean | `false` | Buffer calls when no channel active |
| `cache` | object | `{}` | Remote protocol cache (deprecated) |
| `channelPolicy` | function | — | `(channels) => channel` selection |
| `strictTypes` | boolean | `false` | Strict error type coercion |
| `timeout` | number | `10000` | Default message timeout (ms) |
| `remoteProtocols` | object | — | Pre-cached remote protocols |
| `server` | Server | — | In-memory server (auto-connects) |
| `transport` | Stream/function | — | Transport (auto-creates channel) |

**Returns:** Client

### service.createServer([opts])

Create an RPC server for this service.

**Options:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `defaultHandler` | function | — | Handler for unmapped messages |
| `systemErrorFormatter` | function | — | `(err) => string` for wire errors |
| `silent` | boolean | `false` | Suppress console error output |
| `strictTypes` | boolean | `false` | Strict error/response type coercion |
| `remoteProtocols` | object | — | Pre-cached remote protocols |
| `noCapitalize` | boolean | `false` | Don't capitalise generated method names |
| `cache` | object | `{}` | Remote protocol cache (deprecated) |

**Returns:** Server

### service.message(name)

Get a Message by name.

**Returns:** Message or undefined

### service.type(name)

Get a Type by name.

**Returns:** Type or undefined

### Properties

| Name | Type | Description |
|------|------|-------------|
| `name` | string | Qualified service name |
| `messages` | Message[] | Frozen array of messages |
| `types` | Type[] | Frozen array of types |
| `protocol` | object | Protocol schema object |
| `hash` | Buffer | MD5 fingerprint of protocol |
| `doc` | string | Documentation (if provided) |

---

## Client

Emits typed messages to a remote (or local) server.

### client.createChannel(transport, [opts])

Add a communication channel.

**Transport parameter:**

| Form | Channel Type | Description |
|------|-------------|-------------|
| Stream | Stateful | Duplex stream (e.g. TCP socket) |
| `{readable, writable}` | Stateful | Separate stream pair |
| function | Stateless | `(cb) => writable` factory, calls `cb(err, readable)` |

**Options:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `objectMode` | boolean | `false` | Object passing (no serialisation) |
| `noPing` | boolean | `false` | Skip initial handshake ping |
| `timeout` | number | client timeout | Per-channel timeout (ms) |
| `endWritable` | boolean | `true` | End writable on destroy |
| `scope` | string | — | Message ID namespace |
| `serverHash` | Buffer | — | Pre-populate protocol adapter |

**Returns:** StatefulClientChannel or StatelessClientChannel

### client.destroyChannels([opts])

Destroy all active channels.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `opts.noWait` | boolean | `false` | Destroy immediately without draining |

### client.emitMessage(name, req, [opts], [cb])

Send a message explicitly.

| Name | Type | Description |
|------|------|-------------|
| `name` | string | Message name |
| `req` | object | Request data |
| `opts` | object | Options (timeout override) |
| `cb` | function | `(err, response) => void` |

### client.remoteProtocols()

**Returns:** object — cached remote protocols keyed by hash

### client.use(fn, ...)

Add middleware. See [Middleware](#middleware).

**Returns:** this (chainable)

### client.activeChannels()

**Returns:** Channel[]

### Generated Methods

For each message in the service, a method is generated:

```javascript
client.methodName(field1, field2, ..., [opts], [cb])
```

Request fields are spread as positional arguments.
Optional `opts` object for per-call options. Optional
`cb` callback.

```javascript
// For message: exec(message: Message) => Message
client.exec(message, (err, response) => { ... })

// With options
client.exec(message, { timeout: 5000 }, (err, response) => { ... })
```

### Events

| Event | Args | Description |
|-------|------|-------------|
| `'channel'` | channel | New channel created |
| `'error'` | err | Error when no callback provided |

---

## Server

Receives messages and dispatches to handlers.

### server.createChannel(transport, [opts])

Create a server channel. Transport and options same as
client.createChannel.

**Returns:** StatefulServerChannel or StatelessServerChannel

### server.onMessage(name, handler)

Register a handler for a message.

| Name | Type | Description |
|------|------|-------------|
| `name` | string | Message name |
| `handler` | function | Handler function |

Handler signatures:

```javascript
// Two-way message — expanded fields
server.onMessage('exec', function (message, cb) {
  // this is CallContext
  cb(null, response)
})

// One-way message — no callback
server.onMessage('notify', function (event) {
  // fire and forget
})
```

**Returns:** this (chainable)

### server.remoteProtocols()

**Returns:** object — cached remote protocols keyed by hash

### server.use(fn, ...)

Add middleware. See [Middleware](#middleware).

**Returns:** this (chainable)

### server.activeChannels()

**Returns:** ServerChannel[]

### Generated Methods

For each message, an `on<Name>` method is generated:

```javascript
server.onExec(function (message, cb) {
  cb(null, response)
})
```

With `noCapitalize: true`:

```javascript
server.on_exec(function (message, cb) { ... })
```

### Events

| Event | Args | Description |
|-------|------|-------------|
| `'channel'` | channel | New channel created |
| `'error'` | err | System error |

---

## Channels

Channels manage the connection between a client and
server. Created via `createChannel()` on either side.

### Common Properties

| Name | Type | Description |
|------|------|-------------|
| `client` / `server` | Client/Server | Parent instance |
| `pending` | number | Count of in-flight messages |
| `destroyed` | boolean | Whether channel is destroyed |
| `draining` | boolean | Waiting for pending to clear |

### channel.destroy([noWait])

Destroy the channel.

| Value | Behaviour |
|-------|-----------|
| omitted / `false` | Wait for pending messages to complete |
| `true` | Destroy immediately |
| Error | Destroy immediately, emit error |

### channel.ping([timeout], [cb])

*(Client channels only.)* Send a ping to verify
connectivity and trigger handshake.

| Name | Type | Description |
|------|------|-------------|
| `timeout` | number | Ping timeout (ms) |
| `cb` | function | `(err) => void` |

### Client Channel Events

| Event | Args | Description |
|-------|------|-------------|
| `'handshake'` | hreq, hres | Protocol negotiation complete |
| `'outgoingCall'` | context, opts | Message about to be sent |
| `'eot'` | pending, err | Channel ended |

### Server Channel Events

| Event | Args | Description |
|-------|------|-------------|
| `'handshake'` | hreq, hres | Protocol negotiation complete |
| `'incomingCall'` | context | Message received |
| `'eot'` | pending, err | Channel ended |

### Stateful Channels

Used with persistent connections (TCP, in-memory).
Single handshake, then multiplexed messages.

```javascript
// Client
const channel = client.createChannel(socket)

// Server
server.createChannel(socket)
```

### Stateless Channels

Used with request-response protocols (HTTP). Handshake
with every message. Factory function called per
message.

```javascript
// Client
client.createChannel(function (cb) {
  const req = http.request(opts, (res) => cb(null, res))
  cb(null, req)
})

// Server
server.createChannel(function (cb) {
  // cb(null, writable) for response
})
```

---

## Message

Represents a single RPC method definition with typed
request, response, and error schemas.

### Message.forSchema(name, schema, [opts])

Create a Message from a schema definition.

| Name | Type | Description |
|------|------|-------------|
| `name` | string | Message name |
| `schema` | object | `{ request, response, errors, 'one-way', doc }` |
| `opts` | object | `{ namespace, registry }` |

**Returns:** Message

### message.schema([opts])

Get the message's schema definition.

| Name | Type | Description |
|------|------|-------------|
| `opts.exportAttrs` | boolean | Include doc and other attributes |
| `opts.noDeref` | boolean | Don't dereference named types |

**Returns:** object

### Properties

| Name | Type | Description |
|------|------|-------------|
| `name` | string | Message name |
| `requestType` | Type | Avro record type for request |
| `responseType` | Type | Avro type for response |
| `errorType` | Type | Avro union type for errors |
| `oneWay` | boolean | Fire-and-forget flag |
| `doc` | string | Documentation |

---

## Middleware

Both client and server support bidirectional
middleware chains.

### Signature

```javascript
function middleware (wreq, wres, next) {
  // Before: inspect or modify outgoing request
  next(null, function (err, prev) {
    // After: inspect or modify incoming response
    prev(err)
  })
}
```

### wreq (WrappedRequest)

| Property | Type | Description |
|----------|------|-------------|
| `header` | object | Message header (method name) |
| `request` | object | Typed request data |

### wres (WrappedResponse)

| Property | Type | Description |
|----------|------|-------------|
| `response` | object | Typed response (after handler) |
| `error` | any | Error value (after handler) |

### CallContext

Available as `this` in handlers and via the
`'outgoingCall'` / `'incomingCall'` events.

| Property | Type | Description |
|----------|------|-------------|
| `channel` | Channel | The channel |
| `message` | Message | The message definition |
| `locals` | object | Shared state between middleware |

### Chain Execution

```
middleware 1 forward
  middleware 2 forward
    handler
  middleware 2 backward
middleware 1 backward
```

Forward phase runs before the handler. Backward phase
runs after the handler returns. Errors short-circuit
the chain.

---

## discoverProtocol(transport, [opts], cb)

Discover a remote server's protocol without prior
knowledge.

| Name | Type | Description |
|------|------|-------------|
| `transport` | Stream/function | Transport to remote server |
| `opts.timeout` | number | Handshake timeout (ms) |
| `opts.scope` | string | Message ID scope |
| `cb` | function | `(err, protocol) => void` |

Sends a handshake with an intentionally wrong hash.
The server responds with its full protocol definition.

```javascript
discoverProtocol(transport, (err, protocol) => {
  const service = Service.forProtocol(protocol)
})
```

---

## Stream Codecs

Four streamx.Transform classes for wire encoding:

### streams.FrameDecoder

Standard Avro frame decoding. Variable-length frames
terminated by a zero-length frame.

### streams.FrameEncoder

Standard Avro frame encoding.

### streams.NettyDecoder

Java Netty-compatible frame decoding. 4-byte message
ID prefix enables multiplexing.

### streams.NettyEncoder

Java Netty-compatible frame encoding.

**Wire formats:**

Standard framing:
```
[length: 4 bytes BE] [payload]
...
[0x00000000]  — terminator
```

Netty framing:
```
[messageID: 4 bytes] [frameCount: 4 bytes]
[length: 4 bytes BE] [payload]
...
```

---

## Handshake Types

### HANDSHAKE_REQUEST_TYPE

Avro record type for handshake requests:

```
HandshakeRequest {
  clientHash:     fixed(16)       — MD5 of client protocol
  clientProtocol: union(null, string) — full protocol if needed
  serverHash:     fixed(16)       — expected server hash
  meta:           union(null, map<bytes>) — optional metadata
}
```

### HANDSHAKE_RESPONSE_TYPE

Avro record type for handshake responses:

```
HandshakeResponse {
  match:          enum(BOTH, CLIENT, NONE)
  serverProtocol: union(null, string) — full protocol if mismatch
  serverHash:     union(null, fixed(16)) — server's actual hash
  meta:           union(null, map<bytes>) — optional metadata
}
```

---

## Registry

Internal callback registry for tracking pending
messages by ID.

### new Registry(ctx, prefixLength)

| Name | Type | Description |
|------|------|-------------|
| `ctx` | any | Context passed to callbacks |
| `prefixLength` | number | Bit length of ID prefix |

### registry.add(timeout, fn)

Register a pending callback.

| Name | Type | Description |
|------|------|-------------|
| `timeout` | number | Timeout in ms (0 = none) |
| `fn` | function | `(err, resBuf, adapter) => void` |

**Returns:** number — assigned message ID

### registry.get(id)

**Returns:** function or undefined

### registry.clear()

Clear all pending callbacks. Each receives
`Error('interrupted')`.

---

## Adapter

Resolves messages between different protocol versions.
Created automatically during handshake when client and
server have compatible but non-identical protocols.

Uses Avro type resolution to translate between
protocol versions — the same mechanism as schema
evolution applied at the protocol level.

---

*MIT License — same as upstream avsc.*
