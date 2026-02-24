import { TableMapping } from "../interfaces/mapping.interface";

export const rolesMapping: TableMapping = {
  sourceTable: "roles",
  destinationTable: "roles",
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

// id, name, created_at, updated_at
