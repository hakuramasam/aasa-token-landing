# $AASA NFT Payment and Monthly Reward Architecture

> **Status: preparation design only.** This architecture does not authorize a token transfer, approval, swap, or purchase. A verified contract set, project-controlled treasury multisig, and explicit approval are required before any on-chain execution.

## Validated inputs

| Asset | Base address | Validation result | Payment/reward role |
|---|---|---|---|
| $AASA | `0xb2000000000000000000001582178DD38A037f83` | The supplied address is a native Base B20 asset identified as **Authorized Agentic Social Avatar** with 18 decimals. B20 addresses are native precompiles, so a conventional explorer may not classify them as deployed EVM contracts. | Required NFT creation payment asset and reward-budget denomination. |
| $BPAD | `0xf5F11BC9Be9D6690f795D04d2fc9bdd097008a2B` | Verified Base ERC-20 identified as **basedpad.fun** (`BPAD`), with 18 decimals. | Initial approved reward-token candidate. |
| Stock tokens | Not yet supplied | **Not approved.** Symbol-only names are insufficient because Base can contain multiple similarly named tokens. | May only enter the allowlist after an exact Base address, issuer/source confirmation, and treasury approval. |

Base B20 is ERC-20 compatible, including `transfer`, `transferFrom`, `approve`, and `permit`. It additionally supports memo-tagged payments, allowing a payment order ID to be reconciled with its transaction on-chain. [1] [2]

## Selected operating model

The selected model is **approval-gated treasury routing**. A user pays the exact $AASA fee to a verified payment vault using a unique order memo. The app reconciles the exact amount, payment recipient, and memo before marking the NFT payment as settled. It then creates a reward-budget record; it does **not** submit a swap.

| Stage | System action | Required control |
|---|---|---|
| Fee quote | Locks the selected fee tier and the 20% reward reserve for a specific NFT draft. | Quote expires; no rating change after payment request. |
| $AASA payment | Wallet sends $AASA with a unique order memo to the project payment vault. | Simulate transfer; verify recipient, amount, chain, memo, and successful receipt. |
| Settlement | Backend records the payment and creates the monthly reward budget. | Idempotent event handling and final on-chain success check. |
| Treasury proposal | Creates a non-executing action for $AASA → ETH → allowlisted reward-token purchase. | 2-of-3 multisig approval, allowlisted token address, explicit amount cap, expiry, and maximum slippage. |
| Reward funding | Multisig executes the approved purchase and funds a separate reward vault. | Transaction receipt, accounting record, and human confirmation. |
| Monthly distribution | A staking contract or controlled distributor releases only the recorded reward budget to eligible collectors. | Snapshot eligibility, immutable distribution epoch, and a completed contract audit. |

## Recommended fee and reward-reserve tiers

The 20% reserve applies to the $AASA fee **before** any treasury conversion. The remaining 80% stays in project treasury under the project’s accounting policy. A fee tier must be chosen before a payment request and should be driven by a documented program rating—not a live NFT market-price prediction.

| Program rating | Creation fee | Monthly reward reserve (20%) | Recommended eligibility condition |
|---|---:|---:|---|
| R1 — Standard | 10,000 $AASA | 2,000 $AASA | Creator identity and metadata complete; no custom staking programme. |
| R2 — Curated | 25,000 $AASA | 5,000 $AASA | Approved collection description and one allowlisted reward token. |
| R3 — Staking-ready | 100,000 $AASA | 20,000 $AASA | Documented staking terms, monthly distribution rules, and recipient eligibility review. |
| R4 — Ecosystem | 500,000 $AASA | 100,000 $AASA | Approved ecosystem integration, disclosed reward budget, and operational review. |
| R5 — Protocol partner | 1,000,000 $AASA | 200,000 $AASA | Multisig-approved custom programme, independent contract/security review, and published risk disclosure. |

## Non-negotiable launch controls

The website must not custody treasury keys, automatically execute a conversion, or select a stock token by ticker alone. A project multisig should control the payment vault and reward-funding wallet; this plan recommends a **2-of-3 signer policy** with a separate emergency pause authority.

Each treasury action should carry the originating NFT order ID, fee tier, exact $AASA reserve amount, selected reward-token address, maximum input/output, maximum slippage, expiry, and approval record. The system should wait for a successful mined transaction before considering any transfer or purchase settled. Transaction webhooks can arrive out of order, so settlement must prioritize a final mined-success status. [3]

## Remaining inputs before implementation

| Required input | Why it is required |
|---|---|
| Project payment-vault / treasury multisig address | Required to create an exact on-chain payment destination. |
| Two additional multisig signer addresses and emergency pause authority | Required to enforce the recommended 2-of-3 control model. |
| Exact Base addresses for NVDA, SPY, COIN, META, MSFT, GOOGL, AAPL, HOOD, and any other reward token | Required to create a spoof-resistant allowlist. |
| Per-token allocation rules within the 20% reserve | Required to determine a monthly reward budget. |
| Verified NFT payment/mint and staking contract details | Required before a real payment or distribution can be enabled. |

## References

[1]: https://docs.base.org/apps/guides/accept-b20-payments
[2]: https://docs.base.org/base-chain/specs/upgrades/beryl/b20/specification
[3]: https://portal.thirdweb.com/engine/v2/features/webhooks
