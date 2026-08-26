# HISS Assessment for the $AASA Base Treasury

## Decision

**HISS cannot create or host the $AASA payment and reward treasury on Base.** HISS creator vaults are restricted to **Robinhood Chain** (mainnet `4663`, testnet `46630`) and canonical USDG. The HISS vault validation path rejects Base (`8453`) as a vault chain; Base is used only for separately configured x402 payment settlement. [1]

The canonical HISS status endpoint currently reports live infrastructure and deployed/verified vault contracts on Robinhood Chain. That status applies to HISS’s own USDG vault system, not to a Base B20 treasury for $AASA. [2]

| Requested role | HISS fit | Decision |
|---|---|---|
| Create $AASA payment-vault address on Base | No. Base is not a HISS vault chain. | Use `AASA Treasury` Safe on Base. |
| Create $AASA reward-vault address on Base | No. HISS creator vaults use USDG on Robinhood Chain. | Use `AASA Rewards` Safe on Base. |
| Auto-convert $AASA to ETH and purchase reward tokens | No. HISS does not place, route, sign, or broadcast orders. | Prepare an approval record; execute separately through the project multisig after explicit approval. |
| Validate a separate Robinhood Chain USDG creator-vault concept | Yes, in preparation/readiness mode only. | Keep this separate from the $AASA Base treasury. |
| Analyze public-company stocks | Not a treasury-vault control. `stock-analysis` can research public equities, but cannot validate a Base reward-token address or choose allocations. | Keep stock tickers and Base token addresses in separate allowlists. |

## Correct implementation division

1. **Base Safe governance:** Create two 2-of-3 Safe accounts on Base: `AASA Treasury` for memo-tagged $AASA NFT payments, and `AASA Rewards` for purchased reward-token custody.
2. **Website and payment record:** Use the Base B20 payment path to create and reconcile an order memo. The site prepares a treasury action but cannot execute it.
3. **Custom Base contracts:** If a future audited payment or staking contract is needed, use the secure-contract workflow with OpenZeppelin components after a Solidity project and threat model are established. No existing contracts were found in this project.
4. **HISS:** Use only for a separate Robinhood Chain USDG-vault readiness workflow, if independently desired. HISS does not custody project funds and does not execute trades.

## References

[1]: https://www.hiss.finance/skill.md
[2]: https://www.hiss.finance/api/status
