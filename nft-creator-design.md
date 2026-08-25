# $AASA NFT Creator Flow

The public creator experience will be available at `/create`. It uses a six-stage, progressively disclosed workflow: **Connect → Artwork → Metadata → Wallet → Review → Mint preparation**. Authentication protects artwork storage and draft persistence; an optional connected wallet address is captured only after the creator explicitly authorizes it in their browser wallet.

Artwork uploads will accept **PNG, JPEG, GIF, and WEBP** images up to **10 MB**. Files are stored in project S3 storage, while the database retains only the returned storage key/URL and creator metadata. The creation record is saved as a private draft that can be revisited by its owner.

The final stage will clearly distinguish **mint preparation** from an on-chain mint. Until the project supplies a verified NFT contract address, ABI, chain, and mint method, the UI will not request a signature, submit a transaction, quote a mint price, or claim that a token has been minted. The creator can review their immutable-ready payload and save it as a draft.
