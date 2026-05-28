# rpc-server — Server Lifecycle for Bare

Server lifecycle management for the [Bare](https://github.com/holepunchto/bare) runtime. TCP server with PID tracking, clean shutdown, restart, and file-based command IPC.

## What This Is

A standalone server infrastructure module. Manages: TCP listener lifecycle, PID file for process identity, file-based command IPC (drop a file to trigger shutdown/restart), and request logging with pluggable rendering.

Protocol-agnostic — the caller provides an `onConnection` callback. The module knows nothing about what protocol runs on the connections.

## Platform Dependencies

- `bare-net` — TCP server and connections
- `bare-fs` — filesystem operations (PID, logging, command watching)
- `bare-path` — path resolution
- `bare-os` — process identity (`os.kill` for PID alive check)

These are platform dependencies — installed via `bin/setup` and gitignored.

## API

```javascript
const rpcServer = require('rpc-server')
```

### Server Lifecycle

```javascript
// Start a server
rpcServer.start({
  port: 24950,
  serverDir: '/path/to/_server',
  onConnection (socket) {
    // wire your protocol here
    myProtocol.createChannel(socket)
  }
})

// Stop gracefully
rpcServer.stop(function () {
  console.log('stopped')
})

// Restart (stop + start with same opts)
rpcServer.restart()

// Check state
rpcServer.isRunning()  // → true/false
```

On start:
- Checks for existing server via PID file (prevents double-start)
- Writes PID file to `serverDir/pid`
- Starts TCP listener
- Starts command watcher on `serverDir/cmd/`
- Registers cleanup on `Bare.on('exit')`

On stop:
- Stops command watcher
- Closes TCP server (waits for connections to drain)
- Removes PID file

### PID Management

```javascript
// Write current process PID
rpcServer.pid.write(serverDir)  // → pid number

// Read PID from file
rpcServer.pid.read(serverDir)   // → number or null

// Check if PID is alive
rpcServer.pid.alive(serverDir)  // → { pid: 12345, alive: true }
                                // → { pid: null, alive: false }

// Remove PID file
rpcServer.pid.clean(serverDir)
```

Stale PID files (process crashed) are detected by `alive()` — it tests the PID with `os.kill(pid, 0)`.

### Request Logging

```javascript
// Log a message to timestamped JSON file
let file = rpcServer.log.logMessage(logDir, message, renderFn)
// → '/path/to/_server/log/1776388482225-0.json'
```

- `renderFn` is optional — transforms the message before writing. The caller owns the display concern.
- Filenames use `timestamp-seq.json` with collision avoidance.

### File-Based Command IPC

Commands are files dropped into `serverDir/cmd/`. The server watches the directory and acts on known commands.

```javascript
// Send a command (from any process)
rpcServer.cmd.sendCommand(serverDir, 'shutdown')
rpcServer.cmd.sendCommand(serverDir, 'restart')
```

From a shell:
```bash
touch _server/cmd/shutdown    # server exits cleanly
touch _server/cmd/restart     # server stops and restarts
```

Watcher API (used internally by lifecycle, available for custom setups):
```javascript
let watcher = rpcServer.cmd.startWatcher(serverDir, {
  shutdown () { /* handle */ },
  restart () { /* handle */ }
})
rpcServer.cmd.stopWatcher(watcher)
```

The watcher processes existing command files on start (handles commands that arrived before the watcher started).

## Module Structure

```
index.js        — main exports
lifecycle.js    — start/stop/restart, TCP management
pid.js          — PID file write/read/clean/alive
log.js          — request logging with pluggable render
cmd.js          — file-based command IPC
package.json    — { "name": "rpc-server" }
```

## License

MIT
