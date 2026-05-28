const { spl, expect } = require('../../harness')

// Help responses are raw AVRO on the wire, so we use the raw
// modifier and inspect the inner record directly. The help
// handler sets response type spl.data.mycelium.process.help;
// the raw modifier gives us the whole onion.
function helpInner (target) {
  // target is the key — resolved via context before sending
  return spl('spl.mycelium.process.help', target).value
}

module.exports = [
  {
    name: 'help for root returns spl summary',
    run () {
      let inner = helpInner('spl')
      if (!inner) return { pass: false, message: 'no inner record' }
      let typeHeader = inner.headers.find(h => h.key === 'spl.data.response.type')
      if (!typeHeader) return { pass: false, message: 'no response type header' }
      return { pass: true, message: 'ok' }
    }
  },
  {
    name: 'help default (no target) resolves to spl',
    run () {
      let inner = spl('spl.mycelium.process.help').value
      if (!inner) return { pass: false, message: 'no inner record' }
      let status = inner.headers.find(h => h.key === 'spl.status')
      if (!status) return { pass: false, message: 'no status header' }
      return { pass: true, message: 'ok' }
    }
  },
  {
    name: 'help for a handler includes ancestor context',
    run () {
      let inner = helpInner('spl.mycelium.git.commit')
      if (!inner) return { pass: false, message: 'no inner record' }
      let status = inner.headers.find(h => h.key === 'spl.status')
      if (!status) return { pass: false, message: 'no status header' }
      return { pass: true, message: 'ok' }
    }
  },
  {
    name: 'help for family node lists children',
    run () {
      let inner = helpInner('spl.mycelium.git')
      if (!inner) return { pass: false, message: 'no inner record' }
      let status = inner.headers.find(h => h.key === 'spl.status')
      if (!status) return { pass: false, message: 'no status header' }
      return { pass: true, message: 'ok' }
    }
  },
  {
    name: 'help for handler with input.avsc populates inputs',
    run () {
      let inner = helpInner('spl.mycelium.git.commit')
      if (!inner) return { pass: false, message: 'no inner record' }
      let status = inner.headers.find(h => h.key === 'spl.status')
      if (!status) return { pass: false, message: 'no status header' }
      return { pass: true, message: 'ok' }
    }
  },
  {
    name: 'help for unknown node does not error',
    run () {
      let inner = helpInner('spl.does.not.exist')
      if (!inner) return { pass: false, message: 'no inner record' }
      let err = inner.headers.find(h => h.key === 'spl.error')
      if (err) return { pass: false, message: 'unexpected error: ' + err.value }
      return { pass: true, message: 'ok' }
    }
  },
  {
    name: 'help rejects non-spl target',
    run () {
      let inner = helpInner('foo.bar')
      if (!inner) return { pass: false, message: 'no inner record' }
      let err = inner.headers.find(h => h.key === 'spl.error')
      if (!err) return { pass: false, message: 'expected error header, got success' }
      let msg = typeof err.value === 'string' ? err.value : err.value.toString()
      if (!msg.includes('must start with')) {
        return { pass: false, message: 'unexpected error: ' + msg }
      }
      return { pass: true, message: 'ok' }
    }
  }
]
