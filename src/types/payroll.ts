export type PayrollEntry = {
  name: string;
  address: string;
  amount: string;
};

export type PayrollStatus = "idle" | "depositing" | "transferring" | "done" | "error";

export type TransferResult = {
  entry: PayrollEntry;
  status: "pending" | "success" | "error";
  txHash?: string;
  error?: string;
};
