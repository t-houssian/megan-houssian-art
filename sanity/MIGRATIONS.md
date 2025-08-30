# Sanity Data Migrations

This folder contains optional scripts to help with schema/type changes.

## Rename `collection` type to `gallery`

1. Add a new schema for `gallery` with equivalent fields and include it in `sanity/schemas/index.ts`.
2. Preview in Studio to ensure no field mismatches.
3. Run the migration:

```sh
cd sanity
npm run migrate:collections-to-gallery
```

Notes:
- The script preserves `_id` so references continue to work.
- Queries in the Next.js app must be updated from `_type == "collection"` to `_type == "gallery"` after migrating.
- Consider running this on a staging dataset first (e.g., `SANITY_DATASET=staging`).
- Backup your dataset before running migrations.
