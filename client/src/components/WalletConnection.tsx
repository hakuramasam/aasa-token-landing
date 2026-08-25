import { BASE_CHAIN_HEX, isBaseChain, resolveWalletState, shortenWalletAddress, type WalletConnectionState } from "@/lib/walletNetwork";
import { Check, CircleAlert, Loader2, ShieldCheck, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import "./WalletConnection.css";

type Eip1193Request = { method: string; params?: unknown[] };
type Eip1193Provider = {
  request: (request: Eip1193Request) => Promise<unknown>;
  on?: (event: "accountsChanged" | "chainChanged", listener: (value: unknown) => void) => void;
  removeListener?: (event: "accountsChanged" | "chainChanged", listener: (value: unknown) => void) => void;
};

type WalletConnectionProps = {
  walletAddress: string;
  onWalletAddressChange: (address: string) => void;
};

const baseNetwork = {
  chainId: BASE_CHAIN_HEX,
  chainName: "Base",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://mainnet.base.org"],
  blockExplorerUrls: ["https://basescan.org"],
};

function errorMessage(error: unknown) {
  if (typeof error === "object" && error && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Wallet connection was not approved.";
}

export function WalletConnection({ walletAddress, onWalletAddressChange }: WalletConnectionProps) {
  const [state, setState] = useState<WalletConnectionState>("idle");
  const [chainId, setChainId] = useState<string>("");
  const provider = typeof window === "undefined"
    ? undefined
    : (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
  const onBase = isBaseChain(chainId);
  const displayAddress = useMemo(() => (walletAddress ? shortenWalletAddress(walletAddress) : "No wallet connected"), [walletAddress]);

  useEffect(() => {
    if (!provider) {
      setState("unavailable");
      return;
    }
    let active = true;

    const syncWallet = async () => {
      try {
        const [accounts, currentChain] = await Promise.all([
          provider.request({ method: "eth_accounts" }),
          provider.request({ method: "eth_chainId" }),
        ]);
        if (!active) return;
        const address = Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] : "";
        const normalizedChain = typeof currentChain === "string" ? currentChain : "";
        setChainId(normalizedChain);
        onWalletAddressChange(address);
        setState(resolveWalletState(true, address, normalizedChain));
      } catch {
        if (active) setState("error");
      }
    };

    const handleAccounts = (accounts: unknown) => {
      const address = Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] : "";
      onWalletAddressChange(address);
      setState(resolveWalletState(true, address, chainId));
    };
    const handleChain = (nextChain: unknown) => {
      const normalizedChain = typeof nextChain === "string" ? nextChain : "";
      setChainId(normalizedChain);
      setState(resolveWalletState(true, walletAddress, normalizedChain));
    };

    void syncWallet();
    provider.on?.("accountsChanged", handleAccounts);
    provider.on?.("chainChanged", handleChain);
    return () => {
      active = false;
      provider.removeListener?.("accountsChanged", handleAccounts);
      provider.removeListener?.("chainChanged", handleChain);
    };
  }, [onWalletAddressChange, provider]);

  async function ensureBaseNetwork() {
    if (!provider) return false;
    const currentChain = await provider.request({ method: "eth_chainId" });
    if (typeof currentChain === "string" && isBaseChain(currentChain)) {
      setChainId(currentChain);
      return true;
    }
    try {
      await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BASE_CHAIN_HEX }] });
    } catch (error: unknown) {
      const errorCode = typeof error === "object" && error && "code" in error ? (error as { code?: number }).code : undefined;
      if (errorCode !== 4902) throw error;
      await provider.request({ method: "wallet_addEthereumChain", params: [baseNetwork] });
      await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BASE_CHAIN_HEX }] });
    }
    const nextChain = await provider.request({ method: "eth_chainId" });
    const normalizedChain = typeof nextChain === "string" ? nextChain : "";
    setChainId(normalizedChain);
    return isBaseChain(normalizedChain);
  }

  async function connect() {
    if (!provider) {
      setState("unavailable");
      toast.error("No browser wallet detected. Install or unlock a Base-compatible wallet first.");
      return;
    }
    setState("connecting");
    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      const address = Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] : "";
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error("No compatible account returned.");
      onWalletAddressChange(address);
      const networkReady = await ensureBaseNetwork();
      setState(networkReady ? "connected" : "wrong-network");
      if (networkReady) toast.success(`Wallet connected: ${shortenWalletAddress(address)}`);
    } catch (error) {
      setState(walletAddress ? "wrong-network" : "error");
      toast.error(errorMessage(error));
    }
  }

  const actionLabel = state === "connecting"
    ? "Connecting"
    : state === "wrong-network"
      ? "Switch to Base"
      : walletAddress && onBase
        ? "Change wallet"
        : "Connect browser wallet";

  return (
    <section className={`wallet-connection wallet-connection--${state}`} aria-label="Base wallet connection">
      <div className="wallet-connection__topline"><span>WALLET CONNECTION</span><span>BASE MAINNET / 8453</span></div>
      <div className="wallet-connection__main">
        <div className="wallet-connection__icon"><Wallet size={25} /></div>
        <div className="wallet-connection__copy">
          <strong>{displayAddress}</strong>
          <span>{state === "connected" ? "Base network verified for this creator draft." : state === "wrong-network" ? "Switch to Base before continuing." : state === "unavailable" ? "No compatible browser wallet detected." : "Use the wallet intended to receive this creator draft."}</span>
        </div>
        <button type="button" className="creator-button creator-button--outline" onClick={connect} disabled={state === "connecting" || state === "unavailable"}>
          {state === "connecting" && <Loader2 className="spin" size={16} />}{actionLabel}
        </button>
      </div>
      <div className="wallet-connection__status">
        {state === "connected" ? <Check size={15} /> : state === "wrong-network" || state === "unavailable" || state === "error" ? <CircleAlert size={15} /> : <ShieldCheck size={15} />}
        <span>{state === "connected" ? "Connected for draft attribution. No signing or transaction request has been made." : "Connection may prompt your wallet to expose an address or switch to Base. It will never request your recovery phrase, private key, signature, or transaction."}</span>
      </div>
    </section>
  );
}
