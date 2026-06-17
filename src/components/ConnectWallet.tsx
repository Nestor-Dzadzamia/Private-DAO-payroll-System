"use client";
import { useCallback, useState } from "react";
import { useConfig, useConnectors } from "wagmi";
import type { Connector } from "wagmi";
import { prepareWagmiHinkal } from "@hinkal/common/providers/prepareWagmiHinkal";
import { useHinkal } from "@/context/HinkalContext";
import { Button } from "./ui/Button";

export function ConnectWallet() {
  const connectors = useConnectors();
  const config = useConfig();
  const { setHinkal, setChainId, setDataLoaded, setShieldedAddress } =
    useHinkal();
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = useCallback(
    async (connector: Connector) => {
      try {
        setError(null);
        setConnectingId(connector.id);
        const hinkal = await prepareWagmiHinkal(connector, config);
        setHinkal(hinkal);
        setShieldedAddress(hinkal.userKeys.getShieldedPublicKey());
        setChainId(hinkal.getCurrentChainId());
        setDataLoaded(true);
      } catch (err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes("network") || msg.toLowerCase().includes("axios")) {
          setError("Cannot reach Hinkal API. Make sure you are on a supported network (Polygon, Arbitrum, Base) and try again.");
        } else if (msg.toLowerCase().includes("user rejected") || msg.toLowerCase().includes("cancel")) {
          setError("Signature cancelled. Click confirm in MetaMask to continue.");
        } else {
          setError("Connection failed: " + msg);
        }
      } finally {
        setConnectingId(null);
      }
    },
    [config, setHinkal, setShieldedAddress, setChainId, setDataLoaded]
  );

  return (
    <div className="flex flex-col gap-3">
      {connectors.map((connector) => (
        <Button
          key={connector.id}
          variant="secondary"
          loading={connectingId === connector.id}
          disabled={!!connectingId}
          onClick={() => handleConnect(connector)}
          className="w-full justify-center"
        >
          {connectingId === connector.id
            ? "Signing in to Hinkal..."
            : `Connect with ${connector.name}`}
        </Button>
      ))}

      {error && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-3 space-y-2">
          <p className="text-red-400 text-xs leading-relaxed">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-500 text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
