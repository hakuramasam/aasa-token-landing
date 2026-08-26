# Flap Vault Assessment for the $AASA Treasury

## Decision

**Do not deploy the $AASA payment or reward treasury through Flap Vault.** $AASA is a Base-native B20 asset, while Flap’s published VaultBase chain routing supports **BNB Chain (56)**, **BNB Testnet (97)**, and **Robinhood Chain (4663)**; it reverts on other chain IDs. The Flap board’s current network selector also exposes BSC, Robinhood, XLayer, Monad, and Morph—not Base. [1] [2]

Flap Vault is a developer framework for custom tax-revenue contracts, not a ready-made Base multisig treasury. Its specification includes an unrevokeable Flap Guardian requirement for permissioned vault functions, which is not aligned with the proposed project-controlled $AASA treasury model. [1]

| Requirement | Flap Vault finding | Decision |
|---|---|---|
| Base mainnet / chain 8453 | Not supported by the current published VaultBase chain routing. | Do not use Flap for $AASA treasury deployment. |
| $AASA B20 payment custody | Flap’s published vault system is for launch-token tax revenue and its documented supported chains. | Accept memo-tagged $AASA payments directly on Base. |
| 2-of-3 project governance | No ready-made Base multisig configuration is documented. | Use Safe multisig governance on Base. |
| Separate payment and reward custody | Flap supports custom vault development, but this would require a bespoke unsupported-on-Base implementation. | Create separate Base Safe accounts. |

## Recommended Base configuration

### AASA Treasury Safe

Create a Safe multisig on **Base mainnet (8453)** named `AASA Treasury`. Use **three independent owner addresses** with a **2-of-3 threshold**. This Safe is the initial public payment destination: each approved NFT payment transfers the exact $AASA fee using a unique B20 order memo.

### AASA Rewards Safe

Create a second Safe on Base named `AASA Rewards`, again with a **2-of-3 threshold**. It receives only reward tokens after a separately approved treasury action. It must not be used as the direct NFT-payment destination.

### Approval workflow

| Stage | Action | Required approval |
|---|---|---|
| Payment settlement | Reconcile the $AASA payment to the NFT order memo and successful receipt. | Automated read-only reconciliation only. |
| Reward proposal | Create a proposal for at most the NFT’s 20% $AASA reserve, naming one allowlisted token, maximum spend, output minimum, expiry, and 2% maximum slippage. | No on-chain action. |
| Treasury conversion | Submit the approved $AASA → ETH → reward-token transaction from `AASA Treasury`. | 2-of-3 Safe confirmation and a separate user approval at execution time. |
| Reward funding | Transfer purchased reward tokens to `AASA Rewards`. | 2-of-3 Safe confirmation. |
| Monthly distribution | Fund a verified staking distributor for the recorded monthly epoch. | 2-of-3 Safe confirmation and completed staking-contract review. |

## Deployment checklist

1. Select three owner wallets held by different responsible parties; do not reuse one person’s wallets as nominally separate signers.
2. Create `AASA Treasury` and `AASA Rewards` in Safe on Base with a 2-of-3 threshold.
3. Record the two public Safe addresses, owner list, threshold, and recovery/rotation policy in the project governance record.
4. Verify the addresses on BaseScan before publishing them in the website.
5. Do **not** fund either Safe or enable a payment link until the payment contract, reward-token allowlist, and emergency controls have been reviewed.

## References

[1]: https://docs.flap.sh/flap/developers/vault-developers/vault-and-vaultfactory-specification.md
[2]: https://flap.sh/board
[3]: https://safe.global/
