# $AASA navigation update

- [x] Rename primary navigation links for About, Staking, and BasedPad ecosystem.
- [x] Make the desktop navigation bar sticky with reliable anchor offsets.
- [x] Preserve smooth scrolling and mobile menu navigation behavior.
- [x] Validate the updated build and responsive layout.

## Verification notes

The About, Staking, and BasedPad ecosystem hash targets load beneath the sticky header without being obscured. The primary menu exposes the three requested labels, and global smooth-scroll behavior is enabled for in-page links. Type-checking and the production build both complete successfully.

## Verified launch actions

- [x] Confirm the supplied $AASA/META BasedPad market page exposes the intended trade and staking destination.
- [x] Add verified launch-time calls to trade $AASA/META and stake $AASA from the landing page.
- [x] Update source/proof copy with the official market address and direct destination.
- [x] Validate outbound links and responsive launch-action layout.

The provided BasedPad route is the direct $AASA/META market destination. It presents BasedPad’s Base connection control; the public content shell did not expose a separate verified staking deep link, so the landing page will use the supplied market route for both trade and stake actions without adding unsupported URL parameters. The contract destination will use the same supplied token address on BaseScan.

The rendered launch panel now exposes direct $AASA/META trade and staking calls, a visible contract-verification link, and a source panel for the provided BasedPad market route. All destinations use the supplied token path or its matching BaseScan address; no wallet credentials, approvals, or transactions are handled by this website.

## Preview WebSocket repair

- [x] Inspect the current Vite configuration and recent preview logs.
- [x] Assess whether an HMR host or protocol override is required for the managed preview; none is required after the full-stack bridge starts successfully.
- [x] Restart the development server and confirm the preview loads without the WebSocket error.

## Post-upgrade preview repair

- [x] Confirm the full-stack Vite bridge preserves the managed HMR WebSocket path.
- [x] Remove or adapt any stale static-preview HMR overrides.
- [x] Verify the upgraded development preview reconnects without browser-console errors.

The root cause was the incomplete post-upgrade dependency installation: the server could not load `dotenv`, so the full-stack Vite bridge never started reliably. Installing the newly introduced dependencies and restarting that bridge restored the preview. The managed full-stack bridge uses its own proxy-aware HMR behavior, so a static-project `server.hmr` override is neither necessary nor appropriate.

- [x] Document the root cause as a dependency/server-start issue rather than an HMR configuration defect.
- [x] Confirm the restarted preview remains free of Vite WebSocket errors after a fresh reload.

## Stripe payments

- [x] Defer commercial details because the user requested that Stripe work be left for later.
- [x] Defer Stripe-backed capabilities until the user configures their own Stripe account and provides an offer definition.
- [x] Defer the secure payment/subscription entry point until the Stripe prerequisite is met.
- [x] Defer checkout validation because no Stripe checkout is configured.

## NFT creator flow

- [x] Define the public creator journey, validation rules, and mint-readiness safeguards.
- [x] Add authenticated artwork upload and draft metadata persistence.
- [x] Build the connected-wallet, upload, metadata, and review steps.
- [x] Add a safe mint-preparation state that does not claim an on-chain mint before a verified contract is configured.
- [x] Test the creator flow across desktop and mobile views.

The creator workspace renders cleanly at desktop and mobile sizes. In an unauthenticated browser session, the flow correctly stops at the creator-ID step and offers sign-in before artwork upload; the browser console reports no runtime errors. The authenticated upload/save path is protected server-side and requires a real creator session plus a creator-selected artwork file.

## Authenticated creator-flow validation

- [x] Defer authenticated step-progression validation at the user’s explicit request.
- [x] Verify protected artwork storage and draft persistence without creating an on-chain transaction through mocked service coverage.
- [x] Record the expected test limitation if a user-authenticated wallet session is not available in this environment.

The browser session reaches the project’s authentication page but requires a user-controlled human-verification step. This environment therefore cannot complete an authenticated wallet/upload browser test without the user taking over sign-in. Unit coverage mocks storage and the database to confirm that the server saves only an artwork object and a `mint_prepared` draft record; it does not invoke an on-chain transaction path.

The user explicitly approved deferring the authenticated browser test. Before enabling a real mint, return to this flow with a verified NFT contract address, ABI, target Base network, and audited mint method; only then should a wallet signature or transaction control be introduced.

## thirdweb MCP connection

