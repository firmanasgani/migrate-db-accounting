# Table Mapping Configuration

This directory contains manual mapping configurations for migrating data from the source database (`vico_accounting`) to the destination database (`accounting_dev`).

## Structure

Each table mapping is defined in its own file with the following structure:

```typescript
export const tableNameMapping: TableMapping = {
  sourceTable: "source_table_name",
  destinationTable: "destination_table_name",
  dependencies: ["dependent_table_1", "dependent_table_2"],
  columns: [
    {
      source: "source_column",
      destination: "destination_column",
      required: true / false,
      transform: (value) => transformedValue,
      defaultValue: defaultValue,
      comment: "Description of the column",
    },
  ],
  postMigrationValidation: "SQL query to validate migration",
};
```

## Current Mappings

### 1. Assets Table (`assets.mapping.ts`)

**Source:** `vico_accounting.assets`

- Total columns: 18
- Total rows: 14
- Primary key: `id` (varchar(36))

**Dependencies:**

- `assets_location` - Asset location reference
- `assets_category` - Asset category reference
- `entity` - Entity reference (optional)

**Key Mappings:**

- All 18 columns mapped 1:1
- `spesification` → `specification` (typo fix)
- Soft delete support via `is_deleted`
- Audit fields: `created_at`, `created_by`, `updated_at`, `updated_by`

**Special Considerations:**

- Foreign key validation required for `location_id`, `category_id`
- Optional foreign key for `entity_id`
- Legacy `images` field (may be replaced by `assets_image` table)

## Adding New Mappings

1. Create a new file: `src/mappings/[table-name].mapping.ts`
2. Define the mapping using the `TableMapping` interface
3. Export the mapping constant
4. Add the mapping to `src/mappings/index.ts`:

   ```typescript
   export * from "./[table-name].mapping";
   import { tableNameMapping } from "./[table-name].mapping";

   export const allTableMappings: TableMapping[] = [
     assetsTableMapping,
     tableNameMapping, // Add here
   ];
   ```

## Migration Execution Order

The migration system automatically determines the execution order based on table dependencies using topological sort. You can view the execution order by running:

```bash
npm run describe:migration-plan
```

## Validation

Before running migrations, validate all mappings:

```bash
npm run validate:mappings
```

This will check for:

- Circular dependencies
- Missing dependency mappings
- Invalid column references

## Column Mapping Guidelines

### Required Fields

- Always map primary keys
- Map all NOT NULL columns
- Ensure foreign keys are mapped correctly

### Optional Fields

- Use `defaultValue` for columns that should have a default
- Use `transform` function for data type conversions or value transformations
- Add `comment` to explain complex mappings

### Transformations

Example transformations:

```typescript
// Convert empty strings to NULL
transform: (value) => (value === "" ? null : value);

// Convert date formats
transform: (value) => (value ? new Date(value).toISOString() : null);

// Convert boolean
transform: (value) => (value ? 1 : 0);

// Concatenate fields
transform: (value, row) => `${row.first_name} ${row.last_name}`;
```

## Post-Migration Validation

Each mapping can include a `postMigrationValidation` SQL query to verify the migration was successful. This query should return statistics about the migrated data.

Example:

```sql
SELECT
  COUNT(*) as total_migrated,
  COUNT(DISTINCT category_id) as unique_categories,
  SUM(CASE WHEN is_deleted = 0 THEN 1 ELSE 0 END) as active_records
FROM table_name
```

## Next Steps

1. ✅ Create assets table mapping
2. ⏳ Create assets_location table mapping
3. ⏳ Create assets_category table mapping
4. ⏳ Create entity table mapping
5. ⏳ Create remaining table mappings
6. ⏳ Implement migration service
7. ⏳ Add migration progress tracking
8. ⏳ Add rollback capability
