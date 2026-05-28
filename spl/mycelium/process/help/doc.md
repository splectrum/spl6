---
summary: Describe any namespace node — prose + shape + context.
---

Given a target namespace path (as the record key), walks
from root to target collecting ancestor summaries, reads the
target's `doc.md` (frontmatter summary + body prose), the
target's output `schema.avsc` doc fields, and the target's
direct children.

Missing `doc.md` or missing output schema at any level
degrades gracefully — the response fills what's present,
leaves the rest empty.

Response schema: `spl.data.mycelium.process.help`.
