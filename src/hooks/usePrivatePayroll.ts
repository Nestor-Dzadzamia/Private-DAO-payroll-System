"use client";
import { useCallback, useState } from "react";
import { hinkalTransfer, getAmountInWei, ERC20Token } from "@hinkal/common";
import { useHinkal } from "@/context/HinkalContext";
import {
  PrivatePayrollEntry,
  PrivatePayrollStatus,
  PrivateTransferResult,
} from "@/types/privatePayroll";
import toast from "react-hot-toast";

export function usePrivatePayroll() {
  const { hinkal, chainId, dataLoaded, refreshBalances } = useHinkal();
  const [status, setStatus] = useState<PrivatePayrollStatus>("idle");
  const [results, setResults] = useState<PrivateTransferResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const runPrivatePayroll = useCallback(
    async (entries: PrivatePayrollEntry[], token: ERC20Token, totalAmount: bigint) => {
      if (!dataLoaded || !hinkal) {
        toast.error("Wallet not connected");
        return;
      }

      const initialResults: PrivateTransferResult[] = entries.map((entry) => ({
        entry,
        status: "pending",
      }));
      setResults(initialResults);
      setStatus("depositing");
      setCurrentIndex(-1);

      try {
        toast.loading("Depositing funds into Hinkal shielded pool…", {
          id: "private-deposit",
        });

        const depositTx = await hinkal.deposit([token], [totalAmount]);
        const depositTxHash =
          typeof depositTx === "string"
            ? depositTx
            : depositTx && typeof depositTx === "object" && "hash" in depositTx
              ? (depositTx.hash as string)
              : undefined;
        if (depositTxHash) {
          await hinkal.waitForTransaction(chainId!, depositTxHash);
        }

        toast.success("Funds deposited into shielded pool", { id: "private-deposit" });
        setStatus("transferring");

        let successCount = 0;

        for (let i = 0; i < entries.length; i++) {
          setCurrentIndex(i);
          setResults((prev) =>
            prev.map((r, idx) => (idx === i ? { ...r, status: "pending" } : r))
          );

          const entry = entries[i];
          try {
            const amountInWei = getAmountInWei(token, entry.amount);
            const txHash = await hinkalTransfer(
              hinkal,
              [token],
              [-amountInWei],
              entry.recipientInfo
            );

            successCount++;
            setResults((prev) =>
              prev.map((r, idx) =>
                idx === i ? { ...r, status: "success", txHash } : r
              )
            );
            toast.success(`Sent ${entry.amount} privately to ${entry.name}`);
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Transfer failed";
            setResults((prev) =>
              prev.map((r, idx) =>
                idx === i ? { ...r, status: "error", error: msg } : r
              )
            );
            toast.error(`Failed to pay ${entry.name}: ${msg}`);
          }
        }

        setCurrentIndex(-1);
        await refreshBalances();

        if (successCount === entries.length) {
          setStatus("done");
          toast.success("Private payroll complete! Recipients can claim from their shielded balance.");
        } else if (successCount > 0) {
          setStatus("error");
          toast.error(`Only ${successCount}/${entries.length} transfers succeeded. Deposited funds for the rest remain in your own shielded balance — check the Claim page.`);
        } else {
          setStatus("error");
          toast.error("No transfers succeeded. Your deposited funds remain in your own shielded balance — check the Claim page to recover them.");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Payroll failed";
        setStatus("error");
        toast.error(msg, { id: "private-deposit" });
      }
    },
    [hinkal, chainId, dataLoaded, refreshBalances]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setResults([]);
    setCurrentIndex(-1);
  }, []);

  return { runPrivatePayroll, status, results, currentIndex, reset };
}
