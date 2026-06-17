"use client";
import {
  ERC20Token,
  EthereumNetwork,
  Hinkal,
  TokenBalance,
  getERC20Registry,
  networkRegistry,
} from "@hinkal/common";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type FC,
  type ReactNode,
  type SetStateAction,
} from "react";
import { Connector } from "wagmi";

type HinkalContextType = {
  hinkal: Hinkal<Connector>;
  setHinkal: Dispatch<SetStateAction<Hinkal<Connector>>>;
  chainId?: number;
  setChainId: (id: number) => void;
  selectedNetwork: EthereumNetwork | undefined;
  dataLoaded: boolean;
  setDataLoaded: (val: boolean) => void;
  shieldedAddress: string | undefined;
  setShieldedAddress: Dispatch<SetStateAction<string | undefined>>;
  erc20List: ERC20Token[];
  balances: TokenBalance[];
  refreshBalances: () => Promise<void>;
};

const hinkalInstance = typeof window !== "undefined" ? new Hinkal<Connector>() : (null as unknown as Hinkal<Connector>);

const HinkalContext = createContext<HinkalContextType>({
  hinkal: hinkalInstance,
  setHinkal: () => {},
  chainId: undefined,
  setChainId: () => {},
  selectedNetwork: undefined,
  dataLoaded: false,
  setDataLoaded: () => {},
  shieldedAddress: undefined,
  setShieldedAddress: () => {},
  erc20List: [],
  balances: [],
  refreshBalances: async () => {},
});

export const HinkalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [hinkal, setHinkal] = useState<Hinkal<Connector>>(hinkalInstance);
  const [chainId, setChainId] = useState<number | undefined>();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [shieldedAddress, setShieldedAddress] = useState<string | undefined>();
  const [balances, setBalances] = useState<TokenBalance[]>([]);

  const networkList = useMemo(() => Object.values(networkRegistry ?? {}), []);
  const selectedNetwork = useMemo(
    () => networkList.find((n) => n.chainId === chainId),
    [chainId, networkList]
  );

  const erc20List = useMemo(
    () => (chainId ? getERC20Registry(chainId) : []),
    [chainId]
  );

  const refreshBalances = useCallback(async () => {
    if (!dataLoaded) return;
    try {
      const ethAddress = await hinkal.getEthereumAddress();
      const bals = await hinkal.getBalances(
        chainId!,
        hinkal.userKeys.getShieldedPrivateKey(),
        hinkal.userKeys.getShieldedPublicKey(),
        ethAddress,
        false,
        true
      );
      setBalances(Array.from(bals.values()));
    } catch (err) {
      console.error("Balance refresh error:", err);
    }
  }, [dataLoaded, hinkal, chainId]);

  useEffect(() => {
    if (!dataLoaded) return;
    refreshBalances();
    const interval = setInterval(refreshBalances, 60_000);
    return () => clearInterval(interval);
  }, [dataLoaded, refreshBalances]);

  return (
    <HinkalContext.Provider
      value={{
        hinkal,
        setHinkal,
        chainId,
        setChainId,
        selectedNetwork,
        dataLoaded,
        setDataLoaded,
        shieldedAddress,
        setShieldedAddress,
        erc20List,
        balances,
        refreshBalances,
      }}
    >
      {children}
    </HinkalContext.Provider>
  );
};

export const useHinkal = () => useContext(HinkalContext);
