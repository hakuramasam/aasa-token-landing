import { createPublicClient, createWalletClient, custom, formatUnits, http, parseUnits } from "viem";
import type { Address, EIP1193Provider } from "viem";

export const ROBINHOOD_CHAIN_ID = 4663;
export const ROBINHOOD_CHAIN_HEX = "0x1237";
export const ROBINHOOD_RPC = "https://rpc.mainnet.chain.robinhood.com";
export const ROBINHOOD_EXPLORER = "https://robinhoodchain.blockscout.com";

export const AASA_NFT = "0x58b7a98353ec7CB651370BB1aB90550a5482648B" as Address;
export const AASA_STAKING = "0xeFea6575F9b075dCC63f0Ce474fB42CDeCA94184" as Address;
export const AASA_TOKEN = "0xA628a08D65B34Ae333196F9Dd53Ac20dd6257DAe" as Address;

const erc20Abi = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint8" }] },
] as const;

const erc721Abi = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "owner", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
] as const;

// The v2 staking contract is the reward/claim surface. These selectors are intentionally
// isolated here so the UI can be updated if the verified ABI exposes different names.
const stakingAbi = [
  { type: "function", name: "pendingRewards", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "claim", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "claimRewards", stateMutability: "nonpayable", inputs: [], outputs: [] },
] as const;

const chain = {
  id: ROBINHOOD_CHAIN_ID,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [ROBINHOOD_RPC] } },
  blockExplorers: { default: { name: "Blockscout", url: ROBINHOOD_EXPLORER } },
} as const;

export function getBrowserProvider(): EIP1193Provider | undefined {
  return (window as Window & { ethereum?: EIP1193Provider }).ethereum;
}

async function ensureRobinhoodNetwork(provider: EIP1193Provider) {
  const current = await provider.request({ method: "eth_chainId" }) as string;
  if (current.toLowerCase() === ROBINHOOD_CHAIN_HEX) return;
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: ROBINHOOD_CHAIN_HEX }] });
  } catch (error: any) {
    if (error?.code !== 4902 && error?.code !== -32603) throw new Error("Please switch your wallet to Robinhood Chain (4663).");
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: ROBINHOOD_CHAIN_HEX,
        chainName: "Robinhood Chain",
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: [ROBINHOOD_RPC],
        blockExplorerUrls: [ROBINHOOD_EXPLORER],
      }],
    });
  }
}

export async function connectRobinhoodWallet(provider?: EIP1193Provider) {
  if (!provider) throw new Error("No EVM wallet detected. Open this site in MetaMask, Robinhood Wallet, or another compatible wallet.");
  await ensureRobinhoodNetwork(provider);
  const wallet = createWalletClient({ chain, transport: custom(provider) });
  const [account] = await wallet.requestAddresses();
  return account;
}

export async function readAasaStatus(account: Address) {
  const publicClient = createPublicClient({ chain, transport: http(ROBINHOOD_RPC) });
  const [tokenRaw, nftRaw, claimableRaw] = await Promise.all([
    publicClient.readContract({ address: AASA_TOKEN, abi: erc20Abi, functionName: "balanceOf", args: [account] }),
    publicClient.readContract({ address: AASA_NFT, abi: erc721Abi, functionName: "balanceOf", args: [account] }),
    publicClient.readContract({ address: AASA_STAKING, abi: stakingAbi, functionName: "pendingRewards", args: [account] }).catch(() => 0n),
  ]);
  return {
    tokenBalance: formatUnits(tokenRaw as bigint, 18),
    nftBalance: (nftRaw as bigint).toString(),
    claimable: formatUnits(claimableRaw as bigint, 18),
    eligible: (nftRaw as bigint) > 0n,
  };
}

export async function claimAasa(provider: EIP1193Provider) {
  await ensureRobinhoodNetwork(provider);
  const wallet = createWalletClient({ chain, transport: custom(provider) });
  const [account] = await wallet.requestAddresses();
  try {
    return await wallet.writeContract({ address: AASA_STAKING, abi: stakingAbi, functionName: "claim", account });
  } catch {
    return await wallet.writeContract({ address: AASA_STAKING, abi: stakingAbi, functionName: "claimRewards", account });
  }
}

export const aasaAddresses = {
  nft: AASA_NFT,
  token: AASA_TOKEN,
  staking: AASA_STAKING,
  explorer: ROBINHOOD_EXPLORER,
};
