import { describe, expect, it } from "vitest";
import { BASE_CHAIN_HEX, isBaseChain, resolveWalletState, shortenWalletAddress } from "./walletNetwork";

describe("Base wallet helpers", () => {
  it("recognizes the Base mainnet chain ID in hex and decimal", () => {
    expect(isBaseChain(BASE_CHAIN_HEX)).toBe(true);
    expect(isBaseChain(8453)).toBe(true);
    expect(isBaseChain("0x1")).toBe(false);
  });

  it("shortens a valid address without altering its prefix or suffix", () => {
    expect(shortenWalletAddress("0x1111111111111111111111111111111111112222")).toBe("0x1111…2222");
  });

  it("resolves unavailable, wrong-network, and Base-connected wallet states", () => {
    const wallet = "0x1111111111111111111111111111111111112222";
    expect(resolveWalletState(false, wallet, BASE_CHAIN_HEX)).toBe("unavailable");
    expect(resolveWalletState(true, wallet, "0x1")).toBe("wrong-network");
    expect(resolveWalletState(true, wallet, BASE_CHAIN_HEX)).toBe("connected");
  });
});
