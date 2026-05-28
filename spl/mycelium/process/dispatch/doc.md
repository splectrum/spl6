---
summary: Namespace-path handler resolution and invocation.
---

Reads the stream descriptor from the record headers, resolves
the handler module from the namespace path (`spl.foo.bar` →
`spl/foo/bar/index.js`), and calls it. No registration —
the namespace *is* the path.

Failure to require the module surfaces as a `spl.error`
context header on the returned record.
