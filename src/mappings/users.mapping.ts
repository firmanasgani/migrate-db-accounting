import { TableMapping } from "../interfaces/mapping.interface";

export const usersMapping: TableMapping = {
  sourceTable: "users",
  destinationTable: "users",
  dependencies: ["user_type"],
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
      source: "display_name",
      destination: "display_name",
    },
    {
      source: "password",
      destination: "password",
    },
    {
      source: "email",
      destination: "email",
    },
    {
      source: "phone_number",
      destination: "phone_number",
    },
    {
      source: "type_id",
      destination: "type_id",
    },
    {
      source: "title",
      destination: "title",
    },
    {
      source: "signature",
      destination: "signature",
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

// id, name, display_name, password, email, phone_number, type_id, title, signature, status, created_at, updated_at
