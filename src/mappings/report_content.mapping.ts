import { TableMapping } from "../interfaces/mapping.interface";

// id, rh_id, coa_id
export const reportContentMapping: TableMapping = {
  sourceTable: "report_content",
  destinationTable: "report_content",
  dependencies: ["report_headers", "coa"], // Must migrate report_headers and coa first
  columns: [
    {
      source: "id",
      destination: "id",
    },
    {
      source: "rh_id",
      destination: "rh_id",
    },
    {
      source: "coa_id",
      destination: "coa_id",
    },
  ],
};
