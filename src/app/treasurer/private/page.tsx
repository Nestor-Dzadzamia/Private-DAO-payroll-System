"use client";
import { useState, useMemo } from "react";
import { ERC20Token, getAmountInWei } from "@hinkal/common";
import Link from "next/link";
import { useHinkal } from "@/context/HinkalContext";
import { usePrivatePayroll } from "@/hooks/usePrivatePayroll";
import { PrivatePayrollEntry } from "@/types/privatePayroll";
import { PrivateCSVUpload } from "@/components/payroll/PrivateCSVUpload";
import { PrivatePayrollTable } from "@/components/payroll/PrivatePayrollTable";
import { TokenSelector } from "@/components/payroll/TokenSelector";
import { Button } from "@/components/ui/Button";
import { ConnectWallet } from "@/components/ConnectWallet";
import { DisconnectButton } from "@/components/DisconnectButton";

export default function PrivateTreasurerPage() {
  const { dataLoaded, shieldedAddress, selectedNetwork } = useHinkal();
  const { runPrivatePayroll, status, results, currentIndex, reset } =
    usePrivatePayroll();

  const [entries, setEntries] = useState<PrivatePayrollEntry[]>([]);
  const [selectedToken, setSelectedToken] = useState<ERC20Token | null>(null);
  const [skipDeposit, setSkipDeposit] = useState(false);

  const totalAmount = useMemo(() => {
    if (!selectedToken || entries.length === 0) return null;
    try {
      return entries.reduce(
        (sum, e) => sum + getAmountInWei(selectedToken, e.amount),
        0n
      );
    } catch {
      return null;
    }
  }, [entries, selectedToken]);

  const totalUSDC = entries.reduce((s, e) => s + parseFloat(e.amount), 0);

  const canRun =
    dataLoaded &&
    entries.length > 0 &&
    selectedToken !== null &&
    totalAmount !== null &&
    (status === "idle" || status === "done" || status === "error");

  const isRunning = status === "depositing" || status === "transferring";

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/treasurer"
            className="text-xs text-slate-500 hover:text-slate-300 mb-1 block"
          >
            ← Back to standard payroll
          </Link>
          <h1 className="text-2xl font-bold text-white">
            Maximum-Privacy Payroll
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Pays directly into each employee&apos;s shielded balance — no
            public address ever appears on-chain for the recipient
          </p>
        </div>
        {dataLoaded && (
          <div className="text-right">
            <span className="text-xs text-emerald-400 flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              {selectedNetwork?.name ?? "Connected"}
            </span>
            {shieldedAddress && (
              <span className="text-xs text-slate-600 font-mono">
                {shieldedAddress.slice(0, 12)}…
              </span>
            )}
            <div className="mt-1">
              <DisconnectButton />
            </div>
          </div>
        )}
      </div>

      <div className="bg-violet-900/20 border border-violet-800/50 rounded-xl p-4 text-xs text-violet-300 space-y-1">
        <p className="font-semibold">How this differs from standard payroll</p>
        <p className="text-violet-300/80">
          Employees must first connect their wallet on the{" "}
          <Link href="/employee" className="underline">
            Claim page
          </Link>{" "}
          and copy their <strong>Recipient Info</strong> string to send you
          out-of-band (Slack, email). Funds land in their shielded balance,
          decoupled in time from your deposit — they withdraw independently,
          whenever and to wherever they choose. This breaks the timing link
          that standard payroll does not.
        </p>
      </div>

      {!dataLoaded ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 space-y-4">
          <p className="text-slate-400 text-sm text-center">
            Connect your wallet to run payroll
          </p>
          <ConnectWallet />
        </div>
      ) : (
        <>
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              1 — Upload Payroll CSV
            </h2>
            <p className="text-xs text-slate-500">
              CSV format:{" "}
              <code className="text-violet-400">
                name;recipientInfo;amount_usdc
              </code>{" "}
              (semicolon-separated — recipient info itself contains commas)
            </p>
            {entries.length === 0 ? (
              <PrivateCSVUpload onEntries={setEntries} />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    {entries.length} employees loaded
                  </span>
                  {(status === "idle" || status === "error") && (
                    <Button
                      variant="ghost"
                      className="text-xs"
                      onClick={() => {
                        setEntries([]);
                        reset();
                      }}
                    >
                      Change CSV
                    </Button>
                  )}
                </div>
                <PrivatePayrollTable
                  entries={entries}
                  results={results.length > 0 ? results : undefined}
                  currentIndex={currentIndex}
                />
              </div>
            )}
          </section>

          {entries.length > 0 && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                2 — Select Token
              </h2>
              <TokenSelector
                selected={selectedToken}
                onSelect={setSelectedToken}
              />
            </section>
          )}

          {entries.length > 0 && selectedToken && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                3 — Run Private Payroll
              </h2>

              <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Recipients</span>
                  <span className="text-slate-200 font-medium">
                    {entries.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total payout</span>
                  <span className="text-slate-200 font-medium">
                    {totalUSDC.toLocaleString()} {selectedToken.symbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Privacy</span>
                  <span className="text-emerald-400 font-medium">
                    Shielded-to-shielded (Hinkal)
                  </span>
                </div>
              </div>

              {isRunning && (
                <div className="text-sm text-slate-400 space-y-1">
                  {status === "depositing" && (
                    <p className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                      Depositing {totalUSDC.toLocaleString()}{" "}
                      {selectedToken.symbol} into shielded pool…
                    </p>
                  )}
                  {status === "transferring" && (
                    <p className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                      Sending shielded transfers ({currentIndex + 1}/
                      {entries.length})…
                    </p>
                  )}
                </div>
              )}

              {status === "done" && (
                <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-4 text-center">
                  <p className="text-emerald-400 font-semibold">
                    Private payroll complete!
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {results.filter((r) => r.status === "success").length}{" "}
                    transfers sent to shielded balances. Employees can now
                    withdraw independently from the Claim page.
                  </p>
                </div>
              )}

              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipDeposit}
                  onChange={(e) => setSkipDeposit(e.target.checked)}
                  className="rounded"
                />
                Skip deposit — use existing shielded balance (for testing)
              </label>

              <Button
                className="w-full justify-center"
                loading={isRunning}
                disabled={!canRun}
                onClick={() => {
                  if (selectedToken && totalAmount)
                    runPrivatePayroll(entries, selectedToken, totalAmount, skipDeposit);
                }}
              >
                {isRunning
                  ? "Running payroll…"
                  : status === "done"
                  ? "Run Another Payroll"
                  : `Run Private Payroll — ${totalUSDC.toLocaleString()} ${selectedToken.symbol}`}
              </Button>
            </section>
          )}
        </>
      )}
    </main>
  );
}
