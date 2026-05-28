---
summary: Read bytes from a node, data lens.
---

Reads the node at `key` as bytes. Data lens — metadata paths
are invisible. No type resolution, no into-file navigation.

For unfiltered reads use `spl.mycelium.xpath.raw.uri.get`;
for schema-aware data reads use `spl.mycelium.xpath.data.get`.
