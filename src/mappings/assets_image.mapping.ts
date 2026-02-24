import { TableMapping } from "./types";

export const assetsImageMapping: TableMapping = {
  sourceTable: "assets_image",
  destinationTable: "assets_image",
  columns: [
    {
      source: "id",
      destination: "id",
    },
    {
      source: "asset_id",
      destination: "asset_id",
    },
    {
      source: "image",
      destination: "image",
    },
  ],
};
