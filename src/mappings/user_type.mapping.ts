import { TableMapping } from "../interfaces/mapping.interface";

export const userTypeMapping: TableMapping = {
  sourceTable: "user_type",
  destinationTable: "user_type",
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
      source: "created_at",
      destination: "created_at",
    },
    {
      source: "updated_at",
      destination: "updated_at",
    },
  ],
};
