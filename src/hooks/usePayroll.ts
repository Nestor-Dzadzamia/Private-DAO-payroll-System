"use client";
import { useCallback, useState } from "react";
import { getAmountInWei, ERC20Token } from "@hinkal/common";
import { useHinkal } from "@/context/HinkalContext";
import { PayrollEntry, PayrollStatus, TransferResult } from "@/types/payroll";
import toast from "react-hot-toast";

export function usePayroll() {
  const { hinkal, chainId, dataLoaded, refreshBalances } = useHinkal();
  const [status, setStatus] = useState<PayrollStatus>("idle");
  const [results, setResults] = useState<TransferResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const runPayroll = useCallback(
    async (entries: PayrollEntry[], token: ERC20Token) => {
      if (!dataLoaded || !hinkal) {
        toast.error("Wallet not connected");
        return;
      }

      const initialResults: TransferResult[] = entries.map((entry) => ({
        entry,
        status: "pending",
      }));
      setResults(initialResults);
      setStatus("depositing");
      setCurrentIndex(-1);

      try {
        toast.loading("Depositing and paying contributors privately via Hinkal…", {
          id: "deposit",
        });

        const recipientAmounts = entries.map((entry) =>
          getAmountInWei(token, entry.amount)
        );
        const recipientAddresses = entries.map((entry) => entry.address);

        const tx = await hinkal.depositAndWithdraw(
          token,
          recipientAmounts,
          recipientAddresses
        );

        const txHash = typeof tx === "string" ? tx : undefined;
        if (txHash) {
          await hinkal.waitForTransaction(chainId!, txHash);
        }

        setStatus("transferring");
        setResults((prev) =>
          prev.map((r) => ({ ...r, status: "success", txHash }))
        );

        setStatus("done");
        setCurrentIndex(-1);
        await refreshBalances();
        toast.success("Payroll complete! Paid privately via Hinkal.", {
          id: "deposit",
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Payroll failed";
        setStatus("error");
        setResults((prev) =>
          prev.map((r) => ({ ...r, status: "error", error: msg }))
        );
        toast.error(msg, { id: "deposit" });
      }
    },
    [hinkal, chainId, dataLoaded, refreshBalances]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setResults([]);
    setCurrentIndex(-1);
  }, []);

  return { runPayroll, status, results, currentIndex, reset };
}
