[avsc-rpc — Avro RPC for Bare](./) > Middleware

# Middleware

Request and response interception on both client and server.

---

## Model

Middleware functions execute in order for each message. The chain is bidirectional — act on the outgoing request and on the incoming response.

```
client middleware → transport → server middleware → handler
                                                      ↓
client middleware ← transport ← server middleware ← response
```

## Client Middleware

```javascript
client.use((wreq, wres, next) => {
  // Before: outgoing request
  console.log('calling:', wreq.header.method)

  next(null, (err, prev) => {
    // After: incoming response
    console.log('response received')
    prev(err)
  })
})
```

## Server Middleware

```javascript
server.use((wreq, wres, next) => {
  const start = Date.now()

  next(null, (err, prev) => {
    console.log('handled in', Date.now() - start, 'ms')
    prev(err)
  })
})
```

## Chaining

```javascript
server.use(tracing, authentication, logging)

// Or individually:
server.use(tracing)
server.use(authentication)
```

## wreq / wres

### wreq (WrappedRequest)

| Property | Description |
|----------|-------------|
| `header` | Message header (method name) |
| `request` | Typed request data |

### wres (WrappedResponse)

| Property | Description |
|----------|-------------|
| `response` | Typed response (after handler) |
| `error` | Error value (after handler) |

## CallContext

Available as `this` in handlers and via channel events.

| Property | Description |
|----------|-------------|
| `channel` | The channel |
| `message` | The message definition |
| `locals` | Shared state between middleware |

## Execution Order

```
middleware 1 forward
  middleware 2 forward
    handler
  middleware 2 backward
middleware 1 backward
```

Forward phase runs before the handler. Backward phase runs after. Errors short-circuit the chain.