- [x] Check whether an existing thirdweb connector already covers the requested MCP endpoint.
- [x] Avoid submitting a duplicate thirdweb connection because the existing `thirdweb API` connector is enabled and already provides the MCP capability.
- [x] Verify available MCP tools through the existing enabled connector.

The official thirdweb MCP documentation uses a `secretKey` query parameter, but connector review cards display server URLs. To avoid exposing the supplied secret through the visible connector URL, this integration needs a thirdweb-supported header-based or OAuth authentication alternative before it can be safely submitted.

- [x] Recheck thirdweb’s current MCP documentation and connector availability for a secure authentication path.

The current task already has an enabled `thirdweb API` MCP connector. Its tool list loads successfully with 53 capabilities, including read-only contract and wallet queries as well as sensitive transaction, deployment, signing, payment, and bridge operations. The user-supplied query-string configuration was not added because it would duplicate the existing connection and expose a secret in a visible endpoint.

## Public wallet connection component

- [x] Define Base-aware connection states, unsupported-network handling, and the no-signature/no-transaction boundary.
- [x] Create a reusable browser-wallet connection component for the NFT creator flow.
- [x] Replace the inline creator wallet logic with the reusable component.
- [x] Validate connected, unavailable-wallet, and Base-network states through deterministic unit coverage and responsive component styles.

## $AASA NFT payments and reward routing

- [ ] Define the $AASA NFT creation fee policy, including the 10,000–1,000,000 $AASA range and transparent performance-based criteria.
- [x] Select an approval-gated treasury and reward-token acquisition model that does not grant the website unilateral access to project funds.
- [ ] Specify the payment confirmation, reward-token budget, and NFT staking reward-flow records required for launch.
- [ ] Build non-custodial payment and reward-routing preparation interfaces only after the operating model is approved.
- [ ] Validate all draft payment and reward actions without converting, buying, approving, or transferring live assets.

The selected model requires a verified $AASA payment into a project-controlled payment path, records a per-NFT reward budget, and produces an explicit treasury action for project multisig approval. Conversion from $AASA to ETH and purchase of any reward token remain separate, human-approved treasury operations; the website must not hold signing keys or auto-execute swaps.

- [x] Validate the supplied $AASA and $BPAD Base token inputs and document the stock-token allowlist requirement.
- [ ] Define a risk-controlled $AASA fee and treasury policy once the reward-token inputs are available.

The supplied initial reward-token set is $BPAD (`0xf5F11BC9Be9D6690f795D04d2fc9bdd097008a2B`), $AASA (`0xb2000000000000000000001582178DD38A037f83`), and an allowlist of official stock tokens such as NVDA, SPY, COIN, META, MSFT, GOOGL, AAPL, and HOOD. The requested initial reward budget is 20% of a paid NFT creation fee, reserved for monthly collector-staking rewards. Additional stock tokens must be explicitly approved with a Base contract address before they enter the allowlist.

The validation confirms that $AASA is a native Base B20 asset and $BPAD is a verified Base ERC-20. Stock-token tickers remain unapproved until the user supplies exact Base addresses and their issuer/source can be checked.

## Flap Vault assessment

- [x] Verify Flap Vault’s published Base support and governance model through its Vault specification and vault-developer documentation.
- [x] Define the $AASA Treasury and $AASA Rewards vault configuration without deploying or funding either vault.
- [x] Prepare a deployment-ready checklist that requires user confirmation before any on-chain vault creation.

Flap’s official VaultBase specification supports BNB Chain (56), BNB Testnet (97), and Robinhood Chain (4663) and reverts on unsupported chains. Its developer documentation describes custom tax-revenue vault development, including a Flap Guardian role, rather than a ready-made Base project multisig. Combined with the live board’s BSC/Robinhood/XLayer/Monad/Morph network list, this rules it out for the $AASA Base treasury. The assessment and Base Safe configuration are recorded in `flap-vault-assessment.md`.

## HISS platform assessment

- [x] Verify whether HISS vaults can host the $AASA Base payment and reward treasury.
- [x] Document the compatible HISS role, if any, without enabling an order, trade, or vault deployment.
- [x] Confirm the recommended Base-native governance platform for the $AASA treasury.

HISS vaults are restricted to Robinhood Chain and canonical USDG; Base is a payment-settlement lane rather than a HISS vault chain. The live HISS status confirms its own Robinhood Chain vault infrastructure, but it does not make HISS a $AASA Base treasury platform. `hiss-vault-assessment.md` records the chain separation and confirms two Base Safe accounts as the appropriate governance foundation.
