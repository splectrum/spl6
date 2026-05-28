const fs = require('bare-fs')
const path = require('bare-path')
const { Buffer } = require('spl/mycelium/runtime')
const { loadSchema } = require('spl/mycelium/schema')
const { repoRoot } = require('spl/mycelium/resolve')

// --- URI → Schema Mapping ---

let uriSchemaMap = null

function getUriSchemaMap () {
  if (uriSchemaMap) return uriSchemaMap
  uriSchemaMap = {}
  let root = repoRoot(typeof Bare !== 'undefined'
    ? require('bare-os').cwd()
    : process.cwd())
  if (!root) return uriSchemaMap
  let file = path.join(root, '_schema', 'uri-schema.txt')
  if (!fs.existsSync(file)) return uriSchemaMap
  let text = fs.readFileSync(file, 'utf-8')
  for (let line of text.split('\n')) {
    line = line.trim()
    if (!line || line.startsWith('#')) continue
    let parts = line.split(/\s+/)
    if (parts.length >= 2) uriSchemaMap[parts[0]] = parts[1]
  }
  return uriSchemaMap
}

// Resolve value type: registered schema → extension → 'binary'
function resolveType (key) {
  let map = getUriSchemaMap()
  if (map[key]) return map[key]
  let ext = path.extname(key)
  if (ext) return ext.slice(1)
  return 'binary'
}

function schemaFor (key) {
  return getUriSchemaMap()[key] || null
}

// --- Into-file Navigation ---

// Walk key path on filesystem. If a segment resolves to
// a file and more segments remain, that's the boundary.
function findBoundary (headers, key) {
  let { execContext } = require('spl/mycelium/xpath/raw/uri/helpers')
  let ctx = execContext(headers)
  if (!ctx || !ctx.root) return null
  let localRel = ctx.root.local.startsWith('/') ? ctx.root.local.slice(1) : ctx.root.local
  let basePath = path.join(ctx.root.repo, localRel)
  let segments = key.split('/').filter(Boolean)

  let current = basePath
  for (let i = 0; i < segments.length; i++) {
    let next = path.join(current, segments[i])
    if (!fs.existsSync(next)) return null
    let stat = fs.statSync(next)
    if (stat.isFile() && i < segments.length - 1) {
      return {
        filePath: next,
        fileKey: '/' + segments.slice(0, i + 1).join('/'),
        remaining: segments.slice(i + 1),
        stat: stat
      }
    }
    current = next
  }
  return null
}

// Decode file for navigation.
// Registered AVRO schema first, then JSON parse.
function decodeFile (filePath, schemaName) {
  let content = fs.readFileSync(filePath)
  if (schemaName) {
    try { return loadSchema(schemaName).fromBuffer(content) }
    catch (e) { /* not AVRO binary, try JSON */ }
  }
  try { return JSON.parse(content.toString('utf-8')) }
  catch (e) { return null }
}

// Walk a decoded object by path segments
function navigateObject (obj, segments) {
  let current = obj
  for (let seg of segments) {
    if (current === null || current === undefined) return undefined
    if (Array.isArray(current)) {
      let idx = parseInt(seg, 10)
      if (isNaN(idx) || idx < 0 || idx >= current.length) return undefined
      current = current[idx]
    } else if (typeof current === 'object') {
      if (!(seg in current)) return undefined
      current = current[seg]
    } else {
      return undefined
    }
  }
  return current
}

// Build a node record from an in-file value
function inFileNode (record, boundary, value) {
  let ts = {
    created: Math.floor(boundary.stat.birthtimeMs),
    modified: Math.floor(boundary.stat.mtimeMs)
  }

  if (value !== null && typeof value === 'object') {
    let keys = Array.isArray(value)
      ? Array.from({ length: value.length }, (_, i) => String(i))
      : Object.keys(value)
    let contents = Buffer.from(keys.join('\n'))
    return {
      type: 'branch', ...ts,
      value: { type: 'utf8', length: contents.length, contents }
    }
  }

  let text = String(value)
  let contents = Buffer.from(text)
  return {
    type: 'leaf', ...ts,
    value: { type: 'utf8', length: contents.length, contents }
  }
}

module.exports = {
  resolveType, schemaFor,
  findBoundary, decodeFile, navigateObject, inFileNode
}
