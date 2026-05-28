const avro = require('avsc')
const fs = require('bare-fs')
const path = require('bare-path')
const { repoRoot } = require('./resolve.js')

// --- Schema Loader ---
//
// Loads schemas from the _schema tree by namespace path.
// The _schema directory on the repo root is the local
// schema registry. Reality is local.
//
// Aliases: alias-mapping.txt at _schema root.
// Two columns: alias name → schema name. Loaded once.

const cache = {}
let aliasMap = null
let schemaRoot = null

function getSchemaRoot () {
  if (schemaRoot) return schemaRoot
  let root = repoRoot(typeof Bare !== 'undefined'
    ? require('bare-os').cwd()
    : process.cwd())
  schemaRoot = root ? path.join(root, '_schema') : null
  return schemaRoot
}

function getAliasMap () {
  if (aliasMap) return aliasMap
  aliasMap = {}
  let root = getSchemaRoot()
  if (!root) return aliasMap
  let file = path.join(root, 'alias-mapping.txt')
  if (!fs.existsSync(file)) return aliasMap
  let text = fs.readFileSync(file, 'utf-8')
  for (let line of text.split('\n')) {
    line = line.trim()
    if (!line || line.startsWith('#')) continue
    let parts = line.split(/\s+/)
    if (parts.length >= 2) aliasMap[parts[0]] = parts[1]
  }
  return aliasMap
}

function loadSchema (name) {
  if (cache[name]) return cache[name]

  let aliases = getAliasMap()
  if (aliases[name]) {
    let resolved = loadSchema(aliases[name])
    cache[name] = resolved
    return resolved
  }

  let root = getSchemaRoot()
  if (!root) throw new Error('no _schema directory found')

  let parts = name.split('.')
  let file = path.join(root, ...parts, 'schema.avsc')

  if (!fs.existsSync(file)) {
    throw new Error('schema not found: ' + name)
  }

  let def = JSON.parse(fs.readFileSync(file, 'utf-8'))
  let type = avro.Type.forSchema(def)
  cache[name] = type
  return type
}

function listSchemas (prefix) {
  let root = getSchemaRoot()
  if (!root) return []

  let names = []

  let parts = prefix.split('.')
  let dir = path.join(root, ...parts)
  if (fs.existsSync(dir)) {
    let entries = fs.readdirSync(dir)
    for (let entry of entries) {
      if (entry.startsWith('_') || entry.startsWith('.')) continue
      let full = path.join(dir, entry)
      let stat = fs.statSync(full)
      if (stat.isDirectory()) {
        if (fs.existsSync(path.join(full, 'schema.avsc'))) {
          names.push(prefix + '.' + entry)
        }
        names.push(...listSchemas(prefix + '.' + entry))
      }
    }
  }

  let aliases = getAliasMap()
  for (let alias of Object.keys(aliases)) {
    if (alias.startsWith(prefix + '.')) {
      names.push(alias)
    }
  }

  return names
}

// --- Core Schemas ---

const StreamRecord = loadSchema('spl.data.stream.record')
const OperatorBag = loadSchema('spl.data.stream.operator')
const ExecuteContext = loadSchema('spl.data.mycelium.process.execute')
const NodeRecord = loadSchema('spl.data.mycelium.xpath.node')

// --- Header Helpers ---

// Stream descriptor — resolved in the union
function streamHeader (type) {
  return { key: 'spl.data.stream', value: { type } }
}

// Encoded header — packed with schema (for boundary)
function encodedHeader (key, type, data) {
  return { key, value: type.toBuffer(data) }
}

// Plain header — object in memory, pack at boundary
function header (key, value) {
  return { key, value }
}

// Context header — string as raw bytes
function contextHeader (key, value) {
  return { key, value: Buffer.from(value) }
}

// Read the stream descriptor (already resolved)
function getStreamDescriptor (headers) {
  let entry = headers.find(h => h.key === 'spl.data.stream')
  return entry ? entry.value : null
}

// Find a header entry by key
function findHeader (headers, key) {
  return headers.find(h => h.key === key)
}

// Read a header value — decode if packed, return as-is if plain
function readHeader (entry, type) {
  if (Buffer.isBuffer(entry.value) || entry.value instanceof Uint8Array) {
    return type.fromBuffer(entry.value)
  }
  return entry.value
}

// List all header keys
function headerKeys (headers) {
  return headers.map(h => h.key)
}

module.exports = {
  loadSchema,
  listSchemas,
  StreamRecord,
  OperatorBag,
  ExecuteContext,
  NodeRecord,
  streamHeader,
  encodedHeader,
  header,
  contextHeader,
  getStreamDescriptor,
  findHeader,
  readHeader,
  headerKeys
}
