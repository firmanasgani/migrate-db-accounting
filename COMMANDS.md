# Table Inspector Commands

Script dinamis untuk melakukan inspect dan describe tables dari database `vico_accounting` dan `accounting_dev`.

## Available Commands

### 1. List All Tables

List semua tabel dari database source atau destination.

**Source Database:**

```bash
npm run describe:list -- --database source
```

**Destination Database:**

```bash
npm run describe:list -- --database dest
```

**Output:**

```json
{
  "database": "source",
  "tables": ["users", "companies", "..."],
  "count": 26
}
```

---

### 2. Describe Single Table

Describe struktur tabel tertentu dan output dalam format JSON.

**Syntax:**

```bash
npm run describe:table -- --name <table-name> [--database <source|dest>] [--output <file.json>]
```

**Examples:**

Describe tabel `users` dari source database:

```bash
npm run describe:table -- --name users --database source
```

Save output ke file JSON:

```bash
npm run describe:table -- --name users --database source --output users-structure.json
```

Describe tabel dari destination database:

```bash
npm run describe:table -- --name companies --database dest --output companies-dest.json
```

**Output Format:**

```json
{
  "tableName": "users",
  "database": "vico_accounting",
  "columns": [
    {
      "name": "id",
      "type": "varchar(36)",
      "nullable": false,
      "key": "PRI",
      "default": null,
      "extra": ""
    },
    ...
  ],
  "primaryKeys": ["id"],
  "indexes": ["PRIMARY", "..."]
}
```

---

### 3. Compare Two Tables

Compare struktur tabel antara source dan destination database.

**Syntax:**

```bash
npm run describe:compare -- --source <source-table> --dest <dest-table> [--output <file.json>]
```

**Examples:**

Compare tabel `users`:

```bash
npm run describe:compare -- --source users --dest users
```

Save comparison ke file:

```bash
npm run describe:compare -- --source users --dest users --output users-comparison.json
```

**Output Format:**

```json
{
  "source": {
    "tableName": "users",
    "database": "vico_accounting",
    "columns": [...]
  },
  "dest": {
    "tableName": "users",
    "database": "accounting_dev",
    "columns": [...]
  },
  "differences": {
    "columnsOnlyInSource": ["old_field"],
    "columnsOnlyInDest": ["new_field"],
    "commonColumns": ["id", "name", "..."],
    "typeDifferences": [
      {
        "column": "status",
        "sourceType": "enum('active','inactive')",
        "destType": "varchar(20)"
      }
    ]
  }
}
```

---

### 4. Generate Mapper for Single Table

Generate mapper template untuk satu tabel.

**Syntax:**

```bash
npm run describe:generate -- --source <source-table> --dest <dest-table> [--output <file.ts>]
```

**Examples:**

Generate mapper untuk tabel `users`:

```bash
npm run describe:generate -- --source users --dest users --output src/mappers/users.mapper.ts
```

Print mapper ke console (tanpa save):

```bash
npm run describe:generate -- --source companies --dest companies
```

**Generated Mapper:**

```typescript
import { TableMapper } from "../types/migration.types";

export interface SourceUsers {
  id: string;
  name: string;
  // ... all fields
}

export interface DestUsers {
  id: string;
  name: string;
  // ... all fields
}

export const usersMapper: TableMapper<SourceUsers, DestUsers> = {
  sourceTable: "users",
  destTable: "users",
  batchSize: 1000,

  transform: async (source: SourceUsers): Promise<DestUsers> => {
    return {
      id: source.id,
      name: source.name,
      // ... auto-mapped fields
    };
  },

  validate: async (dest: DestUsers): Promise<boolean> => {
    return true;
  },
};
```

---

### 5. Generate All Mappers

Auto-generate mappers untuk semua tabel yang matching antara source dan destination.

**Syntax:**

```bash
npm run describe:generate-all -- [--output-dir <directory>]
```

**Examples:**

Generate semua mappers ke folder default:

```bash
npm run describe:generate-all
```

