"use client";
import Link from "next/link";
import { ConnectWallet } from "@/components/ConnectWallet";
import { DisconnectButton } from "@/components/DisconnectButton";
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

        <div className="grid grid-cols-3 gap-3 py-4">
          {[
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              ),
              label: "ZK Privacy", desc: "No one sees who got paid"
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              ),
              label: "One Click", desc: "CSV → done"
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
              ),
              label: "Compliant", desc: "Viewing keys for audits"
            },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 space-y-2"
            >
              <div className="ml-10 w-9 h-9 rounded-lg bg-violet-900/40 border border-violet-800/40 flex items-center justify-center text-violet-400">
                {f.icon}
              </div>
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
              <div className="flex items-center justify-center gap-3 text-sm">
                <span className="flex items-center gap-2 text-emerald-400">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                  Wallet connected
                </span>
                <DisconnectButton />
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
