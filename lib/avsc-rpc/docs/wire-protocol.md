[avsc-rpc — Avro RPC for Bare](./) > Wire Protocol

# Wire Protocol

Handshake, framing, and protocol negotiation.

---

## Handshake

Every new connection (stateful) or every message (stateless) begins with a handshake to determine whether client and server share a protocol.

### Request

```
HandshakeRequest {
  clientHash:     fixed(16)            — MD5 of client protocol
  clientProtocol: union(null, string)  — full protocol if needed
  serverHash:     fixed(16)            — expected server hash
  meta:           union(null, map<bytes>)
}
```

### Response

```
HandshakeResponse {
  match:          enum(BOTH, CLIENT, NONE)
  serverProtocol: union(null, string)  — full protocol if mismatch
  serverHash:     union(null, fixed(16))
  meta:           union(null, map<bytes>)
}
```

### Resolution

| Match | Meaning | Action |
|-------|---------|--------|
| `BOTH` | Protocols match | Proceed |
| `CLIENT` | Server knows client, client doesn't know server | Server sends protocol, client caches |
| `NONE` | Neither recognises the other | Both protocols exchanged, both cache |

After resolution, an Adapter is created that maps between protocol versions using Avro type resolution. Subsequent messages use the adapter.

## Framing

### Standard Frame Encoding

Avro specification framing. Messages split into length-prefixed frames.

```
[length: 4 bytes BE] [payload]
[length: 4 bytes BE] [payload]
...
[0x00000000]  — terminator
```

Used by `FrameEncoder` / `FrameDecoder`.

### Netty Encoding

Java Netty-compatible framing. Default for stateful binary channels. Interoperates with JVM Avro RPC.

```
[messageID: 4 bytes] [frameCount: 4 bytes]
[length: 4 bytes BE] [payload]
[length: 4 bytes BE] [payload]
...
```

Message ID enables multiplexing — responses match requests by ID. Used by `NettyEncoder` / `NettyDecoder`.

All four codecs are `streamx.Transform` instances.

## Message Wire Format

### Request

```
[handshake request (first message only, stateful)]
[metadata: map<bytes>]
[method name: string]
[request body: Avro-encoded]
```

### Response

```
[handshake response (first message only, stateful)]
[metadata: map<bytes>]
[is-error: boolean]
[body: Avro-encoded response or error]
```

## Multiplexing

Stateful channels multiplex messages over a single connection using 4-byte message IDs (Netty encoding). The Registry class tracks pending callbacks by ID.

## Protocol Discovery

Discover a remote server's protocol without knowing it:

```javascript
const { discoverProtocol } = require('avsc-rpc')

discoverProtocol(transport, (err, protocol) => {
  const service = Service.forProtocol(protocol)
})
```

Sends a handshake with an intentionally wrong hash. The server responds with its full protocol.
