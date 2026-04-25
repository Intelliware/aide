---
slug: handle-original
sequence: 6
depends-on-prior: true
---

# Step 6 — Handle the original document

> Keeping both the original and the sharded versions defeats the purpose of
> sharding and causes drift. Force a deliberate choice now, while the tree is
> fresh in everyone's head.

## Present the choice

Ask the user verbatim:

> What would you like to do with the original document `[source-document-name]`?
>
> Options:
> - `[d]` Delete — Remove the original (recommended; shards can always be recombined)
> - `[m]` Move to archive — Move the original to a backup/archive location
> - `[k]` Keep — Leave the original in place (NOT recommended; defeats sharding purpose)
>
> Your choice (d/m/k):

## Branch — `d` (delete)

1. Delete the original source document file.
2. Confirm to the user: `Original document deleted: <source-document-path>`.
3. Note that the document can be reconstructed by concatenating the section
   files in their `index.md` order.

## Branch — `m` (move to archive)

1. Determine default archive path: a sibling `archive/` folder next to the
   source — e.g. `/path/to/architecture.md` → `/path/to/archive/architecture.md`.
2. Ask: "Archive location (`[y]` to use default `<default-archive-path>`, or
   provide a custom path):".
3. If accepted, use the default; if a custom path is provided, use that.
4. Create the archive directory if it does not exist.
5. Move the original to the archive location.
6. Confirm: `Original document moved to: <archive-path>`.

## Branch — `k` (keep)

1. Display the warning:
   - Keeping both is **not recommended**.
   - Updates to one will not propagate to the other.
   - Duplicate content takes up space and confuses readers.
   - Consider deleting or archiving instead.
2. Confirm the user's choice: `Original document kept at: <source-document-path>`.

## Halt conditions

- File system permission errors during delete or move → HALT and surface the error.
- User declines to choose → HALT and remind them this step cannot be skipped.
