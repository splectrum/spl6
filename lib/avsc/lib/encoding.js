'use strict'

// WHATWG TextDecoder/TextEncoder polyfill for Bare.
// Bare's text-decoder uses a streaming API (push/write/end).
// avsc expects the standard .decode() and .encodeInto() API.

if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = class TextDecoder {
    decode (buf) {
      if (!buf || buf.length === 0) return ''
      let out = ''
      let i = 0
      while (i < buf.length) {
        let c = buf[i]
        if (c < 128) {
          out += String.fromCharCode(c)
          i++
        } else if (c < 224) {
          out += String.fromCharCode(((c & 31) << 6) | (buf[i + 1] & 63))
          i += 2
        } else if (c < 240) {
          out += String.fromCharCode(((c & 15) << 12) | ((buf[i + 1] & 63) << 6) | (buf[i + 2] & 63))
          i += 3
        } else {
          let cp = ((c & 7) << 18) | ((buf[i + 1] & 63) << 12) | ((buf[i + 2] & 63) << 6) | (buf[i + 3] & 63)
          cp -= 0x10000
          out += String.fromCharCode(0xD800 + (cp >> 10), 0xDC00 + (cp & 0x3FF))
          i += 4
        }
      }
      return out
    }
  }
}

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = class TextEncoder {
    encode (str) {
      let buf = []
      for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i)
        if (c < 128) {
          buf.push(c)
        } else if (c < 2048) {
          buf.push(192 | (c >> 6), 128 | (c & 63))
        } else if (c >= 0xD800 && c < 0xDC00) {
          let hi = c
          let lo = str.charCodeAt(++i)
          let cp = ((hi - 0xD800) << 10) + (lo - 0xDC00) + 0x10000
          buf.push(240 | (cp >> 18), 128 | ((cp >> 12) & 63), 128 | ((cp >> 6) & 63), 128 | (cp & 63))
        } else {
          buf.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63))
        }
      }
      return new Uint8Array(buf)
    }

    encodeInto (str, buf) {
      let encoded = this.encode(str)
      let written = Math.min(encoded.length, buf.length)
      buf.set(encoded.subarray(0, written))
      return { read: str.length, written }
    }
  }
}
