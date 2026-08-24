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

- [ ] Confirm the product or service, price, currency, and whether the charge is one-time or recurring.
- [ ] Enable Stripe-backed capabilities for the website.
- [ ] Add a secure payment or subscription entry point to the interface.
- [ ] Validate the checkout routing without creating transactions.
