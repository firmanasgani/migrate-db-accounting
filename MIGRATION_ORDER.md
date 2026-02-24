# Urutan Migrasi Database - Dependency Analysis

Dokumen ini menjelaskan urutan migrasi tabel dari database `vico_accounting` ke `accounting_dev` berdasarkan analisis foreign key dependencies.

## Total Tables: 26

- **Base Tables**: 23
- **Views**: 3 (tidak perlu dimigrasi, akan di-recreate)

## Dependency Analysis

### Level 0: Tables Tanpa Dependencies (Migrate Pertama)

Tables ini tidak memiliki foreign key ke table lain, sehingga aman untuk dimigrasi pertama kali:

1. **entity** (0 rows) - No dependencies
2. **assets_category** (12 rows) - No dependencies
3. **assets_location** (5 rows) - No dependencies
4. **banks** (62 rows) - No dependencies
5. **journal_codes** (0 rows) - No dependencies
6. **roles** (9 rows) - No dependencies
7. **user_type** (4 rows) - No dependencies
8. **settings** (5 rows) - No dependencies
9. **migrations** (11 rows) - Framework migration table
10. **coa_temps** (0 rows) - Self-referencing (parent_id nullable)

### Level 1: Tables dengan 1 Level Dependency

Tables ini depend pada Level 0 tables:

11. **users** (9 rows)

    - Dependencies: `user_type` (type_id)

12. **bank_accounts** (135 rows)

    - Dependencies: `banks` (bank_id)

13. **coa** (277 rows)

    - Dependencies: Self-referencing (parent_id → coa.id, nullable)
    - Note: Migrate dengan urutan parent dulu, atau disable FK sementara

14. **assets** (14 rows)
    - Dependencies:
      - `assets_location` (location_id)
      - `assets_category` (category_id)
      - `entity` (entity_id, nullable)

### Level 2: Tables dengan 2+ Level Dependencies

Tables ini depend pada Level 1 tables:

15. **assets_image** (13 rows)

    - Dependencies: `assets` (assets_id)

16. **coa_bank_accounts** (17 rows) - Junction table

    - Dependencies:
      - `bank_accounts` (bank_account_id)
      - `coa` (coa_id)

17. **coa_movements** (4,466 rows)

    - Dependencies: `coa` (coa_id)

18. **user_roles** (22 rows) - Junction table

    - Dependencies:
      - `users` (user_id)
      - `roles` (role_id)

19. **journals** (6,123 rows)

    - Dependencies:
      - `bank_accounts` (bank_account_sender_id, nullable)
      - `bank_accounts` (bank_account_receiver_id, nullable)
      - `users` (created_by, checked_by, approved_by)

20. **report_headers** (61 rows)

    - No direct FK, but related to coa

21. **report_content** (309 rows)
    - Dependencies:
      - `report_headers` (rh_id)
      - `coa` (coa_id)

### Level 3: Tables dengan 3+ Level Dependencies

22. **journal_details** (17,024 rows)

    - Dependencies:
      - `journals` (journal_id)
      - `coa` (coa_id, nullable)

23. **logs** (59,025 rows)

    - Dependencies:
      - `coa` (coa_id, nullable)
      - `journals` (journal_id, nullable)
      - Note: No FK constraint, just reference

24. **message** (3 rows)
    - Dependencies:
      - `journals` (journal_id, nullable)
      - Users (from_id, to_id) - No FK constraint

### Views (Skip Migration - Recreate Later)

- **journals_active_list** - VIEW
- **journals_history_view** - VIEW

## Recommended Migration Order

```
LEVEL 0 (No Dependencies):
├── 1. entity
├── 2. assets_category
├── 3. assets_location
├── 4. banks
├── 5. journal_codes
├── 6. roles
├── 7. user_type
├── 8. settings
├── 9. migrations
└── 10. coa_temps

LEVEL 1 (1 Dependency):
├── 11. users (→ user_type)
├── 12. bank_accounts (→ banks)
├── 13. coa (→ self, nullable)
└── 14. assets (→ assets_location, assets_category, entity)

LEVEL 2 (2+ Dependencies):
├── 15. assets_image (→ assets)
├── 16. coa_bank_accounts (→ bank_accounts, coa)
├── 17. coa_movements (→ coa)
├── 18. user_roles (→ users, roles)
├── 19. journals (→ bank_accounts, users)
├── 20. report_headers
└── 21. report_content (→ report_headers, coa)

LEVEL 3 (3+ Dependencies):
├── 22. journal_details (→ journals, coa)
├── 23. logs (→ coa, journals)
└── 24. message (→ journals)

VIEWS (Recreate):
├── journals_active_list
└── journals_history_view
```

## Special Considerations

### 1. Self-Referencing Tables

- **coa** table has `parent_id` yang reference ke `coa.id`
- **Strategy**:
  - Option A: Disable FK constraint sementara, migrate semua data, enable FK
  - Option B: Migrate dengan urutan: parent records dulu (parent_id = NULL), lalu child records

### 2. Nullable Foreign Keys

Tables dengan nullable FK bisa dimigrasi meskipun referenced table belum ada data:

- `assets.entity_id` (nullable)
- `journals.bank_account_sender_id` (nullable)
- `journals.bank_account_receiver_id` (nullable)
- `journal_details.coa_id` (nullable)
- `logs.coa_id` (nullable)
- `logs.journal_id` (nullable)

### 3. Large Tables (Performance Consideration)

Tables dengan data banyak perlu batch processing:

- **logs**: 59,025 rows - Use batch size 1000
- **journal_details**: 17,024 rows - Use batch size 1000
- **journals**: 6,123 rows - Use batch size 1000
- **coa_movements**: 4,466 rows - Use batch size 1000

### 4. Empty Tables

Tables ini kosong di source, bisa di-skip atau migrate structure only:

- **entity**: 0 rows
- **journal_codes**: 0 rows
- **coa_temps**: 0 rows

## Migration Commands

### Migrate by Level

```bash
# Level 0
npm run migrate -- --table entity
npm run migrate -- --table assets_category
npm run migrate -- --table assets_location
npm run migrate -- --table banks
npm run migrate -- --table roles
npm run migrate -- --table user_type
npm run migrate -- --table settings

# Level 1
npm run migrate -- --table users
npm run migrate -- --table bank_accounts
npm run migrate -- --table coa
npm run migrate -- --table assets

# Level 2
npm run migrate -- --table assets_image
npm run migrate -- --table coa_bank_accounts
npm run migrate -- --table coa_movements
npm run migrate -- --table user_roles
npm run migrate -- --table journals
npm run migrate -- --table report_headers
npm run migrate -- --table report_content

# Level 3
npm run migrate -- --table journal_details
npm run migrate -- --table logs
npm run migrate -- --table message
```

### Migrate All (Automatic Order)

```bash
npm run migrate
```

### Dry Run First

```bash
npm run migrate -- --dry-run
```

## Validation Checklist

After migration, verify:

- [ ] Row counts match between source and destination
- [ ] Foreign key constraints are valid
- [ ] No NULL values in required fields
- [ ] Primary keys are unique
- [ ] Data integrity checks pass
- [ ] Views can be recreated successfully

## Rollback Strategy

If migration fails:

1. Truncate destination tables in reverse order (Level 3 → Level 0)
2. Fix mapping or data issues
3. Re-run migration

## Notes

- Total data rows: ~94,000+ rows
- Estimated migration time: 5-10 minutes (depending on network and server)
- Always run dry-run first to validate mappings
- Monitor foreign key constraint violations
- Keep transaction logs for rollback capability
