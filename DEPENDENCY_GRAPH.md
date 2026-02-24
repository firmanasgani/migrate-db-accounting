# Database Migration Dependency Graph

## Visual Dependency Tree

```
┌─────────────────────────────────────────────────────────────────┐
│                         LEVEL 0                                  │
│                    (No Dependencies)                             │
└─────────────────────────────────────────────────────────────────┘
    │
    ├── entity (0 rows)
    ├── assets_category (12 rows)
    ├── assets_location (5 rows)
    ├── banks (62 rows)
    ├── journal_codes (0 rows)
    ├── roles (9 rows)
    ├── user_type (4 rows)
    ├── settings (5 rows)
    ├── migrations (11 rows)
    └── coa_temps (0 rows)
         │
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         LEVEL 1                                  │
│                  (1 Level Dependency)                            │
└─────────────────────────────────────────────────────────────────┘
    │
    ├── users (9 rows)
    │   └─→ user_type
    │
    ├── bank_accounts (135 rows)
    │   └─→ banks
    │
    ├── coa (277 rows) ⚠️ SELF-REFERENCING
    │   └─→ coa (parent_id, nullable)
    │
    └── assets (14 rows)
        ├─→ assets_location
        ├─→ assets_category
        └─→ entity (nullable)
         │
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         LEVEL 2                                  │
│                 (2+ Level Dependencies)                          │
└─────────────────────────────────────────────────────────────────┘
    │
    ├── assets_image (13 rows)
    │   └─→ assets
    │
    ├── coa_bank_accounts (17 rows) [JUNCTION]
    │   ├─→ bank_accounts
    │   └─→ coa
    │
    ├── coa_movements (4,466 rows) 📊 LARGE
    │   └─→ coa
    │
    ├── user_roles (22 rows) [JUNCTION]
    │   ├─→ users
    │   └─→ roles
    │
    ├── journals (6,123 rows) 📊 LARGE
    │   ├─→ bank_accounts (sender, nullable)
    │   ├─→ bank_accounts (receiver, nullable)
    │   ├─→ users (created_by)
    │   ├─→ users (checked_by, nullable)
    │   └─→ users (approved_by, nullable)
    │
    ├── report_headers (61 rows)
    │   └─→ (no FK)
    │
    └── report_content (309 rows)
        ├─→ report_headers
        └─→ coa
         │
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         LEVEL 3                                  │
│                 (3+ Level Dependencies)                          │
└─────────────────────────────────────────────────────────────────┘
    │
    ├── journal_details (17,024 rows) 📊 LARGE
    │   ├─→ journals
    │   └─→ coa (nullable)
    │
    ├── logs (59,025 rows) 📊 VERY LARGE
    │   ├─→ coa (nullable, no FK)
    │   └─→ journals (nullable, no FK)
    │
    └── message (3 rows)
        ├─→ journals (nullable)
        └─→ users (from_id, to_id, no FK)

┌─────────────────────────────────────────────────────────────────┐
│                         VIEWS                                    │
│                    (Skip Migration)                              │
└─────────────────────────────────────────────────────────────────┘
    │
    ├── journals_active_list
    └── journals_history_view
```

## Legend

- 📊 **LARGE**: Table dengan >1000 rows, perlu batch processing
- ⚠️ **SELF-REFERENCING**: Table dengan FK ke dirinya sendiri
- **[JUNCTION]**: Junction/pivot table untuk many-to-many relationship
- **(nullable)**: Foreign key yang bisa NULL
- **(no FK)**: Reference tanpa foreign key constraint

## Quick Reference Table

| Level | Table Name        | Rows   | Dependencies | Priority       |
| ----- | ----------------- | ------ | ------------ | -------------- |
| 0     | entity            | 0      | None         | 🟢 High        |
| 0     | assets_category   | 12     | None         | 🟢 High        |
| 0     | assets_location   | 5      | None         | 🟢 High        |
| 0     | banks             | 62     | None         | 🟢 High        |
| 0     | journal_codes     | 0      | None         | 🟡 Low (empty) |
| 0     | roles             | 9      | None         | 🟢 High        |
| 0     | user_type         | 4      | None         | 🟢 High        |
| 0     | settings          | 5      | None         | 🟢 High        |
| 0     | migrations        | 11     | None         | 🟡 Medium      |
| 0     | coa_temps         | 0      | None         | 🟡 Low (empty) |
| 1     | users             | 9      | user_type    | 🟢 High        |
| 1     | bank_accounts     | 135    | banks        | 🟢 High        |
| 1     | coa               | 277    | self         | 🔴 Critical    |
| 1     | assets            | 14     | 3 tables     | 🟢 High        |
| 2     | assets_image      | 13     | assets       | 🟢 Medium      |
| 2     | coa_bank_accounts | 17     | 2 tables     | 🟢 Medium      |
| 2     | coa_movements     | 4,466  | coa          | 🔴 Critical    |
| 2     | user_roles        | 22     | 2 tables     | 🟢 Medium      |
| 2     | journals          | 6,123  | 2 tables     | 🔴 Critical    |
| 2     | report_headers    | 61     | none         | 🟢 Medium      |
| 2     | report_content    | 309    | 2 tables     | 🟢 Medium      |
| 3     | journal_details   | 17,024 | 2 tables     | 🔴 Critical    |
| 3     | logs              | 59,025 | 2 tables     | 🟡 Medium      |
| 3     | message           | 3      | 2 tables     | 🟡 Low         |

## Migration Statistics

- **Total Tables**: 26 (23 base + 3 views)
- **Total Rows**: ~94,000+
- **Largest Table**: logs (59,025 rows)
- **Most Dependencies**: journal_details (depends on journals → users, bank_accounts → banks, user_type)
- **Critical Path**: user_type → users → journals → journal_details

## Execution Time Estimates

| Level     | Tables | Est. Rows   | Est. Time    |
| --------- | ------ | ----------- | ------------ |
| 0         | 10     | ~108        | 10-30 sec    |
| 1         | 4      | ~435        | 30-60 sec    |
| 2         | 7      | ~11,206     | 2-4 min      |
| 3         | 3      | ~76,052     | 3-5 min      |
| **Total** | **24** | **~94,000** | **5-10 min** |

_Note: Times are estimates and depend on network speed, server performance, and batch size._
