import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Loader2, LockKeyhole, Plus, Trash2, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import "./CreateNft.css";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<unknown>;
    };
  }
}

type Attribute = { traitType: string; value: string };

const steps = ["Connect", "Artwork", "Metadata", "Wallet", "Review", "Mint prep"];
const acceptedTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"] as const;
type AcceptedMimeType = (typeof acceptedTypes)[number];

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function CreateNft() {
  const { isAuthenticated, loading, user } = useAuth();
  const [step, setStep] = useState(0);
  const [walletAddress, setWalletAddress] = useState("");
  const [artwork, setArtwork] = useState<{ name: string; mimeType: AcceptedMimeType; dataUrl: string } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attributes, setAttributes] = useState<Attribute[]>([{ traitType: "Signal", value: "Authorized" }]);
  const [savedDraftUrl, setSavedDraftUrl] = useState("");
  const saveDraft = trpc.nft.saveDraft.useMutation({
    onSuccess: (data) => {
      setSavedDraftUrl(data.artworkUrl);
      setStep(5);
      toast.success("Creator draft saved securely");
    },
    onError: (error) => toast.error(error.message || "Unable to save this draft"),
  });

  const canContinue = useMemo(() => {
    if (step === 0) return isAuthenticated;
    if (step === 1) return Boolean(artwork);
    if (step === 2) return title.trim().length > 0;
    if (step === 3) return Boolean(walletAddress);
    return true;
  }, [artwork, isAuthenticated, step, title, walletAddress]);

  async function connectWallet() {
    if (!window.ethereum) {
      toast.error("No browser wallet detected. Install or unlock a Base-compatible wallet first.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address = Array.isArray(accounts) ? accounts[0] : undefined;
      if (typeof address !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new Error("No compatible account returned");
      }
      setWalletAddress(address);
      toast.success(`Wallet connected: ${shortenAddress(address)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wallet connection was not approved");
    }
  }

  function handleArtwork(file?: File) {
    if (!file) return;
    if (!acceptedTypes.includes(file.type as AcceptedMimeType)) {
      toast.error("Use a PNG, JPEG, GIF, or WEBP artwork file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Artwork must be 10 MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setArtwork({ name: file.name, mimeType: file.type as AcceptedMimeType, dataUrl: reader.result });
      toast.success("Artwork ready for metadata");
    };
    reader.readAsDataURL(file);
  }

  function updateAttribute(index: number, field: keyof Attribute, value: string) {
    setAttributes((current) => current.map((attribute, attributeIndex) => (
      attributeIndex === index ? { ...attribute, [field]: value } : attribute
    )));
  }

  function continueFlow() {
    if (step === 0 && !isAuthenticated) {
      toast.message("Sign in to save creator drafts securely.");
      startLogin();
      return;
    }
    if (!canContinue) {
      toast.error("Complete this step before continuing.");
      return;
    }
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function prepareDraft() {
    if (!artwork || !title.trim() || !walletAddress) {
      toast.error("Complete artwork, metadata, and wallet steps first.");
      return;
    }
    const completedAttributes = attributes.filter((attribute) => attribute.traitType.trim() && attribute.value.trim());
    saveDraft.mutate({
      artworkDataUrl: artwork.dataUrl,
      artworkMimeType: artwork.mimeType,
      artworkName: artwork.name,
      title: title.trim(),
      description: description.trim() || undefined,
      attributes: completedAttributes,
      walletAddress,
    });
  }

  return (
    <div className="creator-page">
      <header className="creator-header">
        <a href="/" className="creator-back"><ArrowLeft size={16} /> Back to $AASA</a>
        <div className="creator-header-mark"><span>CREATOR CONSOLE</span><i /> BASE / NFT</div>
        <div className="creator-auth-state">
          {loading ? <Loader2 size={15} className="spin" /> : isAuthenticated ? <><Check size={14} /> {user?.name || "Signed in"}</> : <><LockKeyhole size={14} /> Drafts require sign-in</>}
        </div>
      </header>

      <main className="creator-main">
        <section className="creator-intro">
          <div>
            <p className="creator-eyebrow">$AASA / upcoming AI-owned launchpad</p>
            <h1>MAKE THE<br /><span>SIGNAL</span> OWNABLE.</h1>
          </div>
          <p>Build a collector-ready record for the $AASA ecosystem. Upload the art, define the story, review the payload, then prepare a draft for a verified future mint contract.</p>
        </section>

        <section className="creator-shell" aria-label="NFT creator workflow">
          <aside className="creator-progress">
            <span className="progress-label">CREATION PATH</span>
            <ol>
              {steps.map((label, index) => (
                <li key={label} className={index === step ? "is-active" : index < step ? "is-complete" : ""}>
                  <span>{String(index + 1).padStart(2, "0")}</span>{label}
                </li>
              ))}
            </ol>
            <div className="creator-trust-note"><LockKeyhole size={15} /> Artwork is stored only after you explicitly save a draft.</div>
          </aside>

          <div className="creator-panel">
            {step === 0 && (
              <div className="creator-step">
                <div className="step-label">STEP 01 / CREATOR ID</div>
                <h2>START WITH A<br />SECURE CREATOR RECORD.</h2>
                <p>Sign in before uploading so your artwork and metadata can be saved as a private, creator-owned draft. Wallet connection comes later and does not replace your creator account.</p>
                <div className="identity-card">
                  <div className="identity-icon"><LockKeyhole size={22} /></div>
                  <div><strong>{isAuthenticated ? "Creator account ready" : "Sign-in required"}</strong><span>{isAuthenticated ? `Drafts will be saved under ${user?.name || "your account"}.` : "No upload or draft is stored until you sign in."}</span></div>
                </div>
                {!isAuthenticated && <button className="creator-button creator-button--volt" type="button" onClick={() => startLogin()}>Sign in to create <ArrowRight size={18} /></button>}
              </div>
            )}

            {step === 1 && (
              <div className="creator-step">
                <div className="step-label">STEP 02 / ARTWORK</div>
                <h2>UPLOAD THE<br /><span>ARTIFACT.</span></h2>
                <p>Use a PNG, JPEG, GIF, or WEBP image up to 10 MB. Keep the original file and only upload work you are authorized to mint.</p>
                <label className={`artwork-dropzone ${artwork ? "has-artwork" : ""}`}>
                  <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={(event) => handleArtwork(event.target.files?.[0])} />
                  {artwork ? <img src={artwork.dataUrl} alt="Selected NFT artwork preview" /> : <><ImagePlus size={35} /><strong>DROP ARTWORK OR BROWSE</strong><span>PNG · JPEG · GIF · WEBP / 10 MB MAX</span></>}
                </label>
                {artwork && <div className="file-readout"><Check size={15} /> {artwork.name}<button type="button" onClick={() => setArtwork(null)}>Replace</button></div>}
              </div>
            )}

            {step === 2 && (
              <div className="creator-step">
                <div className="step-label">STEP 03 / METADATA</div>
                <h2>GIVE THE<br /><span>SIGNAL</span> A STORY.</h2>
                <p>Use plain, collector-facing language. You can add up to 12 traits; avoid promises about value, rewards, or future returns.</p>
                <div className="metadata-form">
                  <label>Title<input value={title} maxLength={120} placeholder="e.g. AASA Genesis / 001" onChange={(event) => setTitle(event.target.value)} /></label>
                  <label>Description<textarea value={description} maxLength={1000} placeholder="Describe the artwork, its creator, or its place in the $AASA world." onChange={(event) => setDescription(event.target.value)} /></label>
                  <div className="trait-heading"><span>Attributes</span><button type="button" onClick={() => setAttributes((current) => [...current, { traitType: "", value: "" }])} disabled={attributes.length >= 12}><Plus size={15} /> Add trait</button></div>
                  <div className="trait-list">
                    {attributes.map((attribute, index) => (
                      <div className="trait-row" key={`${index}-${attribute.traitType}`}>
                        <input value={attribute.traitType} maxLength={48} placeholder="Trait" onChange={(event) => updateAttribute(index, "traitType", event.target.value)} />
                        <input value={attribute.value} maxLength={96} placeholder="Value" onChange={(event) => updateAttribute(index, "value", event.target.value)} />
                        <button type="button" aria-label="Remove trait" onClick={() => setAttributes((current) => current.filter((_, attributeIndex) => attributeIndex !== index))} disabled={attributes.length === 1}><Trash2 size={15} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="creator-step">
                <div className="step-label">STEP 04 / WALLET</div>
                <h2>CONNECT THE<br /><span>CREATOR</span> WALLET.</h2>
                <p>Connect a Base-compatible browser wallet to associate this draft with its intended recipient. This step does not ask for a signature or submit a transaction.</p>
                <div className="wallet-card">
                  <div className="wallet-symbol"><Wallet size={25} /></div>
                  <div><strong>{walletAddress ? shortenAddress(walletAddress) : "No wallet connected"}</strong><span>{walletAddress ? "Recipient address captured for draft review." : "Use the wallet you intend to mint to."}</span></div>
                  <button type="button" className="creator-button creator-button--outline" onClick={connectWallet}>{walletAddress ? "Change wallet" : "Connect wallet"}</button>
                </div>
                <div className="security-line"><Check size={15} /> We will never request your recovery phrase or private key.</div>
              </div>
            )}

            {step === 4 && (
              <div className="creator-step creator-review">
                <div className="step-label">STEP 05 / REVIEW</div>
                <h2>VERIFY BEFORE<br /><span>YOU</span> PREPARE.</h2>
                <p>This is your final check before saving the creator record. No on-chain mint will be requested because the official NFT contract has not been configured.</p>
                <div className="review-grid">
                  <div className="review-art">{artwork && <img src={artwork.dataUrl} alt="NFT artwork review" />}</div>
                  <div className="review-copy"><span>COLLECTION</span><strong>$AASA / Creator drafts</strong><span>TITLE</span><strong>{title || "Untitled artifact"}</strong><span>RECIPIENT</span><strong>{walletAddress ? shortenAddress(walletAddress) : "Not connected"}</strong><span>ATTRIBUTES</span><strong>{attributes.filter((attribute) => attribute.traitType && attribute.value).length} traits</strong></div>
                </div>
                <button className="creator-button creator-button--volt" type="button" onClick={prepareDraft} disabled={saveDraft.isPending}>{saveDraft.isPending ? <><Loader2 size={18} className="spin" /> Saving draft</> : <>Prepare creator draft <ArrowRight size={18} /></>}</button>
              </div>
            )}

            {step === 5 && (
              <div className="creator-step mint-hold">
                <div className="step-label">STEP 06 / MINT PREPARATION</div>
                <h2>DRAFT SECURED.<br /><span>CONTRACT</span> PENDING.</h2>
                <p>Your creator record is saved. A verified NFT contract address, ABI, chain, and mint method are required before this workspace can request a signature or submit an on-chain transaction.</p>
                <div className="mint-hold-card"><Check size={20} /><div><strong>Creator draft saved</strong><span>{savedDraftUrl ? "Artwork is secured in project storage and ready for the verified mint stage." : "Your draft will appear here after it has been saved."}</span></div></div>
                <a className="creator-button creator-button--outline" href="/create">Create another draft <ArrowRight size={18} /></a>
              </div>
            )}

            {step < 4 && <div className="creator-controls"><button className="creator-back-step" type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>Back</button><button className="creator-button creator-button--volt" type="button" onClick={continueFlow}>Continue <ArrowRight size={18} /></button></div>}
            {step === 4 && <div className="creator-controls"><button className="creator-back-step" type="button" onClick={() => setStep(3)}>Back</button></div>}
          </div>
        </section>
      </main>
    </div>
  );
}
