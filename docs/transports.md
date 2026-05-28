[avsc-rpc — Avro RPC for Bare](./) > Transports

# Transports

How RPC messages move between client and server. The transport is a deployment concern — the schema contract is invariant.

---

## Transport Model

avsc-rpc separates the protocol boundary (schema contract, handshake, message encoding) from the transport (how bytes move). Handler code is transport-agnostic. The same service definition works across all transports.

Two categories:
- **Stateful** — persistent connection, single handshake, multiplexed messages (TCP, in-memory)
- **Stateless** — handshake per request, one message per connection (HTTP)

## In-Memory

Direct object passing. No serialization, no framing.

```javascript
const client = service.createClient({ server })
client.echo('hello', (err, res) => { ... })
```

The RPC boundary is still enforced — schema validation happens — but there is no wire encoding. Used for testing and in-process communication.

## TCP (Stateful)

Persistent connection. Single handshake, then multiplexed messages with ID headers.

```javascript
const net = require('bare-net')

// Server
net.createServer((socket) => {
  server.createChannel(socket)
}).listen(8090)

// Client
const socket = net.connect(8090)
client.createChannel(socket)
```

TCP channels do not auto-reconnect. When a connection drops, the channel emits `'eot'`. Create a new channel on a new socket.

```javascript
function connect () {
  const socket = net.connect(8090)
  const channel = client.createChannel(socket)
  channel.on('eot', () => setTimeout(connect, 1000))
}
```

## HTTP (Stateless)

Request-response pattern. Factory function called per message.

```javascript
client.createChannel((cb) => {
  const req = http.request(opts, (res) => cb(null, res))
  cb(null, req)
})
```

## Channel Options

| Option | Default | Description |
|--------|---------|-------------|
| `objectMode` | `false` | `true`: object passing. `false`: binary framing |
| `noPing` | `false` | Skip initial handshake ping |
| `timeout` | `10000` | Per-channel timeout (ms) |
| `endWritable` | `true` | End writable after stateless request |
| `scope` | — | Message ID namespace |
| `serverHash` | — | Pre-populate protocol adapter |

## Custom Transports

Any duplex stream or stream pair works:

```javascript
// Duplex
client.createChannel(duplexStream)

// Separate streams
client.createChannel({ readable: input, writable: output })
```

## Summary

| Transport | Type | Framing | Multiplexing | Use Case |
|-----------|------|---------|--------------|----------|
| In-memory | Stateful | None (objects) | Yes | Testing, IPC |
| TCP | Stateful | Netty | Yes | Inter-process |
| HTTP | Stateless | Frame | No | Request-response |
| Custom | Either | Configurable | Configurable | Special protocols |
