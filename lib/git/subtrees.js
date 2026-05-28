const fs = require('bare-fs')
const path = require('bare-path')
const exec = require('./exec')

// .gittrees loader and subtree operations.

let cache = null

function load (repo) {
  if (cache) return cache
  cache = []
  let file = path.join(repo, '.gittrees')
  if (!fs.existsSync(file)) return cache
  let text = fs.readFileSync(file, 'utf-8')
  for (let line of text.split('\n')) {
    line = line.trim()
    if (!line || line.startsWith('#')) continue
    let parts = line.split(/\s+/)
    if (parts.length >= 3) {
      cache.push({
        prefix: parts[0],
        remote: parts[1],
        branch: parts[2]
      })
    }
  }
  return cache
}

function find (repo, prefix) {
  let entries = load(repo)
  let clean = prefix.replace(/^\//, '')
  return entries.find(e => e.prefix === clean) || null
}

function register (repo, entry) {
  let file = path.join(repo, '.gittrees')
  let line = entry.prefix + '\t' + entry.remote + '\t' + entry.branch + '\n'
  fs.appendFileSync(file, line)
  cache = null
}

function pull (repo, prefix) {
  let entry = find(repo, prefix)
  if (!entry) return { error: 'no subtree registered for ' + prefix }
  return exec(repo, [
    'subtree', 'pull',
    '--prefix=' + entry.prefix,
    entry.remote, entry.branch,
    '--squash'
  ])
}

function push (repo, prefix) {
  let entry = find(repo, prefix)
  if (!entry) return { error: 'no subtree registered for ' + prefix }
  return exec(repo, [
    'subtree', 'push',
    '--prefix=' + entry.prefix,
    entry.remote, entry.branch
  ])
}

function add (repo, opts) {
  // Add remote if URL provided
  if (opts.url) {
    let remoteResult = exec(repo, ['remote', 'add', opts.remote, opts.url])
    if (remoteResult.code !== 0 && !remoteResult.stderr.includes('already exists')) {
      return { error: remoteResult.stderr }
    }
  }

  // Fetch remote
  let fetchResult = exec(repo, ['fetch', opts.remote])
  if (fetchResult.code !== 0) return { error: fetchResult.stderr }

  // Add subtree
  let result = exec(repo, [
    'subtree', 'add',
    '--prefix=' + opts.prefix,
    opts.remote, opts.branch,
    '--squash'
  ])

  if (result.code !== 0) return { error: result.stderr || result.stdout }

  // Register
  register(repo, { prefix: opts.prefix, remote: opts.remote, branch: opts.branch })
  return result
}

module.exports = { load, find, register, pull, push, add }
