import { TableMapping } from "../interfaces/mapping.interface";

// id, coa_id, start_period, end_period, previous_period, beginning, debit_movement, credit_movement, balance, created_at, updated_at
export const coaMovementsMapping: TableMapping = {
  sourceTable: "coa_movements",
  destinationTable: "coa_movements",
  dependencies: ["coa"], // Must migrate coa first
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
      source: "start_period",
      destination: "start_period",
    },
    {
      source: "end_period",
      destination: "end_period",
    },
    {
      source: "previous_period",
      destination: "previous_period",
    },
    {
      source: "beginning",
      destination: "beginning",
    },
    {
      source: "debit_movement",
      destination: "debit_movement",
    },
    {
      source: "credit_movement",
      destination: "credit_movement",
    },
    {
      source: "balance",
      destination: "balance",
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
