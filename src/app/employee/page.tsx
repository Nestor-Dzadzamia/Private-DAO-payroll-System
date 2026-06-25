"use client";
import { useState } from "react";
import { ERC20Token, getAmountInToken } from "@hinkal/common";
import Link from "next/link";
import { useHinkal } from "@/context/HinkalContext";
import { useWithdraw } from "@/hooks/useWithdraw";
import { ConnectWallet } from "@/components/ConnectWallet";
import { Button } from "@/components/ui/Button";

export default function EmployeePage() {
  const { dataLoaded, balances, shieldedAddress, refreshBalances } =
    useHinkal();
  const { withdraw, isProcessing } = useWithdraw();

  const [recipientAddress, setRecipientAddress] = useState("");
  const [selectedToken, setSelectedToken] = useState<ERC20Token | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<string>("");

  const nonZeroBalances = balances.filter((b) => b.balance > 0n);

  const handleSelectBalance = (token: ERC20Token, balance: bigint) => {
    setSelectedToken(token);
    setSelectedAmount(
      Number(getAmountInToken(token, balance)).toFixed(6)
    );
  };

  return (
    <main className="max-w-lg mx-auto px-4 py-10 space-y-8">
      <div>
        <Link
          href="/"
          className="text-xs text-slate-500 hover:text-slate-300 mb-1 block"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-white">Claim My Payment</h1>
        <p className="text-slate-400 text-sm mt-1">
          Withdraw your private balance to any address
        </p>
      </div>

      {!dataLoaded ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 space-y-4">
          <p className="text-slate-400 text-sm text-center">
            Connect the wallet your employer registered to claim your payment
          </p>
          <ConnectWallet />
        </div>
      ) : (
        <>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Shielded Balance
              </h2>
              <Button
                variant="ghost"
                className="text-xs"
                onClick={refreshBalances}
              >
                Refresh
              </Button>
            </div>

            {shieldedAddress && (
              <p className="text-xs text-slate-600 font-mono break-all">
                {shieldedAddress}
              </p>
            )}

            {nonZeroBalances.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">
                No shielded balance found. Ask your treasurer to verify the
                payment was sent.
              </p>
            ) : (
              <div className="space-y-2">
                {nonZeroBalances.map((b, i) => {
                  const formatted = Number(
                    getAmountInToken(b.token, b.balance)
                  ).toFixed(4);
                  const isSelected =
                    selectedToken?.erc20TokenAddress ===
                    b.token.erc20TokenAddress;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectBalance(b.token, b.balance)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer ${
                        isSelected
                          ? "border-violet-500 bg-violet-900/20"
                          : "border-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <span className="text-slate-300 font-medium">
                        {b.token.symbol}
                      </span>
                      <span className="text-slate-200 font-bold">
                        {formatted}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedToken && selectedAmount && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Withdraw To
              </h2>
              <p className="text-xs text-slate-500">
                Use a fresh wallet address for maximum privacy — no on-chain
                link will exist between your employer and this address.
              </p>
              <input
                type="text"
                placeholder="0x... recipient address"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 font-mono"
              />

              <div className="bg-slate-800/50 rounded-xl p-3 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-400 shrink-0">Amount</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={selectedAmount}
                      onChange={(e) => setSelectedAmount(e.target.value)}
                      className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right text-slate-200 font-medium focus:outline-none focus:border-violet-500"
                    />
                    <span className="text-slate-400">
                      {selectedToken.symbol}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Privacy</span>
                  <span className="text-emerald-400">
                    ZK proof generated locally
                  </span>
                </div>
              </div>

              <Button
                className="w-full justify-center"
                loading={isProcessing}
                disabled={
                  !recipientAddress ||
                  !/^0x[0-9a-fA-F]{40}$/.test(recipientAddress) ||
                  !selectedAmount ||
                  isNaN(parseFloat(selectedAmount)) ||
                  parseFloat(selectedAmount) <= 0
                }
                onClick={() =>
                  withdraw(selectedToken, selectedAmount, recipientAddress)
                }
              >
                {isProcessing ? "Generating ZK proof…" : "Withdraw Privately"}
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
