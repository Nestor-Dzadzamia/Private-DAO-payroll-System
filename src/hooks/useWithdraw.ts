"use client";
import { useCallback, useState } from "react";
import { ERC20Token, getAmountInWei } from "@hinkal/common";
import { useHinkal } from "@/context/HinkalContext";
import toast from "react-hot-toast";

export function useWithdraw() {
  const { hinkal, chainId, dataLoaded, refreshBalances } = useHinkal();
  const [isProcessing, setIsProcessing] = useState(false);

  const withdraw = useCallback(
    async (token: ERC20Token, amount: string, recipientAddress: string) => {
      if (!dataLoaded || !hinkal) {
        toast.error("Wallet not connected");
        return;
      }

      try {
        setIsProcessing(true);
        toast.loading("Generating ZK proof…", { id: "withdraw" });

        const amountInWei = getAmountInWei(token, amount);
        const tx = await hinkal.withdraw(
          [token],
          [-amountInWei],
          recipientAddress,
          false
        );

        if (tx && typeof tx === "object" && "hash" in tx) {
          await hinkal.waitForTransaction(chainId!, tx.hash as string);
        }

        toast.success("Withdrawal complete!", { id: "withdraw" });
        await refreshBalances();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Withdrawal failed";
        toast.error(msg, { id: "withdraw" });
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    },
    [hinkal, chainId, dataLoaded, refreshBalances]
  );

  return { withdraw, isProcessing };
}
