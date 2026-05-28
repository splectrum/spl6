'use strict';

/**
 * Compatibility shim for services.js.
 *
 * Provides functions that were in avsc v5's platform.js
 * but removed in v6, and bridges the Buffer/Uint8Array
 * difference for hash results.
 */

let buffer = require('bare-buffer');
let Buffer = buffer.Buffer;

/** No-op debug logger. */
function debuglog () {
  return function () {}
}

/** Identity wrapper — deprecated methods still work, no warning. */
function deprecate (fn) {
  return fn
}

/**
 * Wrap avsc v6 getHash to return Buffer instead of Uint8Array.
 * services.js calls .toString('binary') and .readInt16BE() on
 * hash results — Uint8Array doesn't have these methods.
 */
function wrapGetHash (originalGetHash) {
  return function getHash (str, algorithm) {
    let arr = originalGetHash(str, algorithm)
    return Buffer.from(arr.buffer, arr.byteOffset, arr.length)
  }
}

/** No-op — deprecated getters are not needed. Properties are set directly. */
function addDeprecatedGetters () {}

/** Buffer helpers removed from v6 utils. */
function newBuffer (size) { return Buffer.alloc(size) }
function bufferFrom (data, enc) { return Buffer.from(data, enc) }

/** Provide process global for Bare (nextTick, etc.) */
function ensureProcess () {
  if (typeof process === 'undefined') {
    globalThis.process = { nextTick: queueMicrotask }
  } else if (!process.nextTick) {
    process.nextTick = queueMicrotask
  }
}

module.exports = {
  debuglog, deprecate, wrapGetHash, addDeprecatedGetters,
  newBuffer, bufferFrom, ensureProcess
}
