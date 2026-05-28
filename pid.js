const fs = require('bare-fs')
const path = require('bare-path')
const os = require('bare-os')

const PID_FILE = 'pid'

function write (serverDir) {
  fs.mkdirSync(serverDir, { recursive: true })
  let pid = Bare.pid
  fs.writeFileSync(path.join(serverDir, PID_FILE), '' + pid)
  return pid
}

function read (serverDir) {
  try {
    let raw = fs.readFileSync(path.join(serverDir, PID_FILE), 'utf-8')
    let pid = parseInt(raw.trim(), 10)
    return isNaN(pid) ? null : pid
  } catch (e) {
    return null
  }
}

function clean (serverDir) {
  try {
    fs.unlinkSync(path.join(serverDir, PID_FILE))
  } catch (e) {
    // silent on ENOENT
  }
}

function alive (serverDir) {
  let pid = read(serverDir)
  if (!pid) return { pid: null, alive: false }
  try {
    os.kill(pid, 0)
    return { pid, alive: true }
  } catch (e) {
    return { pid, alive: false }
  }
}

module.exports = { write, read, clean, alive }
