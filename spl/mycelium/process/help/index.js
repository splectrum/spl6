const fs = require('bare-fs')
const path = require('bare-path')
const { contextHeader, findHeader } = require('spl/mycelium/schema')
const { withContext } = require('spl/mycelium/process/dispatch')

const EXEC_KEY = 'spl.mycelium.process.execute'
const RESPONSE_TYPE = 'spl.data.mycelium.process.help'

// Parse a doc.md file. Returns { summary, body }.
// Frontmatter is a --- YAML block at the top with at
// least the summary field. Missing file → empty both.
function readDoc (file) {
  if (!fs.existsSync(file)) return { summary: '', body: '' }
  let text = fs.readFileSync(file, 'utf-8')

  let match = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { summary: '', body: text.trim() }

  let summary = ''
  for (let line of match[1].split('\n')) {
    let m = line.match(/^summary:\s*(.*)$/)
    if (m) { summary = m[1].trim(); break }
  }

  return { summary, body: match[2].trim() }
}

// Resolve filesystem directory for a namespace path.
// spl.mycelium.git.commit → <repo>/spl/mycelium/git/commit
function nodeDir (repo, streamType) {
  return path.join(repo, ...streamType.split('.'))
}

// Direct children of the target node: subdirectories that
// are real namespace nodes (have index.js or doc.md), skipping
// underscore-prefixed (metadata) and dot-prefixed (hidden).
function listChildren (repo, streamType) {
  let dir = nodeDir(repo, streamType)
  if (!fs.existsSync(dir)) return []
  let children = []
  for (let entry of fs.readdirSync(dir)) {
    if (entry.startsWith('_') || entry.startsWith('.')) continue
    let full = path.join(dir, entry)
    let stat
    try { stat = fs.statSync(full) } catch (e) { continue }
    if (!stat.isDirectory()) continue
    let hasIndex = fs.existsSync(path.join(full, 'index.js'))
    let hasDoc = fs.existsSync(path.join(full, 'doc.md'))
    if (!hasIndex && !hasDoc) continue
    let childPath = streamType + '.' + entry
    let summary = hasDoc ? readDoc(path.join(full, 'doc.md')).summary : ''
    children.push({ path: childPath, summary })
  }
  return children
}

// Output schema lives at _schema/spl/data/<tail>/schema.avsc
// where <tail> is the streamType minus the leading "spl.".
function outputSchemaFile (repo, streamType) {
  let parts = streamType.split('.')
  if (parts[0] !== 'spl') return null
  return path.join(repo, '_schema', 'spl', 'data', ...parts.slice(1), 'schema.avsc')
}

// Input schema lives next to the handler — input.avsc sibling
// to index.js. Handler-specific contract, not a reusable data
// type, so colocated rather than in _schema/.
function inputSchemaFile (repo, streamType) {
  return path.join(nodeDir(repo, streamType), 'input.avsc')
}

// Stringify an AVRO type for display in help metadata.
function stringifyType (t) {
  if (typeof t === 'string') return t
  if (Array.isArray(t)) return t.map(stringifyType).join(' | ')
  if (t && typeof t === 'object') {
    if (t.type === 'array') return 'array<' + stringifyType(t.items) + '>'
    if (t.type === 'map') return 'map<' + stringifyType(t.values) + '>'
    if (t.name) return (t.namespace ? t.namespace + '.' : '') + t.name
    return t.type || 'record'
  }
  return String(t)
}

function isNullable (t) {
  if (!Array.isArray(t)) return false
  return t.some(x => x === 'null' || (typeof x === 'object' && x && x.type === 'null'))
}

function readInputs (repo, streamType) {
  let file = inputSchemaFile(repo, streamType)
  if (!fs.existsSync(file)) return []
  try {
    let def = JSON.parse(fs.readFileSync(file, 'utf-8'))
    if (!def.fields) return []
    return def.fields.map(f => ({
      position: f.position === 'key' ? 'key' : f.name,
      name: f.name,
      fieldType: stringifyType(f.type),
      required: !('default' in f) && !isNullable(f.type),
      doc: f.doc || ''
    }))
  } catch (e) {
    return []
  }
}

module.exports = function help (record) {
  let ctx = findHeader(record.headers, EXEC_KEY)
  if (!ctx || !ctx.value || !ctx.value.root) {
    return withContext(record, [
      contextHeader('spl.error', 'help: no execution context')
    ])
  }

  let repo = ctx.value.root.repo
  // Target is the fabric address — the namespace path being
  // asked about. Defaults to the root namespace.
  let target = record.key && record.key.trim() ? record.key.trim() : 'spl'

  let parts = target.split('.')
  if (!parts[0] || parts[0] !== 'spl') {
    return withContext(record, [
      contextHeader('spl.error', 'help: target must start with "spl" — got ' + target)
    ])
  }

  // Walk ancestors (root → target exclusive)
  let context = []
  for (let i = 0; i < parts.length - 1; i++) {
    let ancestorPath = parts.slice(0, i + 1).join('.')
    let ancestorDoc = path.join(nodeDir(repo, ancestorPath), 'doc.md')
    context.push({ path: ancestorPath, summary: readDoc(ancestorDoc).summary })
  }

  // Target itself
  let targetDoc = readDoc(path.join(nodeDir(repo, target), 'doc.md'))

  // Output schema (optional)
  let output = { type: null, doc: '' }
  let schemaFile = outputSchemaFile(repo, target)
  if (schemaFile && fs.existsSync(schemaFile)) {
    try {
      let def = JSON.parse(fs.readFileSync(schemaFile, 'utf-8'))
      output.type = (def.namespace ? def.namespace + '.' : '') + def.name
      output.doc = def.doc || ''
    } catch (e) { /* leave null */ }
  }

  let result = {
    streamType: target,
    summary: targetDoc.summary,
    description: targetDoc.body,
    context,
    children: listChildren(repo, target),
    inputs: readInputs(repo, target),
    output
  }

  return {
    offset: record.offset,
    timestamp: Date.now(),
    key: record.key,
    value: result,
    headers: [
      ...record.headers,
      contextHeader('spl.data.response.type', RESPONSE_TYPE),
      contextHeader('spl.status', 'completed')
    ]
  }
}
