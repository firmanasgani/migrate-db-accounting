import { TableMapping } from "./types";

// id report_type, report_section, sequence, ytd_adjustment, report_title, is_parent, parent_title
export const reportHeadersMapping: TableMapping = {
  sourceTable: "report_headers",
  destinationTable: "report_headers",
  columns: [
    {
      source: "id",
      destination: "id",
    },
    {
      source: "report_type",
      destination: "report_type",
    },
    {
      source: "report_section",
      destination: "report_section",
    },
    {
      source: "sequence",
      destination: "sequence",
    },
    {
      source: "ytd_adjustment",
      destination: "ytd_adjustment",
    },
    {
      source: "report_title",
      destination: "report_title",
    },
    {
      source: "is_parent",
      destination: "is_parent",
    },
    {
      source: "parent_title",
      destination: "parent_title",
    },
  ],
};
