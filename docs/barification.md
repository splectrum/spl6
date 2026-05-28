[avsc-rpc — Avro RPC for Bare](./) > Barification

# Barification

What was changed from the upstream avsc v5 services code to run as a standalone module on Bare.

---

## Two Operations

1. **Extraction** — separating the RPC layer from the avsc monolith into a standalone module
2. **Barification** — replacing Node.js dependencies with Bare equivalents

## Extraction from avsc

The upstream `services.js` imported siblings with relative paths inside avsc. The fork imports from the avsc peer:

```javascript
// upstream (inside avsc)
let types = require('./types')

// fork (standalone)
let types = require('../avsc/lib/types')
```

## Stream Adaptation

The most significant change. All frame encoder/decoder classes use `streamx.Transform` instead of Node.js `stream.Transform`.

| Concern | Node stream.Transform | streamx.Transform |
|---------|----------------------|-------------------|
| Transform | `_transform(buf, encoding, cb)` | `_transform(buf, cb)` |
| Unpipe | `.unpipe()` available | Not available |

Affected classes: `FrameDecoder`, `FrameEncoder`, `NettyDecoder`, `NettyEncoder`.

## The v5/v6 Bridge

avsc-rpc was written against avsc v5. The fork pairs it with avsc v6. The compatibility module (`compat.js`) bridges:

- **Hash results** — v6 returns Uint8Array, services expects Buffer. Wrapped with `Buffer.from()`.
- **Removed utilities** — `newBuffer`, `bufferFrom`, `addDeprecatedGetters` restored as shims.
- **process.nextTick** — polyfilled via `queueMicrotask` for Bare.
- **debuglog/deprecate** — no-op implementations.

## Module Dependencies

| Module | Purpose |
|--------|---------|
| `bare-buffer` | Buffer API for hash wrapping, message framing |
| `bare-events` | EventEmitter for Service, Client, Server |
| `bare-stream` | Stream base classes |
| `streamx` | Transform streams for frame encoding/decoding |

Peer dependency on [bare-for-pear/avsc](https://bare-for-pear.github.io/avsc/) for types, utils, and platform modules.

## Module Structure

```
services.js   — 2470 lines. Service, Client, Server,
                channels, transports, framing, handshake,
                multiplexing, middleware, protocol negotiation.

compat.js     — 55 lines. v5/v6 bridge.
```
