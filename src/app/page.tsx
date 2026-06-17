"use client";
import Link from "next/link";
import { ConnectWallet } from "@/components/ConnectWallet";
import { useHinkal } from "@/context/HinkalContext";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const { dataLoaded, shieldedAddress } = useHinkal();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-violet-900/30 border border-violet-800/50 text-violet-300 text-xs px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Powered by Hinkal ZK Protocol
          </div>
          <h1 className="text-4xl font-bold text-white">
            Private DAO Payroll
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Pay your contributors on-chain — privately. Competitors see nothing.
            Contributors get paid.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 py-4">
          {[
            { icon: "🔒", label: "ZK Privacy", desc: "No one sees who got paid" },
            { icon: "⚡", label: "One Click", desc: "CSV → done" },
            { icon: "✅", label: "Compliant", desc: "Viewing keys for audits" },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 space-y-1"
            >
              <div className="text-2xl">{f.icon}</div>
              <div className="text-xs font-semibold text-slate-300">
                {f.label}
              </div>
              <div className="text-xs text-slate-500">{f.desc}</div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          {dataLoaded ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 justify-center text-emerald-400 text-sm">
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                Wallet connected
              </div>
              {shieldedAddress && (
                <p className="text-xs text-slate-500 font-mono break-all">
                  Shielded: {shieldedAddress.slice(0, 20)}…
                </p>
              )}
              <div className="flex flex-col gap-2">
                <Link href="/treasurer">
                  <Button className="w-full justify-center">
                    Open Treasurer Dashboard
                  </Button>
                </Link>
                <Link href="/employee">
                  <Button variant="ghost" className="w-full justify-center">
                    Claim My Payment
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-400">
                Connect your wallet to get started
              </p>
              <ConnectWallet />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
