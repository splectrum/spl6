# avsc-rpc — Avro RPC for Bare

AVRO RPC protocol layer for the [Bare](https://github.com/holepunchto/bare) runtime. Extracted from [mtth/avsc](https://github.com/mtth/avsc) v5 before the RPC layer was removed in v6.

Provides service definition, client/server creation, middleware, and transport channels (in-memory, TCP, HTTP).

## Origin

The RPC/IPC layer was removed from avsc in v6 ([PR #428](https://github.com/mtth/avsc/pull/428)) as part of a modernisation effort. This module preserves it as a standalone library, adapted for the Bare runtime.

Extracted from commit `dd82783` of mtth/avsc — the ES6-converted codebase, last version with services.

## What Changed

**Stream transport:** All stream classes use [streamx](https://github.com/mafintosh/streamx) `Transform` instead of Node.js `stream.Transform`. This means:
- Two-parameter `_transform(buf, cb)` — no encoding argument
- No `.unpipe()` — streamx handles stream lifecycle differently

**Module dependencies:** Node.js built-ins replaced with Bare equivalents:

| Module | Upstream | Fork |
|--------|----------|------|
| Buffer | `buffer` | `bare-buffer` |
| Events | `events` | `bare-events` |
| Streams | `stream` | `bare-stream` |
| Transform | `stream.Transform` | `streamx.Transform` |

**v5/v6 compatibility bridge** (`compat.js`):
- `process.nextTick` polyfill via `queueMicrotask` for Bare
- Hash result wrapping — v6 avsc returns `Uint8Array`, services code expects `Buffer`
- Restored `newBuffer`, `bufferFrom`, `addDeprecatedGetters` removed in v6

**Peer dependency:** Requires [bare-for-pear/avsc](https://github.com/bare-for-pear/avsc) — the types and utils modules are imported directly from the avsc sibling directory.

## API

```javascript
const { Service } = require('avsc-rpc')
```

### Defining a Service

```javascript
const service = Service.forProtocol({
  protocol: 'Echo',
  messages: {
    echo: {
      request: [{ name: 'message', type: 'string' }],
      response: 'string'
    }
  }
})
```

### Server

```javascript
const server = service.createServer()

// Register handler
server.onEcho((message, cb) => {
  cb(null, message)
})
```

### Client

```javascript
const client = service.createClient()

// Call remote method
client.echo('hello', (err, response) => {
  console.log(response) // 'hello'
})
```

### Transports

#### In-Memory

Direct client-to-server, no serialization overhead:

```javascript
const client = service.createClient({ server })

client.echo('hello', (err, res) => { ... })
```

#### TCP (Stateful)

Persistent connection with single handshake and multiplexed messages:

```javascript
const net = require('bare-net')

// Server side
const tcpServer = net.createServer((socket) => {
  server.createChannel(socket)
})
tcpServer.listen(8090)

// Client side
const socket = net.connect(8090)
client.createChannel(socket)
```

#### HTTP (Stateless)

Request-response pattern with handshake per message:

```javascript
client.createChannel((cb) => {
  // Return writable stream, call cb(err, readable) with response
  const req = http.request(opts, (res) => cb(null, res))
  cb(null, req)
})
```

#### Transport Options

| Option | Default | Description |
|--------|---------|-------------|
| `objectMode` | `false` | `true` for in-memory object passing, `false` for binary framing |
| `noPing` | `false` | Skip initial handshake ping |
| `timeout` | `10000` | Per-channel timeout in ms |
| `endWritable` | `true` | End writable stream after stateless request |
| `scope` | — | Message ID scoping via hash |

### Middleware

Both client and server support middleware chains:

```javascript
client.use((wreq, wres, next) => {
  // wreq — writable request (outgoing)
  // wres — writable response (incoming)
  console.log('calling:', wreq.header.method)
  next()
})

server.use((wreq, wres, next) => {
  // Add tracing, auth, logging, etc.
  next()
})
```

### Protocol Discovery

Discover a remote server's protocol without knowing it in advance:

```javascript
const { discoverProtocol } = require('avsc-rpc')

discoverProtocol(transport, (err, protocol) => {
  const service = Service.forProtocol(protocol)
  // Now create a client for the discovered service
})
```

### Stream Encoders/Decoders

Low-level framing for custom transport implementations:

```javascript
const { streams } = require('avsc-rpc')

// Standard Avro framing
const decoder = new streams.FrameDecoder()
const encoder = new streams.FrameEncoder()

// Java Netty-compatible framing (interop with JVM implementations)
const decoder = new streams.NettyDecoder()
const encoder = new streams.NettyEncoder()
```

### Full Export

```javascript
module.exports = {
  Service,                   // Service definition and factory
  Message,                   // Message schema definition
  Adapter,                   // Protocol compatibility resolver
  Registry,                  // Callback registry for pending calls
  HANDSHAKE_REQUEST_TYPE,    // Avro type for handshake request
  HANDSHAKE_RESPONSE_TYPE,   // Avro type for handshake response
  discoverProtocol,          // Remote protocol discovery
  streams: {
    FrameDecoder,            // Standard Avro frame decoder
    FrameEncoder,            // Standard Avro frame encoder
    NettyDecoder,            // Netty-compatible frame decoder
    NettyEncoder             // Netty-compatible frame encoder
  }
}
```

### Service Class

| Method | Description |
|--------|-------------|
| `Service.forProtocol(ptcl, opts)` | Create service from protocol schema |
| `Service.compatible(client, server)` | Check protocol compatibility |
| `Service.isService(any)` | Type check |
| `service.createClient(opts)` | Create RPC client |
| `service.createServer(opts)` | Create RPC server |
| `service.message(name)` | Get message by name |
| `service.type(name)` | Get type by name |
| `service.hash` | Protocol hash |

### Client Options

| Option | Default | Description |
|--------|---------|-------------|
| `server` | — | In-memory server (auto-connects) |
| `transport` | — | Transport stream (auto-creates channel) |
| `buffering` | `false` | Buffer calls before channel ready |
| `timeout` | `10000` | Message timeout in ms |
| `strictTypes` | `false` | Strict error type coercion |

### Server Options

| Option | Default | Description |
|--------|---------|-------------|
| `silent` | `false` | Suppress error logging |
| `strictTypes` | `false` | Strict error type coercion |
| `defaultHandler` | — | Handler for unmapped messages |
| `noCapitalize` | `false` | Don't capitalize handler method names |

## Module Structure

```
services.js   — core implementation: Service, Client, Server,
                channels, transports, framing
compat.js     — Bare runtime shims: process.nextTick polyfill,
                v5/v6 Buffer bridge, removed utils restoration
```

## Documentation

Full reference published at [bare-for-pear.github.io/avsc-rpc](https://bare-for-pear.github.io/avsc-rpc/):

- [API Reference](https://bare-for-pear.github.io/avsc-rpc/api) — Service, Client, Server, channels, middleware, wire protocol
- [Transports](https://bare-for-pear.github.io/avsc-rpc/transports) — in-memory, TCP, HTTP
- [Middleware](https://bare-for-pear.github.io/avsc-rpc/middleware) — request/response chain
- [Wire Protocol](https://bare-for-pear.github.io/avsc-rpc/wire-protocol) — handshake, framing, Netty compatibility
- [Barification](https://bare-for-pear.github.io/avsc-rpc/barification) — what changed from upstream

## License

MIT — same as upstream avsc.
