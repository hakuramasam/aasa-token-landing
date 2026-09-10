import { createPublicClient, createWalletClient, custom, http, parseUnits, type Address, type Chain, type Hash } from "viem";
import { base } from "viem/chains";

export const BASE_CHAIN_ID = 8453;
export const BASE_USDC_ADDRESS = (import.meta.env.VITE_BASE_USDC_ADDRESS || "0x0000000000000000000000000000000000000000") as Address;
export const FAIR_LAUNCH_ADDRESS = (import.meta.env.VITE_FAIR_LAUNCH_ADDRESS || "0x0000000000000000000000000000000000000000") as Address;

const erc20Abi = [
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "allowance", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

export const fairLaunchAbi = [
  { type: "function", name: "commit", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
  { type: "function", name: "refundBeforeFinalization", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "claim", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "allocationFor", stateMutability: "view", inputs: [{ name: "committed", type: "uint256" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "commitments", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "deposited", type: "uint256" }, { name: "claimed", type: "bool" }] },
  { type: "function", name: "totalCommitted", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "raiseTarget", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "tokenPrice", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

export type Eip1193Provider = { request(args: { method: string; params?: unknown[] }): Promise<unknown> };

function providerOrThrow(provider: Eip1193Provider | undefined) {
  if (!provider) throw new Error("No browser wallet detected. Install or unlock a Base-compatible wallet.");
  return provider;
}

export async function connectBaseWallet(provider: Eip1193Provider | undefined) {
  const walletProvider = providerOrThrow(provider);
  const accounts = await walletProvider.request({ method: "eth_requestAccounts" });
  const address = Array.isArray(accounts) && typeof accounts[0] === "string" ? accounts[0] as Address : undefined;
  if (!address) throw new Error("No wallet account returned.");
  const chainId = await walletProvider.request({ method: "eth_chainId" });
  if (Number.parseInt(String(chainId), 16) !== BASE_CHAIN_ID) {
    try {
      await walletProvider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x2105" }] });
    } catch (error) {
      throw new Error("Switch your wallet to Base before committing.", { cause: error });
    }
  }
  return address;
}

function clients(provider: Eip1193Provider) {
  const transport = custom(provider);
  return {
    wallet: createWalletClient({ chain: base, transport }),
    public: createPublicClient({ chain: base, transport: http() }),
  };
}

export async function approveAndCommit(provider: Eip1193Provider | undefined, address: Address, usdcAmount: string, decimals = 6): Promise<{ approvalHash: Hash; commitHash: Hash }> {
  const walletProvider = providerOrThrow(provider);
  if (FAIR_LAUNCH_ADDRESS === "0x0000000000000000000000000000000000000000") throw new Error("FairLaunch contract address is not configured.");
  const { wallet } = clients(walletProvider);
  const amount = parseUnits(usdcAmount, decimals);
  const approvalHash = await wallet.writeContract({ address: BASE_USDC_ADDRESS, abi: erc20Abi, functionName: "approve", args: [FAIR_LAUNCH_ADDRESS, amount], account: address, chain: base });
  const commitHash = await wallet.writeContract({ address: FAIR_LAUNCH_ADDRESS, abi: fairLaunchAbi, functionName: "commit", args: [amount], account: address, chain: base });
  return { approvalHash, commitHash };
}

export async function requestRefund(provider: Eip1193Provider | undefined, address: Address): Promise<Hash> {
  const walletProvider = providerOrThrow(provider);
  const { wallet } = clients(walletProvider);
  return wallet.writeContract({ address: FAIR_LAUNCH_ADDRESS, abi: fairLaunchAbi, functionName: "refundBeforeFinalization", account: address, chain: base });
}

export async function claimAllocation(provider: Eip1193Provider | undefined, address: Address): Promise<Hash> {
  const walletProvider = providerOrThrow(provider);
  const { wallet } = clients(walletProvider);
  return wallet.writeContract({ address: FAIR_LAUNCH_ADDRESS, abi: fairLaunchAbi, functionName: "claim", account: address, chain: base });
}

export async function previewAllocation(provider: Eip1193Provider | undefined, committedUsdc: bigint): Promise<bigint> {
  const walletProvider = providerOrThrow(provider);
  const { public: publicClient } = clients(walletProvider);
  return publicClient.readContract({ address: FAIR_LAUNCH_ADDRESS, abi: fairLaunchAbi, functionName: "allocationFor", args: [committedUsdc] });
}
