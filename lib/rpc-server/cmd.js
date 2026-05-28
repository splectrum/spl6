const fs = require('bare-fs')
const path = require('bare-path')

const KNOWN_COMMANDS = ['shutdown', 'restart']

function processFile (cmdDir, filename, handlers) {
  let name = filename.replace(/\.[^.]*$/, '')
  if (!KNOWN_COMMANDS.includes(name)) return
  let file = path.join(cmdDir, filename)
  try { fs.unlinkSync(file) } catch (e) { /* gone already */ }
  if (handlers[name]) handlers[name]()
}

function scanExisting (cmdDir, handlers) {
  try {
    let files = fs.readdirSync(cmdDir)
    for (let f of files) processFile(cmdDir, f, handlers)
  } catch (e) {
    // dir may not exist yet
  }
}

function startWatcher (serverDir, handlers) {
  let cmdDir = path.join(serverDir, 'cmd')
  fs.mkdirSync(cmdDir, { recursive: true })

  // process any commands that arrived before we started watching
  scanExisting(cmdDir, handlers)

  let watcher = fs.watch(cmdDir, function (eventType, filename) {
    if (eventType !== 'rename' || !filename) return
    // check file exists (rename fires on create and delete)
    try {
      fs.statSync(path.join(cmdDir, filename))
    } catch (e) {
      return // file was deleted, not created
    }
    processFile(cmdDir, filename, handlers)
  })

  return watcher
}

function stopWatcher (watcher) {
  if (watcher) watcher.close()
}

function sendCommand (serverDir, command) {
  let cmdDir = path.join(serverDir, 'cmd')
  fs.mkdirSync(cmdDir, { recursive: true })
  fs.writeFileSync(path.join(cmdDir, command), '')
}

module.exports = { startWatcher, stopWatcher, sendCommand }
