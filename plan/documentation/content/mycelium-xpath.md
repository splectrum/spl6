# Mycelium XPath

Navigation characteristics of XPath in the Mycelium fabric.

## The principle

XPath is **read-only** — it extracts data, never mutates state. Any
operation that changes state is a protocol operation, not an XPath
expression. XPath asks questions; protocols take action.

## Two navigation modes

**Data and metadata navigation** — self and descendants. Forward-only from
the local root. "What can I see from here?" The data scope extends into
self and everything below. No looking up.

**Functional resolution** — self and ancestors. Backward from the current
node to the data owner's repo root. "What functionality applies here?"
Walks up the ancestor axis; nearest ancestor wins. Context accumulates
during traversal — metadata closer to the target overrides metadata from
further up.

The two modes never cross. Data does not look up; function does not look
down.

## Seamless traversal

XPath navigates all substrate structures as one surface:

- **Git objects** — tree entries (contexts), blob values (content). The
  latest commit tree is the default root; the index for working state.
  Any commit's tree is reachable — versioned navigation.
- **Hypercore log entries** — offset-addressed, tailable. The sequence/time
  axis: offset, range, latest, live-tail.
- **AVRO-decoded internals** — when AVRO is active (Round 2), XPath
  descends into decoded record structure, including Kafka record headers.

The substrate boundaries are invisible to navigation. One expression can
traverse a git tree, reach a subscribed topic's log entry, and (later)
descend into its decoded content.

## The temporal dimension

Git commits and kafka offsets are points on the same dimension — a position
in an immutable history. Version selection (which commit's tree to navigate)
is a root-level operation: select the version context, then navigate
forward. Comparison across versions (diff) is a separate read-only
operation.

## Three visibility modes

The same modes URI defines, applied as navigation lenses:

- **data** — data nodes only (hides underscore-prefixed segments)
- **metadata** — metadata nodes only (only underscore-prefixed segments)
- **raw** — everything, no filtering

On Kafka records: data mode sees the value; metadata mode sees the headers;
raw sees both.

## Function set

A native XPath engine with its own function set — not the standard XPath
function library wholesale. Functions include git read operations (version
selection, history, diff) and kafka read operations (offset, range, latest,
tail). All read-only. The function set grows as pressure surfaces and as
AVRO unlocks internal structure.
