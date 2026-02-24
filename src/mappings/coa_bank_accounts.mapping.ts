import { TableMapping } from "../interfaces/mapping.interface";

export const coaBankAccountMapping: TableMapping = {
  sourceTable: "coa_bank_accounts",
  destinationTable: "coa_bank_accounts",
  dependencies: ["bank_accounts", "coa"], // Must migrate bank_accounts and coa first
  columns: [
    {
      source: "bank_account_id",
      destination: "bank_account_id",
    },
    {
      source: "coa_id",
      destination: "coa_id",
    },
  ],
};
