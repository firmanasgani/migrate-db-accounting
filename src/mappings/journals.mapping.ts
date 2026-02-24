import { TableMapping } from "../interfaces/mapping.interface";

// id, bank_account_sender_id, bank_account_receiver_id, desc, type, payment_type, cheque_no, invoice_no, currency_code, attachment, status, created_date, checked_date, approved_date, posting_date, created_by, checked_by, approved_by, deleted, created_at, updated_at
export const journalMapping: TableMapping = {
  sourceTable: "journals",
  destinationTable: "journals",
  columns: [
    {
      source: "id",
      destination: "id",
    },
    {
      source: "bank_account_sender_id",
      destination: "bank_account_sender_id",
    },
    {
      source: "bank_account_receiver_id",
      destination: "bank_account_receiver_id",
    },
    {
      source: "desc",
      destination: "desc",
    },
    {
      source: "type",
      destination: "type",
    },
    {
      source: "payment_type",
      destination: "payment_type",
    },
    {
      source: "cheque_no",
      destination: "cheque_no",
    },
    {
      source: "invoice_no",
      destination: "invoice_no",
    },
    {
      source: "currency_code",
      destination: "currency_code",
    },
    {
      source: "attachment",
      destination: "attachment",
    },
    {
      source: "status",
      destination: "status",
    },
    {
      source: "created_date",
      destination: "created_date",
    },
    {
      source: "checked_date",
      destination: "checked_date",
    },
    {
      source: "approved_date",
      destination: "approved_date",
    },
    {
      source: "posting_date",
      destination: "posting_date",
    },
    {
      source: "created_by",
      destination: "created_by",
    },
    {
      source: "checked_by",
      destination: "checked_by",
    },
    {
      source: "approved_by",
      destination: "approved_by",
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
