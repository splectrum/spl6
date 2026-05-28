const lifecycle = require('./lifecycle')
const pid = require('./pid')
const log = require('./log')
const cmd = require('./cmd')

module.exports = {
  start: lifecycle.start,
  stop: lifecycle.stop,
  restart: lifecycle.restart,
  isRunning: lifecycle.isRunning,
  pid,
  log,
  cmd
}
