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
