const exec = require('./exec')
const status = require('./status')
const log = require('./log')
const diff = require('./diff')
const subtrees = require('./subtrees')
const remote = require('./remote')
const detectReality = require('./reality')

module.exports = {
  exec,
  status,
  log,
  diff,
  subtrees,
  remote,
  detectReality,

  add (repo, paths) {
    let args = ['add'].concat(Array.isArray(paths) ? paths : [paths])
    return exec(repo, args)
  },

  commit (repo, message) {
    return exec(repo, ['commit', '-m', message])
  },

  push (repo, opts) {
    let remote = (opts && opts.remote) || 'origin'
    let branch = (opts && opts.branch) || 'main'
    return exec(repo, ['push', remote, branch])
  },

  pull (repo, opts) {
    let remote = (opts && opts.remote) || 'origin'
    let branch = (opts && opts.branch) || 'main'
    return exec(repo, ['pull', remote, branch])
  }
}