Custom output directory:

```bash
npm run describe:generate-all -- --output-dir src/mappers/auto-generated
```

**Output:**

- Creates mapper file for each matching table
- Files saved as `<table-name>.mapper.ts`
- Logs summary of generated mappers

---

## Workflow Example

### Step 1: List All Tables

```bash
# List source tables
npm run describe:list -- --database source

# List destination tables
npm run describe:list -- --database dest
```

### Step 2: Compare Specific Tables

```bash
# Compare users table
npm run describe:compare -- --source users --dest users --output analysis/users-comparison.json

# Compare companies table
npm run describe:compare -- --source entity --dest entity --output analysis/entity-comparison.json
```

### Step 3: Generate Mappers

**Option A: Generate One by One**

```bash
npm run describe:generate -- --source users --dest users --output src/mappers/users.mapper.ts
npm run describe:generate -- --source entity --dest entity --output src/mappers/entity.mapper.ts
npm run describe:generate -- --source coa --dest coa --output src/mappers/coa.mapper.ts
```

**Option B: Generate All at Once**

```bash
npm run describe:generate-all -- --output-dir src/mappers/generated
```

### Step 4: Review & Customize Mappers

Edit generated mappers untuk:

- Adjust field mappings
- Add data transformations
- Add validation logic
- Handle special cases

### Step 5: Register Mappers

Edit `src/mappers/index.ts`:

```typescript
import { usersMapper } from "./users.mapper";
import { entityMapper } from "./entity.mapper";
import { coaMapper } from "./coa.mapper";
// ... import all mappers

export const allMappers: TableMapper[] = [
  usersMapper,
  entityMapper,
  coaMapper,
  // ... add all mappers
];
```

### Step 6: Test Migration

```bash
# Dry run for single table
npm run migrate -- --dry-run --only users

# Dry run for all tables
npm run migrate -- --dry-run

# Run actual migration
npm run migrate
```

---

## Tips

1. **Always start with comparison** - Use `describe:compare` to understand differences before generating mappers
2. **Review generated mappers** - Auto-generated mappers are templates, customize them for your needs
3. **Test incrementally** - Generate and test one mapper at a time
4. **Save analysis** - Use `--output` to save JSON for documentation
5. **Version control** - Commit generated mappers to track changes

---

## Common Use Cases

### Case 1: Table with Same Structure

```bash
# Generate mapper (fields will auto-map)
npm run describe:generate -- --source users --dest users --output src/mappers/users.mapper.ts
```

### Case 2: Table with Different Names

```bash
# Compare first
npm run describe:compare -- --source entity --dest companies

# Generate with custom names
npm run describe:generate -- --source entity --dest companies --output src/mappers/entity-to-companies.mapper.ts
```

### Case 3: Table with Different Fields

```bash
# Compare to see differences
npm run describe:compare -- --source old_transactions --dest new_transactions --output analysis.json

# Generate mapper
npm run describe:generate -- --source old_transactions --dest new_transactions --output src/mappers/transactions.mapper.ts

# Manually edit mapper to handle field differences
```

---

## Output Files Organization

Recommended structure:

```
migrate-db/
├── analysis/                    # Comparison JSONs
│   ├── users-comparison.json
│   ├── entity-comparison.json
│   └── ...
├── src/
│   └── mappers/
│       ├── generated/          # Auto-generated mappers
│       ├── users.mapper.ts     # Reviewed & customized
│       ├── entity.mapper.ts
│       └── index.ts            # Mapper registry
```

---

## All Available Scripts

```bash
# Connection & Testing
npm run test-connection          # Test database connections
npm run list-tables             # List registered mappers

# Table Inspection
npm run describe:list           # List all tables
npm run describe:table          # Describe single table
npm run describe:compare        # Compare two tables
npm run describe:generate       # Generate single mapper
npm run describe:generate-all   # Generate all mappers

# Migration
npm run migrate                 # Run migration
npm run dry-run                 # Dry run (no insert)
```
