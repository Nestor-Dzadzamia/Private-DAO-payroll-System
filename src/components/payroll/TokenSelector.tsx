"use client";
import { ERC20Token } from "@hinkal/common";
import { useHinkal } from "@/context/HinkalContext";

type Props = {
  selected: ERC20Token | null;
  onSelect: (token: ERC20Token) => void;
};

export function TokenSelector({ selected, onSelect }: Props) {
  const { erc20List } = useHinkal();

  const usdcTokens = erc20List.filter(
    (t) =>
      t.symbol?.toUpperCase().includes("USDC") ||
      t.symbol?.toUpperCase().includes("USDT")
  );

  const tokens = usdcTokens.length > 0 ? usdcTokens : erc20List.slice(0, 6);

  if (tokens.length === 0) {
    return (
      <p className="text-slate-500 text-sm">
        Connect wallet to see available tokens
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tokens.map((token) => (
        <button
          key={token.erc20TokenAddress}
          onClick={() => onSelect(token)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
            selected?.erc20TokenAddress === token.erc20TokenAddress
              ? "border-violet-500 bg-violet-900/40 text-violet-300"
              : "border-slate-700 text-slate-400 hover:border-slate-500"
          }`}
        >
          {token.symbol}
        </button>
      ))}
    </div>
  );
}
