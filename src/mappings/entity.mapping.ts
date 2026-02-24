import { TableMapping } from "../interfaces/mapping.interface";

export const entityMapping: TableMapping = {
  sourceTable: "entity",
  destinationTable: "entity",
  columns: [
    {
      source: "id",
      destination: "id",
    },
    {
      source: "name",
      destination: "name",
    },
    {
      source: "description",
      destination: "description",
    },
    {
      source: "is_deleted",
      destination: "is_deleted",
    },
    {
      source: "created_at",
      destination: "created_at",
    },
    {
      source: "created_by",
      destination: "created_by",
    },
    {
      source: "updated_at",
      destination: "updated_at",
    },
    {
      source: "updated_by",
      destination: "updated_by",
    },
    // New columns in destination that don't exist in source
    {
      source: "ownership_percentage",
      destination: "ownership_percentage",
      defaultValue: "100", // Default to 100% ownership
      comment: "New field in destination - defaulting to 100%",
    },
    {
      source: "status",
      destination: "status",
      defaultValue: "active",
      comment: "New field in destination - defaulting to active",
    },
    {
      source: "is_upload_enabled",
      destination: "is_upload_enabled",
      defaultValue: 1,
      comment: "New field in destination - defaulting to enabled",
    },
  ],
};
