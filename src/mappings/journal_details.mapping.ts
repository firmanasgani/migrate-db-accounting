import { TableMapping } from "../interfaces/mapping.interface";

// id, journal_id, coa_id, amount, type, desc, created_at, updated_at
export const journalDetailsMapping: TableMapping = {
  sourceTable: "journal_details",
  destinationTable: "journal_details",
  dependencies: ["journals", "coa"], // Must migrate journals and coa first due to foreign keys
  columns: [
    {
      source: "id",
      destination: "id",
    },
    {
      source: "journal_id",
      destination: "journal_id",
    },
    {
      source: "coa_id",
      destination: "coa_id",
    },
    {
      source: "amount",
      destination: "amount",
    },
    {
      source: "type",
      destination: "type",
    },
    {
      source: "desc",
      destination: "desc",
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
