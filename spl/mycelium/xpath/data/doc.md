---
summary: Data xpath — hides underscore-prefixed (metadata) segments.
---

Data visibility is the default lens for application content.
Paths containing any underscore-prefixed segment are invisible;
attempts to read or write metadata paths return an error.

For metadata access, use `spl.mycelium.xpath.metadata`.
For unfiltered access, use `spl.mycelium.xpath.raw`.

Operations come in two variants: schema-aware (type resolution
via registry or file extension, with into-file JSON navigation)
and URI (schema-agnostic, bytes in / bytes out).
