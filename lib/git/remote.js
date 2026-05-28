const { spawnSync } = require('bare-subprocess')
const exec = require('./exec')

// Remote management + hosted repo operations.
// Platform config determines how repos are created.

const platforms = {
  github: {
    createRepo (opts) {
      let args = ['repo', 'create', opts.name, '--' + (opts.visibility || 'public')]
      if (opts.description) args.push('--description', opts.description)
      let result = spawnSync('gh', args, { encoding: 'utf-8' })
      return {
        code: result.status,
        stdout: result.stdout ? result.stdout.toString().trimEnd() : '',
        stderr: result.stderr ? result.stderr.toString().trimEnd() : ''
      }
    },
    repoUrl (name) {
      return 'https://github.com/' + name + '.git'
    }
  }
}

let platform = 'github'

function setPlatform (name) {
  if (!platforms[name]) throw new Error('unknown platform: ' + name)
  platform = name
}

function getPlatform () {
  return platform
}

// --- git remote operations ---

function list (repo) {
  let result = exec(repo, ['remote', '-v'])
  if (result.code !== 0) return { error: result.stderr }
  let remotes = {}
  for (let line of result.stdout.split('\n')) {
    if (!line) continue
    let parts = line.split(/\s+/)
    if (parts.length >= 2) {
      let name = parts[0]
      let url = parts[1]
      let type = (parts[2] || '').replace(/[()]/g, '')
      if (!remotes[name]) remotes[name] = {}
      remotes[name][type || 'url'] = url
    }
  }
  return remotes
}

function add (repo, name, url) {
  let result = exec(repo, ['remote', 'add', name, url])
  if (result.code !== 0 && !result.stderr.includes('already exists')) {
    return { error: result.stderr }
  }
  return result
}

function remove (repo, name) {
  return exec(repo, ['remote', 'remove', name])
}

function rename (repo, oldName, newName) {
  return exec(repo, ['remote', 'rename', oldName, newName])
}

// --- hosted repo operations (platform-configurable) ---

function createRepo (opts) {
  return platforms[platform].createRepo(opts)
}

function repoUrl (name) {
  return platforms[platform].repoUrl(name)
}

module.exports = {
  list, add, remove, rename,
  createRepo, repoUrl,
  setPlatform, getPlatform,
  platforms
}
