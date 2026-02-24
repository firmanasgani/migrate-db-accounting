import { TableMapping } from "../interfaces/mapping.interface";

export const settingsMapping: TableMapping = {
  sourceTable: "settings",
  destinationTable: "settings",
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
      source: "value",
      destination: "value",
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
