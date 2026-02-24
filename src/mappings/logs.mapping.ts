import { TableMapping } from "../interfaces/mapping.interface";

// id, coa_id, journal_id, user_id, action, before, after, created_at, updated_at
export const logsMapping: TableMapping = {
  sourceTable: "logs",
  destinationTable: "logs",
  dependencies: ["coa", "journals", "users"], // Must migrate coa, journals, and users first
  columns: [
    {
      source: "id",
      destination: "id",
    },
    {
      source: "coa_id",
      destination: "coa_id",
    },
    {
      source: "journal_id",
      destination: "journal_id",
    },
    {
      source: "user_id",
      destination: "user_id",
    },
    {
      source: "action",
      destination: "action",
    },
    {
      source: "before",
      destination: "before",
    },
    {
      source: "after",
      destination: "after",
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
