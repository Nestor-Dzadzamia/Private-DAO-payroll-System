"use client";
import { useDisconnect } from "wagmi";
import { useHinkal } from "@/context/HinkalContext";

export function DisconnectButton() {
  const { disconnect } = useDisconnect();
  const { disconnectHinkal } = useHinkal();

  const handleDisconnect = () => {
    disconnect();
    disconnectHinkal();
  };

  return (
    <button
      onClick={handleDisconnect}
      className="text-xs text-slate-500 hover:text-red-400 underline cursor-pointer"
    >
      Disconnect
    </button>
  );
}
