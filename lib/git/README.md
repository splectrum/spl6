# git — Git Operations for Bare

Synchronous git operations module for the [Bare](https://github.com/holepunchto/bare) runtime. Wraps git CLI with structured output parsing, subtree management via `.gittrees`, and configurable hosted repo operations.

## What This Is

A standalone git infrastructure module. Provides: command execution, status/log/diff parsing, add/commit/push/pull, subtree lifecycle management with `.gittrees` validation, remote management, and hosted repo creation (GitHub by default, configurable).

Designed to be used directly or as infrastructure behind thin protocol handlers.

## Platform Dependencies

- `bare-subprocess` — synchronous process spawning (`spawnSync`)
- `bare-fs` — filesystem operations
- `bare-path` — path resolution

These are platform dependencies — installed via `bin/setup` and gitignored.

**External:** `git` CLI must be available on PATH. `gh` CLI required for hosted repo creation.

## API

```javascript
const git = require('git')
```

### Command Execution

```javascript
// Run any git command
let result = git.exec('/path/to/repo', ['log', '--oneline', '-5'])
// → { code: 0, stdout: '...', stderr: '' }
```

All operations return `{ code, stdout, stderr }`. Non-zero `code` indicates failure.

### Status

```javascript
let status = git.status(repo)
// → { branch: 'main', files: [{ status: 'M', path: 'file.js' }, ...] }

let filtered = git.status(repo, { path: 'lib/avsc' })
```

### Log

```javascript
let commits = git.log(repo)
// → [{ hash, author, timestamp, message }, ...]

let recent = git.log(repo, { count: 5 })
let scoped = git.log(repo, { path: 'spl/mycelium' })
```

### Diff

```javascript
let diff = git.diff(repo)
// → { files: [...], stat: '...' }
```

### Add / Commit / Push / Pull

```javascript
git.add(repo, ['file1.js', 'file2.js'])
git.add(repo, 'single-file.js')

git.commit(repo, 'commit message')

git.push(repo, { remote: 'origin', branch: 'main' })
git.pull(repo, { remote: 'origin', branch: 'main' })
```

### Subtree Management

Subtree operations are validated against `.gittrees` — a committed flat file at repo root mapping prefix to remote and branch.

```
# .gittrees
lib/avsc        bare-for-pear-avsc        main
lib/avsc-rpc    bare-for-pear-avsc-rpc    main
lib/git         bare-for-pear-git         main
```

```javascript
// Load all registered subtrees
let entries = git.subtrees.load(repo)
// → [{ prefix, remote, branch }, ...]

// Find a specific subtree
let entry = git.subtrees.find(repo, 'lib/avsc')
// → { prefix: 'lib/avsc', remote: 'bare-for-pear-avsc', branch: 'main' }

// Push subtree changes to its remote
git.subtrees.push(repo, 'lib/avsc')

// Pull subtree updates from remote (squash)
git.subtrees.pull(repo, 'lib/avsc')

// Add a new subtree (fetch + add + register)
git.subtrees.add(repo, {
  prefix: 'lib/new-module',
  remote: 'remote-name',
  branch: 'main',
  url: 'https://github.com/org/repo.git'  // optional: adds remote first
})

// Register manually (append to .gittrees)
git.subtrees.register(repo, { prefix: 'lib/foo', remote: 'foo-remote', branch: 'main' })
```

### Two-Reality Model

Detects whether a local root position is inside a registered subtree.

```javascript
let reality = git.detectReality(repo, '/')
// → { mode: 'repo' }

let reality = git.detectReality(repo, '/lib/avsc')
// → { mode: 'subtree', prefix: 'lib/avsc', remote: 'bare-for-pear-avsc', branch: 'main' }
```

Operations scope automatically: from repo root you get full repo scope, from inside a subtree you get that subtree's scope.

### Remote Management

```javascript
// List all remotes
let remotes = git.remote.list(repo)
// → { origin: { fetch: 'url', push: 'url' }, ... }

// Add/remove/rename remotes
git.remote.add(repo, 'new-remote', 'https://github.com/org/repo.git')
git.remote.remove(repo, 'old-remote')
git.remote.rename(repo, 'old-name', 'new-name')
```

### Hosted Repo Operations

Platform-configurable. Defaults to GitHub (requires `gh` CLI).

```javascript
// Create a repo on the configured platform
git.remote.createRepo({ name: 'org/repo-name', visibility: 'public', description: '...' })

// Get URL for a repo name
git.remote.repoUrl('org/repo-name')
// → 'https://github.com/org/repo-name.git'

// Switch platform
git.remote.setPlatform('github')  // default
git.remote.getPlatform()          // → 'github'
```

Custom platforms can be added to `git.remote.platforms`:

```javascript
git.remote.platforms.gitea = {
  createRepo (opts) { /* ... */ },
  repoUrl (name) { return 'https://gitea.example.com/' + name + '.git' }
}
git.remote.setPlatform('gitea')
```

## Module Structure

```
index.js        — main exports
exec.js         — spawnSync wrapper
status.js       — git status --porcelain parser
log.js          — git log parser (custom format)
diff.js         — git diff with stat parsing
subtrees.js     — .gittrees loader + subtree operations
reality.js      — two-reality detection
remote.js       — remote management + hosted repo ops
package.json    — { "name": "git" }
```

## License

MIT
