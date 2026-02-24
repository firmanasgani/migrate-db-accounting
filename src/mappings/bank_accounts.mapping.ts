import { TableMapping } from "../interfaces/mapping.interface";

// id, bank_id, name, own, deleted, created_at, updated_at
export const bankAccountsMapping: TableMapping = {
  sourceTable: "bank_accounts",
  destinationTable: "bank_accounts",
  dependencies: ["banks"],
  columns: [
    {
      source: "id",
      destination: "id",
    },
    {
      source: "bank_id",
      destination: "bank_id",
    },
    {
      source: "name",
      destination: "name",
    },
    {
      source: "own",
      destination: "own",
    },
    {
      source: "deleted",
      destination: "deleted",
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
