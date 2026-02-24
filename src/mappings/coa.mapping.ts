import { TableMapping } from "../interfaces/mapping.interface";

// id, name, parent_id, accumluative, status, created_at, updated_at
export const coaMapping: TableMapping = {
  sourceTable: "coa",
  destinationTable: "coa",
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
      source: "parent_id",
      destination: "parent_id",
    },
    {
      source: "accumulative",
      destination: "accumulative",
    },
    {
      source: "status",
      destination: "status",
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
