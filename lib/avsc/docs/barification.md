[avsc — Avro for Bare](./) > Barification

# Barification

What was changed from the upstream mtth/avsc to run on Bare.

---

## Approach

Bare ships with no standard library. Node.js built-ins like `fs`, `crypto`, `stream`, and `path` do not exist. Their Bare equivalents — `bare-fs`, `bare-crypto`, `bare-stream`, `bare-path` — provide the same functionality through separately installed modules.

The fork replaces all Node.js requires with their Bare equivalents directly. No conditional imports, no runtime detection, no compatibility layers. One runtime, one code path.

## Module Replacements

| File | Upstream | Fork |
|------|----------|------|
| `lib/platform.js` | `require('crypto')` | `require('bare-crypto')` |
| `lib/files.js` | `require('fs')`, `require('path')` | `require('bare-fs')`, `require('bare-path')` |
| `lib/index.js` | `require('fs')` | `require('bare-fs')` |
| `lib/containers.js` | `require('stream')` | `require('bare-stream')` |

## TextEncoder/TextDecoder Polyfill

**File:** `lib/encoding.js`

Bare's `text-decoder` module provides a streaming API (`push`/`write`/`end`). avsc expects the WHATWG standard `.decode()` and `.encodeInto()` API.

The polyfill provides WHATWG-compliant implementations with full UTF-8 support (1-4 byte sequences, surrogate pair handling). Installs on `globalThis` only if the standard API is absent.

Auto-loaded via `require('./encoding')` in `utils.js`.

## Buffer Handling

`utils.js` contains conditional logic that detects `Buffer` availability and falls back to `Uint8Array` operations where needed. On Bare, `Buffer` is available when `bare-buffer` is required but is not a global.

## Package.json

Upstream avsc v6 used conditional imports:

```json
{
  "imports": {
    "fs": { "bare": "bare-fs", "default": "fs" },
    "crypto": { "bare": "bare-crypto", "default": "crypto" }
  }
}
```

The fork strips this to:

```json
{ "name": "avsc", "main": "lib/index.js" }
```

No conditional resolution. Direct bare-* requires throughout.

## Platform Dependencies

Required at runtime:

| Module | Purpose |
|--------|---------|
| `bare-crypto` | Schema fingerprints, protocol hashes |
| `bare-fs` | Container file I/O, IDL imports |
| `bare-path` | IDL import path resolution |
| `bare-stream` | Container encoding/decoding streams |
