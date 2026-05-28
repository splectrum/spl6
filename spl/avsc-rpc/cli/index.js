const { Buffer, process } = require('spl/mycelium/runtime')
const fs = require('bare-fs')
const net = require('bare-net')
const path = require('bare-path')
const avro = require('avsc')
const { service } = require('spl/avsc-rpc/protocol')
const {
  StreamRecord,
  OperatorBag,
  ExecuteContext,
  NodeRecord,
  streamHeader,
  encodedHeader,
  findHeader,
  loadSchema
} = require('spl/mycelium/schema')
const { repoRoot } = require('spl/mycelium/resolve')
const { nested } = require('spl/avsc-rpc/display')

const PORT = 24950

// --- Context Resolution ---

let contextCache = {}

function loadContext (contextPath) {
  if (contextCache[contextPath]) return contextCache[contextPath]
  let map = {}
  if (!fs.existsSync(contextPath)) return map
  let text = fs.readFileSync(contextPath, 'utf-8')
  for (let line of text.split('\n')) {
    line = line.trim()
    if (!line || line.startsWith('#')) continue
    let parts = line.split(/\s+/)
    if (parts.length >= 2) map[parts[0]] = parts[1]
  }
  contextCache[contextPath] = map
  return map
}

// Check if a name is a client identity: _<name>/_client/context.txt exists
function resolveClientIdentity (name, repo) {
  let contextFile = path.join(repo, '_' + name, '_client', 'context.txt')
  if (fs.existsSync(contextFile)) return contextFile
  return null
}

function resolveSchema (name, contextFile) {
  let map = loadContext(contextFile)
  return map[name] || name
}

// --- Response Extraction ---

const decoder = new TextDecoder()

function extractResponse (response) {
  if (!response.value || response.value.length === 0) {
    return { error: null, node: null, data: null }
  }

  let inner
  try { inner = StreamRecord.fromBuffer(response.value) }
  catch (e) { return { error: 'cannot decode response', node: null, data: null } }

  // Check for errors in inner headers
  let errEntry = findHeader(inner.headers, 'spl.error')
  if (errEntry) {
    let msg = Buffer.isBuffer(errEntry.value)
      ? decoder.decode(errEntry.value)
      : String(errEntry.value)
    return { error: msg, node: null, data: null }
  }

  if (!inner.value || inner.value.length === 0) {
    return { error: null, node: null, data: null }
  }

  // Check for response type header — typed response
  let typeEntry = findHeader(inner.headers, 'spl.data.response.type')
  if (typeEntry) {
    let typeName = Buffer.isBuffer(typeEntry.value)
      ? decoder.decode(typeEntry.value) : String(typeEntry.value)
    try {
      let schema = loadSchema(typeName)
      let data = schema.fromBuffer(inner.value)
      return { error: null, node: null, data, type: typeName }
    } catch (e) { /* fall through to NodeRecord */ }
  }

  // Default: NodeRecord
  let node
  try { node = NodeRecord.fromBuffer(inner.value) }
  catch (e) { return { error: null, node: null, data: null } }

  return { error: null, node, data: null }
}

function printNode (node) {
  if (node.type === 'branch') {
    let text = Buffer.isBuffer(node.value.contents)
      ? decoder.decode(node.value.contents)
      : String(node.value.contents)
    console.log(text)
  } else {
    if (node.value.type === 'binary') {
      process.stdout.write(Buffer.from(node.value.contents))
    } else {
      let text = Buffer.isBuffer(node.value.contents)
        ? decoder.decode(node.value.contents)
        : String(node.value.contents)
      console.log(text)
    }
  }
}

function printData (data, type) {
  if (type === 'spl.data.mycelium.git.status') {
    if (data.clean) { console.log(data.branch + ' clean'); return }
    console.log(data.branch + (data.reality === 'subtree' ? ' (subtree)' : ''))
    for (let f of data.files) console.log('  ' + f.status + ' ' + f.path)
  } else if (type === 'spl.data.mycelium.git.log') {
    for (let e of data.entries) console.log(e.hash.slice(0, 7) + ' ' + e.message)
  } else if (type === 'spl.data.mycelium.git.diff') {
    if (data.content) console.log(data.content)
    else console.log('no changes')
  } else if (type === 'spl.data.mycelium.git.subtree') {
    for (let e of data.entries) {
      console.log(e.prefix + '\t' + e.remote + '\t' + e.branch + (e.url ? '\t' + e.url : ''))
    }
  } else {
    console.log(JSON.stringify(data, null, 2))
  }
}

