const net = require('bare-net')
const pid = require('./pid')
const cmd = require('./cmd')

let tcpServer = null
let cmdWatcher = null
let state = 'stopped'
let storedOpts = null
let exitRegistered = false

function cleanup () {
  if (storedOpts) pid.clean(storedOpts.serverDir)
}

function start (opts, cb) {
  if (state === 'running' || state === 'starting') {
    if (cb) cb(new Error('server already running'))
    return
  }

  storedOpts = opts
  let port = opts.port || 24950
  let serverDir = opts.serverDir
  let onConnection = opts.onConnection

  // check for existing server
  let status = pid.alive(serverDir)
  if (status.alive) {
    let msg = 'spl server already running (pid ' + status.pid + ')'
    console.error(msg)
    if (cb) cb(new Error(msg))
    return
  }

  // stale pid file — clean it
  if (status.pid) pid.clean(serverDir)

  state = 'starting'
  pid.write(serverDir)

  tcpServer = net.createServer()
  tcpServer.on('connection', function (socket) {
    socket.on('error', function () {})
    if (onConnection) onConnection(socket)
  })
  tcpServer.on('error', function (err) {
    console.error('spl server error: ' + err.message)
    stop()
  })
  tcpServer.listen(port, function () {
    state = 'running'
    console.log('spl server listening on port ' + port + ' (pid ' + Bare.pid + ')')

    cmdWatcher = cmd.startWatcher(serverDir, {
      shutdown: function () {
        console.log('spl server: shutdown command received')
        stop(function () { Bare.exit(0) })
      },
      restart: function () {
        console.log('spl server: restart command received')
        restart()
      }
    })

    if (cb) cb(null)
  })

  if (!exitRegistered) {
    Bare.on('exit', cleanup)
    exitRegistered = true
  }
}

function stop (cb) {
  if (state !== 'running' && state !== 'starting') {
    if (cb) cb()
    return
  }

  state = 'stopping'
  cmd.stopWatcher(cmdWatcher)
  cmdWatcher = null

  if (tcpServer) {
    tcpServer.close(function () {
      tcpServer = null
      if (storedOpts) pid.clean(storedOpts.serverDir)
      state = 'stopped'
      console.log('spl server stopped')
      if (cb) cb()
    })
  } else {
    if (storedOpts) pid.clean(storedOpts.serverDir)
    state = 'stopped'
    if (cb) cb()
  }
}

function restart (cb) {
  let opts = storedOpts
  stop(function () {
    if (opts) start(opts, cb)
    else if (cb) cb(new Error('no stored opts for restart'))
  })
}

function isRunning () {
  return state === 'running'
}

module.exports = { start, stop, restart, isRunning }
