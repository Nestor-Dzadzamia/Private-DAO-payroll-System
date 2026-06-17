"use client";
import { useCallback, useState } from "react";
import { hinkalTransfer, getAmountInWei, ERC20Token } from "@hinkal/common";
import { useHinkal } from "@/context/HinkalContext";
import { PayrollEntry, PayrollStatus, TransferResult } from "@/types/payroll";
import toast from "react-hot-toast";

export function usePayroll() {
  const { hinkal, dataLoaded, refreshBalances } = useHinkal();
  const [status, setStatus] = useState<PayrollStatus>("idle");
  const [results, setResults] = useState<TransferResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const runPayroll = useCallback(
    async (entries: PayrollEntry[], token: ERC20Token, totalAmount: bigint) => {
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
        toast.loading("Depositing funds into Hinkal shielded pool...", {
          id: "deposit",
        });

        const depositTx = await hinkal.deposit([token], [totalAmount]);
        if (depositTx && typeof depositTx === "object" && "hash" in depositTx) {
          await hinkal.waitForTransaction(depositTx.hash as string);
        }

        toast.success("Funds deposited into shielded pool", { id: "deposit" });
        setStatus("transferring");

        for (let i = 0; i < entries.length; i++) {
          setCurrentIndex(i);
          setResults((prev) =>
            prev.map((r, idx) =>
              idx === i ? { ...r, status: "pending" } : r
            )
          );

          const entry = entries[i];
          try {
            const amountInWei = getAmountInWei(token, entry.amount);
            await hinkalTransfer(hinkal, [token], [-amountInWei], entry.address);

            setResults((prev) =>
              prev.map((r, idx) =>
                idx === i ? { ...r, status: "success" } : r
              )
            );
            toast.success(`Sent ${entry.amount} to ${entry.name}`);
          } catch (err) {
            const msg =
              err instanceof Error ? err.message : "Transfer failed";
            setResults((prev) =>
              prev.map((r, idx) =>
                idx === i ? { ...r, status: "error", error: msg } : r
              )
            );
            toast.error(`Failed to pay ${entry.name}: ${msg}`);
          }
        }

        setStatus("done");
        setCurrentIndex(-1);
        await refreshBalances();
        toast.success("Payroll complete!");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Payroll failed";
        setStatus("error");
        toast.error(msg, { id: "deposit" });
      }
    },
    [hinkal, dataLoaded, refreshBalances]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setResults([]);
    setCurrentIndex(-1);
  }, []);

  return { runPayroll, status, results, currentIndex, reset };
}
