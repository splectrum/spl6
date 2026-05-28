# avsc-rpc — Avro RPC for Bare

Avro RPC protocol layer for the [Bare](https://github.com/holepunchto/bare) runtime. Extracted from [mtth/avsc](https://github.com/mtth/avsc) v5 before the RPC layer was removed in v6.

**Source:** [github.com/bare-for-pear/avsc-rpc](https://github.com/bare-for-pear/avsc-rpc)

---

## Reference

- [API Reference](api) — complete reference: Service, Client, Server, channels, middleware, wire protocol
- [Barification](barification) — streamx adaptation, v5/v6 bridge, platform dependencies
- [Transports](transports) — in-memory, TCP, HTTP, channel lifecycle
- [Middleware](middleware) — request/response chain, use patterns
- [Wire Protocol](wire-protocol) — handshake, framing, Netty compatibility, multiplexing

## Quick Start

```javascript
const { Service } = require('avsc-rpc')

// Define a service
const service = Service.forProtocol({
  protocol: 'Echo',
  messages: {
    echo: {
      request: [{ name: 'message', type: 'string' }],
      response: 'string'
    }
  }
})

// Server
const server = service.createServer()
server.onEcho((message, cb) => cb(null, message))

// Client (in-memory)
const client = service.createClient({ server })
client.echo('hello', (err, res) => console.log(res))
```

```javascript
// TCP transport
const net = require('bare-net')

net.createServer((socket) => server.createChannel(socket)).listen(8090)

const socket = net.connect(8090)
client.createChannel(socket)
```
