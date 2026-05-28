const fs = require('bare-fs')
const path = require('bare-path')

function logMessage (dir, msg, render) {
  fs.mkdirSync(dir, { recursive: true })
  let ts = msg.timestamp
  let seq = 0
  while (fs.existsSync(path.join(dir, ts + '-' + seq + '.json'))) seq++
  let file = path.join(dir, ts + '-' + seq + '.json')
  let content = render ? render(msg) : msg
  fs.writeFileSync(file, JSON.stringify(content, null, 2))
  return file
}

module.exports = { logMessage }
