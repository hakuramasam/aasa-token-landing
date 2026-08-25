export const BASE_CHAIN_ID = 8453;
export const BASE_CHAIN_HEX = "0x2105";
export type WalletConnectionState = "idle" | "connecting" | "connected" | "wrong-network" | "unavailable" | "error";

export function isBaseChain(chainId: string | number | null | undefined) {
  if (typeof chainId === "number") return chainId === BASE_CHAIN_ID;
  if (!chainId) return false;
  return Number.parseInt(chainId, 16) === BASE_CHAIN_ID;
}

export function shortenWalletAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function resolveWalletState(hasProvider: boolean, address: string, chainId: string | number | null | undefined): WalletConnectionState {
  if (!hasProvider) return "unavailable";
  if (!address) return "idle";
  return isBaseChain(chainId) ? "connected" : "wrong-network";
}
