import { TableMapping } from "../interfaces/mapping.interface";

// id, journal_id, message, from_id, to_id, type, read, created_at, updated_at
export const messageMapping: TableMapping = {
  sourceTable: "messages",
  destinationTable: "messages",
  dependencies: ["journals", "users"], // Must migrate journals and users first
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
      source: "message",
      destination: "message",
    },
    {
      source: "from_id",
      destination: "from_id",
    },
    {
      source: "to_id",
      destination: "to_id",
    },
    {
      source: "type",
      destination: "type",
    },
    {
      source: "read",
      destination: "read",
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
