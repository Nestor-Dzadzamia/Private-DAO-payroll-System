"use client";
import { http, createConfig } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { networkRegistry } from "@hinkal/common";
import { mainnet, polygon, arbitrum, base, optimism } from "wagmi/chains";

const chains = [polygon, arbitrum, base, optimism, mainnet] as const;

export const wagmiConfig =
  typeof window === "undefined"
    ? null
    : (() => {
        const transports = chains.reduce(
          (acc, chain) => {
            const networkData = networkRegistry[chain.id];
            acc[chain.id] = http(networkData?.fetchRpcUrl || undefined);
            return acc;
          },
          {} as Record<number, ReturnType<typeof http>>
        );

        return createConfig({
          chains,
          connectors: [
            metaMask(),
          ],
          transports,
        });
      })();
