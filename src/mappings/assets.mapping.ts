import { TableMapping } from "../interfaces/mapping.interface";

/**
 * Assets Table Mapping
 *
 * Source: vico_accounting.assets (18 columns, 14 rows)
 * Destination: accounting_dev.assets (TBD - will be determined from destination structure)
 *
 * Dependencies:
 * - assets_location (location_id)
 * - assets_category (category_id)
 * - entity (entity_id)
 */
export const assetsMapping: TableMapping = {
  sourceTable: "assets",
  destinationTable: "assets", // Assuming same table name in destination

  dependencies: ["assets_category"], // TODO: Add assets_location and entity when mappings are created

  columns: [
    {
      source: "id",
      destination: "id",
      required: true,
      comment: "Primary key - UUID varchar(36)",
    },
    {
      source: "location_id",
      destination: "location_id",
      required: true,
      comment: "Foreign key to assets_location table - varchar(36)",
    },
    {
      source: "category_id",
      destination: "category_id",
      required: true,
      comment: "Foreign key to assets_category table - int",
    },
    {
      source: "number_list",
      destination: "number_list",
      required: false,
      comment: "Asset number in list - int, nullable",
    },
    {
      source: "spesification",
      destination: "spesification",
      required: false,
      comment:
        'Asset specification - text, nullable. Note: typo fix from "spesification" to "specification"',
      transform: (value) => value || null,
    },
    {
      source: "useful_life",
      destination: "useful_life",
      required: false,
      comment: "Useful life in years - int, nullable",
    },
    {
      source: "code",
      destination: "code",
      required: true,
      comment: "Asset code - varchar(100)",
    },
    {
      source: "status",
      destination: "status",
      required: false,
      comment: "Asset status - varchar(100), nullable",
    },
    {
      source: "user",
      destination: "user",
      required: false,
      comment: "User assigned to asset - varchar(100), nullable",
    },
    {
      source: "entity_id",
      destination: "entity_id",
      required: false,
      comment: "Foreign key to entity table - varchar(36), nullable",
    },
    {
      source: "barcode_date",
      destination: "barcode_date",
      required: false,
      comment: "Barcode assignment date - date, nullable",
    },
    {
      source: "images",
      destination: "images",
      required: false,
      comment:
        "Asset images (legacy field) - text, nullable. May be replaced by assets_image table",
    },
    {
      source: "description",
      destination: "description",
      required: false,
      comment: "Asset description - text, nullable",
    },
    {
      source: "acquisition_cost",
      destination: "acquisition_cost",
      required: false,
      comment: "Asset acquisition cost - double, nullable",
    },
    {
      source: "is_deleted",
      destination: "is_deleted",
      required: false,
      defaultValue: 0,
      comment: "Soft delete flag - tinyint(1), default 0",
    },
    {
      source: "created_at",
      destination: "created_at",
      required: false,
      comment: "Creation timestamp - timestamp, default now()",
    },
    {
      source: "created_by",
      destination: "created_by",
      required: false,
      comment: "Created by user - varchar(100), nullable",
    },
    {
      source: "updated_at",
      destination: "updated_at",
      required: false,
      comment: "Last update timestamp - timestamp, default now()",
    },
    {
      source: "updated_by",
      destination: "updated_by",
      required: false,
      comment: "Last updated by user - varchar(100), nullable",
    },
  ],

  postMigrationValidation: `
    SELECT 
      COUNT(*) as total_migrated,
      COUNT(DISTINCT location_id) as unique_locations,
      COUNT(DISTINCT category_id) as unique_categories,
      SUM(CASE WHEN is_deleted = 0 THEN 1 ELSE 0 END) as active_assets,
      SUM(CASE WHEN is_deleted = 1 THEN 1 ELSE 0 END) as deleted_assets
    FROM assets
  `,
};

/**
 * Expected migration result:
 * - Total rows: 14 (from source)
 * - All foreign keys must be valid
 * - No NULL values in required fields (id, location_id, category_id, code)
 */
