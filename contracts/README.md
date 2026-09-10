# FairLaunch contract

`FairLaunch.sol` is a single-sale escrow contract for Base. It accepts USDC commitments via `transferFrom`, locks the sale after `endTime`, and lets each participant claim a proportional amount of the sale token plus any unused USDC.

## Deployment sequence

1. Deploy the sale token and ensure the owner controls the full `saleTokenSupply`.
2. Deploy `FairLaunch` with the owner, USDC address, sale token address, raise target, sale token supply, token price, start time, and end time.
3. Approve the `FairLaunch` contract for `saleTokenSupply`, then call `fundSale(saleTokenSupply)`.
4. Publish the deployed address through `VITE_FAIR_LAUNCH_ADDRESS` and the Base USDC address through `VITE_BASE_USDC_ADDRESS`.
5. Verify the deployment and run a full test on a Base testnet fork before using mainnet funds.

Amounts are integer smallest units. In particular, the constructor's `tokenPrice` is sale-token smallest units per one USDC smallest unit. For a USDC token with 6 decimals and a sale token with 18 decimals, a $0.12 price is represented as `120000000000` sale-token units per one USDC smallest unit (`1,000,000` USDC units produces `120,000,000,000,000,000` sale-token units). Keep the pricing convention consistent with the deployed configuration.

The owner can pause new commitments but cannot withdraw participant USDC or alter sale terms. Participants can refund before finalization; after finalization, `claim()` sends their proportional token allocation and refunds the unused USDC. Finalization is permissionless after the deadline and requires the full sale-token supply to be escrowed.

This contract has not been deployed by this task. Do not set production addresses until the bytecode, constructor arguments, token decimals, and deployment transaction have been independently reviewed.
