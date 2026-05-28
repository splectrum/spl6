const { Buffer, process } = require('./runtime.js')
const {
  StreamRecord,
  OperatorBag,
  ExecuteContext,
  streamHeader,
  encodedHeader
} = require('./schema.js')
const { repoRoot } = require('./resolve.js')
const { dispatch } = require('./process/dispatch')
const { nested } = require('../avsc-rpc/display.js')

const path = require('bare-path')
const cwd = process.cwd()
const repo = repoRoot(cwd)
const local = '/' + path.relative(repo, cwd)

// Inner operator: spl.mycelium.xpath.raw.uri.get
const innerOp = {
  offset: 0,
  timestamp: Date.now(),
  key: '/package.json',
  value: Buffer.alloc(0),
  headers: [
    streamHeader('spl.mycelium.xpath.raw.uri.get'),
    encodedHeader('spl.mycelium.xpath.raw.uri.get', OperatorBag, {
      args: [],
      returns: []
    })
  ]
}

const innerBytes = StreamRecord.toBuffer(innerOp)

// Execution context wrapping the inner operator
const exec = {
  offset: 0,
  timestamp: Date.now(),
  key: '/package.json',
  value: innerBytes,
  headers: [
    streamHeader('spl.mycelium.process.execute'),
    encodedHeader('spl.mycelium.process.execute', ExecuteContext, {
      mode: 'sync',
      root: { repo, local }
    })
  ]
}

console.log('--- REQUEST ---')
console.log(JSON.stringify(nested(exec), null, 2))

const response = dispatch(exec)

console.log('\n--- RESPONSE ---')
console.log(JSON.stringify(nested(response), null, 2))
