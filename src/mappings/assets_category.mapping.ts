import { TableMapping } from "../interfaces/mapping.interface";

export const assetsCategoryMapping: TableMapping = {
  sourceTable: "assets_category",
  destinationTable: "assets_category",

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
  ],
};
