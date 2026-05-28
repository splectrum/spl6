const path = require('bare-path')
const { process } = require('spl/mycelium/runtime')
const { contextHeader } = require('spl/mycelium/schema')
const { service } = require('spl/avsc-rpc/protocol')
const { readable } = require('spl/avsc-rpc/display')
const { dispatch } = require('spl/mycelium/process/dispatch')
const rpcServer = require('rpc-server')

const serverDir = path.join(process.cwd(), '_server')

const server = service.createServer()
  .onExecute(function (envelope, cb) {
    try {
      let logFile = rpcServer.log.logMessage(
        path.join(serverDir, 'log'), envelope, readable
      )
      let enriched = {
        offset: envelope.offset,
        timestamp: envelope.timestamp,
        key: envelope.key,
        value: envelope.value,
        headers: [
          ...envelope.headers,
          contextHeader('spl.log', logFile)
        ]
      }
      let response = dispatch(enriched)
      cb(null, response)
    } catch (err) {
      cb(err)
    }
  })

rpcServer.start({
  port: 24950,
  serverDir,
  onConnection (socket) {
    server.createChannel(socket)
  }
})
