# Database Migration Tool

Tool untuk migrasi data dari database `vico_accounting` ke `accounting_dev` dengan 26 tabel yang memiliki struktur berbeda.

## Features

- ✅ **Batch Processing** - Migrasi data dalam chunk untuk performa optimal
- ✅ **Type Safety** - TypeScript untuk menghindari error saat mapping
- ✅ **Progress Tracking** - Log detail untuk setiap tabel
- ✅ **Error Handling** - Catat record yang gagal untuk di-review
- ✅ **Dry Run Mode** - Test migrasi tanpa commit ke database
- ✅ **Flexible Mapping** - Custom transformation logic per tabel
- ✅ **Validation** - Validasi data sebelum insert
- ✅ **Connection Pooling** - Optimal database connection management
- ✅ **Table Inspector** - Describe dan compare table structures
- ✅ **Auto-Generate Mappers** - Generate mapper templates otomatis

> 📖 **Untuk dokumentasi lengkap table inspection commands, lihat [COMMANDS.md](./COMMANDS.md)**

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` dan sesuaikan dengan konfigurasi database Anda:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Source Database (vico_accounting)
SOURCE_DB_HOST=localhost
SOURCE_DB_PORT=3306
SOURCE_DB_USER=root
SOURCE_DB_PASSWORD=your_password
SOURCE_DB_NAME=vico_accounting

# Destination Database (accounting_dev)
DEST_DB_HOST=localhost
DEST_DB_PORT=3306
DEST_DB_USER=root
DEST_DB_PASSWORD=your_password
DEST_DB_NAME=accounting_dev

# Migration Settings
BATCH_SIZE=1000
LOG_LEVEL=info
```

### 3. Test Database Connection

```bash
npm run dev test-connection
```

## Usage

### Test Connection

```bash
npm run dev test-connection
```

### Dry Run (Test tanpa insert data)

```bash
npm run dev migrate --dry-run
```

### Run Migration

```bash
npm run dev migrate
```

### Advanced Options

```bash
# Migrate hanya tabel tertentu
npm run dev migrate --only users companies

# Skip tabel tertentu
npm run dev migrate --skip logs temp_data

# Custom batch size
npm run dev migrate --batch-size 500

# Stop on first error
npm run dev migrate --no-continue

# Kombinasi options
npm run dev migrate --dry-run --only users --batch-size 100
```

### List All Mappers

```bash
npm run dev list-tables
```

## Quick Start: Generate Mappers

### Method 1: Auto-Generate All Mappers (Recommended)

```bash
# List all tables from both databases
npm run describe:list -- --database source
npm run describe:list -- --database dest

# Auto-generate mappers for all matching tables
npm run describe:generate-all -- --output-dir src/mappers/generated

# Review and customize generated mappers
# Then register them in src/mappers/index.ts
```

### Method 2: Generate Mappers One by One

```bash
# Compare table structures first
npm run describe:compare -- --source users --dest users

# Generate mapper
npm run describe:generate -- --source users --dest users --output src/mappers/users.mapper.ts

# Repeat for other tables
npm run describe:generate -- --source entity --dest entity --output src/mappers/entity.mapper.ts
```

### Method 3: Manual Creation

Untuk setiap tabel yang akan di-migrate, buat mapper file di `src/mappers/`:

### 1. Duplicate Template

```bash
cp src/mappers/example.mapper.ts src/mappers/users.mapper.ts
```

### 2. Define Types

```typescript
// src/mappers/users.mapper.ts

// Source table structure (vico_accounting)
interface SourceUser {
  user_id: number;
  user_name: string;
  user_email: string;
  created_date: Date;
}

// Destination table structure (accounting_dev)
interface DestUser {
  id: number;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}
```

### 3. Create Mapper

```typescript
export const usersMapper: TableMapper<SourceUser, DestUser> = {
  sourceTable: "tbl_users",
  destTable: "users",
  batchSize: 1000,

  transform: async (source: SourceUser): Promise<DestUser> => {
    return {
      id: source.user_id,
      name: source.user_name,
      email: source.user_email,
      created_at: source.created_date,
      updated_at: new Date(), // Set current timestamp
    };
  },

  validate: async (dest: DestUser): Promise<boolean> => {
    return dest.email.includes("@");
  },
};
```

### 4. Register Mapper

Edit `src/mappers/index.ts`:

```typescript
import { usersMapper } from "./users.mapper";

export const allMappers: TableMapper[] = [
  usersMapper,
  // ... other mappers
];
```

## Project Structure

```
migrate-db/
├── src/
│   ├── config/
│   │   └── database.config.ts      # Database connections
│   ├── mappers/
│   │   ├── example.mapper.ts       # Template mapper
│   │   ├── index.ts                # Mapper registry
│   │   └── [your-table].mapper.ts  # Your table mappers
│   ├── services/
│   │   └── migration.service.ts    # Core migration logic
│   ├── types/
│   │   └── migration.types.ts      # TypeScript types
│   ├── utils/
│   │   └── logger.ts               # Winston logger
│   └── index.ts                    # CLI entry point
├── logs/                           # Log files
├── .env                            # Environment config
├── package.json
├── tsconfig.json
└── README.md
```

## Migration Workflow

1. **Prepare** - Setup environment dan test koneksi
2. **Create Mappers** - Buat mapper untuk setiap tabel (26 tabel)
3. **Dry Run** - Test mapping logic tanpa insert data
4. **Review Logs** - Check logs untuk error atau data yang tidak valid
5. **Run Migration** - Execute migration sebenarnya
6. **Verify** - Validasi data di destination database

## Logging

Semua log tersimpan di folder `logs/`:

- `combined.log` - Semua log
- `error.log` - Error saja

Log format:

```
2026-01-08 13:48:16 [info]: Starting migration for table: users
2026-01-08 13:48:16 [info]: Total records to migrate: 1500
2026-01-08 13:48:17 [info]: Processing batch: 1 to 1000 of 1500
2026-01-08 13:48:18 [info]: Processing batch: 1001 to 1500 of 1500
2026-01-08 13:48:19 [info]: Completed migration for users: 1500/1500 records inserted
```

## Error Handling

Jika ada error saat migrasi:

1. Error akan di-log dengan detail record yang gagal
2. Migration akan continue ke record berikutnya (kecuali `--no-continue`)
3. Summary akan menampilkan jumlah success vs failed records
4. Review `logs/error.log` untuk detail error

## Tips

1. **Selalu mulai dengan dry-run** untuk test mapping logic
2. **Test per tabel** menggunakan `--only` option
3. **Backup database** sebelum migration
4. **Monitor logs** untuk track progress
5. **Adjust batch size** sesuai dengan ukuran data dan memory

## Next Steps

1. Copy `.env.example` ke `.env` dan configure database credentials
2. Test connection: `npm run dev test-connection`
3. Create mapper untuk tabel pertama
4. Test dengan dry-run: `npm run dev migrate --dry-run --only table_name`
5. Ulangi untuk 26 tabel
6. Run full migration

## Support

Jika ada pertanyaan atau issue, silakan buat issue di repository ini.