// --- Parse Arguments ---
//
// spl [identity] [modifier] <command> [key] [args...]
//
// identity: client identity (_<name>/_client/context.txt)
// modifier: raw (raw protocol + no extraction), meta
// command:  resolved from active context
// key:      fabric address (stream record key)
// args:     positional input. Each becomes one element of
//           operator.args (bulk by default). Single invocation
//           = one args element.
//
// Global flags may appear anywhere; they are extracted first,
// then each applies its effect to the invocation state.

const modifiers = { raw: true, meta: true }

// Flag registry. Three action kinds:
//   rewrite — swap the command (e.g. --help → call help handler)
//   exec    — set a field on ExecuteContext (e.g. --async)
//   client  — affect CLI-side display only (e.g. --json)
//
// apply(inv, ctx): ctx carries shared info (e.g. originalResolved
// — the original command's resolved stream type, so rewrite
// flags can place it in the new invocation).
const flagRegistry = {
  '--help': {
    kind: 'rewrite',
    apply (inv, ctx) {
      // Help's "fabric address" is the namespace path being
      // asked about. Place it in key so `spl help X` and
      // `spl X --help` produce identical invocations.
      inv.key = ctx.originalResolved || 'spl'
      inv.command = 'help'
      inv.args = []
      inv.modifier = null
    }
  },
  '--async': {
    kind: 'exec',
    apply (inv) { inv.execMode = 'async' }
  },
  '--json': {
    kind: 'client',
    apply (inv) { inv.clientJson = true }
  }
}

function extractFlags (rawArgv) {
  let rest = []
  let found = []
  for (let a of rawArgv) {
    if (flagRegistry[a]) found.push(a)
    else rest.push(a)
  }
  return { argv: rest, flags: found }
}

const rawArgv = typeof Bare !== 'undefined' ? Bare.argv.slice(2) : []
const { argv, flags: foundFlags } = extractFlags(rawArgv)

const cwd = process.cwd()
const repo = repoRoot(cwd)

if (!repo) {
  console.error('spl: not inside a repository')
  process.exit(1)
}

// Resolve: identity → modifier → command
let clientContext = null
let argStart = 0

// 1. Client identity?
if (argv[0]) {
  clientContext = resolveClientIdentity(argv[0], repo)
  if (clientContext) argStart = 1
}

// 2. Modifier?
let parsedModifier = null
if (argv[argStart] && modifiers[argv[argStart]]) {
  parsedModifier = argv[argStart]
  argStart++
}

// Default context if no client identity matched — needed
// before we can resolve the original command for flag context.
if (!clientContext) {
  clientContext = path.join(repo, '_client', 'context.txt')
}

// Resolve a command name against client context. Modifier
// prefixes short names only; full stream types (spl.*) pass
// through unmodified.
function resolveCommand (modifier, cmd) {
  if (!cmd) return null
  let ctxKey = modifier && !cmd.startsWith('spl.')
    ? modifier + '.' + cmd
    : cmd
  return resolveSchema(ctxKey, clientContext)
}

// Build invocation state — flags may mutate this.
const inv = {
  modifier: parsedModifier,
  command: argv[argStart],
  key: argv[argStart + 1] || '',
  args: argv.slice(argStart + 2),
  execMode: 'sync',
  clientJson: false
}

// Resolve original command before flags may rewrite it,
// so rewrite flags can reference the resolved target.
const originalResolved = resolveCommand(inv.modifier, inv.command)

for (let name of foundFlags) {
  flagRegistry[name].apply(inv, { originalResolved })
}

if (!inv.command) {
  console.error('usage: spl [identity] [modifier] <command> [key] [args...]')
  process.exit(1)
}

const local = '/' + path.relative(repo, cwd)
const schema = resolveCommand(inv.modifier, inv.command)

