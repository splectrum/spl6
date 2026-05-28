const { resolvePath, operatorArgs, execContext, str } = require('spl/mycelium/xpath/raw/uri/helpers')

// Path contains an underscore-prefixed segment — inside metadata subtree
function hasMetaSegment (key) {
  return key.split('/').filter(Boolean).some(s => s.startsWith('_'))
}

// Target name itself is underscore-prefixed
function isMetaName (key) {
  let parts = key.split('/').filter(Boolean)
  return parts.length > 0 && parts[parts.length - 1].startsWith('_')
}

// Filter to only underscore-prefixed entries
function filterMeta (entries) {
  return entries.filter(e => e.startsWith('_'))
}

module.exports = { resolvePath, operatorArgs, execContext, str, hasMetaSegment, isMetaName, filterMeta }
