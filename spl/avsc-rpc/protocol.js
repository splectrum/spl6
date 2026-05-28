const { Service } = require('avsc-rpc')
const { StreamRecord } = require('../mycelium/schema.js')

// spl.avsc.rpc protocol
//
// Single RPC message: execute(StreamRecord) → StreamRecord.
// The RPC layer knows one schema. Everything else
// is resolved at the handling level through dispatch.

const service = Service.forProtocol({
  protocol: 'execute',
  namespace: 'spl.avsc.rpc',
  types: [StreamRecord.schema()],
  messages: {
    execute: {
      request: [{ name: 'envelope', type: 'spl.data.stream.record' }],
      response: 'spl.data.stream.record'
    }
  }
})

module.exports = { service }