// For help, the key is a namespace path that may be a client
// alias. Resolve it here — the server doesn't know client context.
if (schema === 'spl.mycelium.process.help' && inv.key) {
  inv.key = resolveCommand(null, inv.key) || inv.key
}

// Build the operator's args array and resolved key for the
// inner record. When the target handler has a colocated
// input.avsc, walk its fields in declaration order consuming
// CLI positionals — fields with position="key" populate the
// stream record key; other fields populate the args record
// (AVRO-encoded as one operator.args element). When no input
// schema exists, fall back to one raw-bytes arg per positional
// and the parsed inv.key stays as-is.
function coerceValue (raw, fieldType) {
  let t = typeof fieldType === 'string'
    ? fieldType
    : (fieldType && fieldType.type) || 'bytes'
  if (t === 'string') return raw
  if (t === 'int' || t === 'long') return parseInt(raw, 10)
  if (t === 'float' || t === 'double') return parseFloat(raw)
  if (t === 'boolean') return raw === 'true' || raw === '1'
  if (t === 'bytes') return Buffer.from(raw)
  return raw
}

function buildInvocation (streamType, inv) {
  let parts = streamType.split('.')
  let inputFile = path.join(repo, ...parts, 'input.avsc')
  if (!fs.existsSync(inputFile)) {
    return {
      key: inv.key,
      args: inv.args.map(a => Buffer.from(a))
    }
  }

  // Combine key slot and args — input schema decides per-field.
  let positional = []
  if (inv.key) positional.push(inv.key)
  positional.push(...inv.args)

  let def = JSON.parse(fs.readFileSync(inputFile, 'utf-8'))
  let argsFields = def.fields.filter(f => f.position !== 'key')
  let record = {}
  let key = ''
  let pi = 0

  for (let f of def.fields) {
    let hasDefault = 'default' in f
    let consume = pi < positional.length
    let value

    if (consume) value = positional[pi++]
    else if (hasDefault) value = f.default
    else throw new Error('missing input field "' + f.name + '" for ' + streamType)

    if (f.position === 'key') {
      key = typeof value === 'string' ? value : String(value || '')
    } else {
      // Default values come through unchanged; positional strings coerce.
      record[f.name] = consume ? coerceValue(value, f.type) : value
    }
  }

  let args = []
  if (argsFields.length > 0) {
    let argsType = avro.Type.forSchema({ ...def, fields: argsFields })
    args = [argsType.toBuffer(record)]
  }

  return { key, args }
}

let resolvedKey, operatorArgsArray
try {
  let built = buildInvocation(schema, inv)
  resolvedKey = built.key
  operatorArgsArray = built.args
} catch (e) {
  console.error('spl: ' + e.message)
  process.exit(1)
}
inv.key = resolvedKey

const innerOp = {
  offset: 0,
  timestamp: Date.now(),
  key: inv.key,
  value: Buffer.alloc(0),
  headers: [
    streamHeader(schema),
    encodedHeader(schema, OperatorBag, {
      args: operatorArgsArray,
      returns: []
    })
  ]
}

// Wrap in execution context
const innerBytes = StreamRecord.toBuffer(innerOp)

const exec = {
  offset: 0,
  timestamp: Date.now(),
  key: inv.key,
  value: innerBytes,
  headers: [
    streamHeader('spl.mycelium.process.execute'),
    encodedHeader('spl.mycelium.process.execute', ExecuteContext, {
      mode: inv.execMode,
      root: { repo, local }
    })
  ]
}

// Connect and send
const client = service.createClient()
const con = net.connect(PORT)

con.on('error', (err) => {
  console.error('spl: server not reachable on port ' + PORT)
  console.error('  ' + err.message)
  console.error('  start with: spl-server')
  process.exit(1)
})

client.createChannel(con, { timeout: 5000 })

client.execute(exec, function (err, response) {
  if (err) {
    console.error('spl: ' + err.message)
    process.exit(1)
  }

  if (inv.modifier === 'raw') {
    console.log(JSON.stringify(nested(response), null, 2))
  } else {
    let { error, node, data, type } = extractResponse(response)
    if (error) {
      console.error('spl: ' + error)
      process.exit(1)
    }
    if (data) printData(data, type)
    else if (node) printNode(node)
  }

  con.end()
})
