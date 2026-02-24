import { TableMapping } from "../interfaces/mapping.interface";

export const userRoleMapping: TableMapping = {
  sourceTable: "user_role",
  destinationTable: "user_role",
  dependencies: ["users", "roles"], // Must migrate users and roles first
  columns: [
    {
      source: "user_id",
      destination: "user_id",
    },
    {
      source: "role_id",
      destination: "role_id",
    },
  ],
};
