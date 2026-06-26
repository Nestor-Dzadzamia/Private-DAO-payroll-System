export type PrivatePayrollEntry = {
  name: string;
  recipientInfo: string;
  amount: string;
};

export type PrivatePayrollStatus = "idle" | "depositing" | "transferring" | "done" | "error";

export type PrivateTransferResult = {
  entry: PrivatePayrollEntry;
  status: "pending" | "success" | "error";
  txHash?: string;
  error?: string;
};
