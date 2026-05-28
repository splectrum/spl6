// Bare runtime essentials
const { Buffer } = require('bare-buffer')
const os = require('bare-os')

const process = {
  cwd: () => os.cwd(),
  exit: (code) => Bare.exit(code || 0)
}

module.exports = { Buffer, process }
