import { useMemo, useState } from "react";
import { ArrowDownToLine, ArrowUpRight, BarChart3, Check, ChevronDown, CircleHelp, Clock3, Copy, FileCheck2, LayoutGrid, LockKeyhole, MoreHorizontal, RefreshCcw, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { approveAndCommit, connectBaseWallet, requestRefund, type Eip1193Provider } from "@/lib/fairLaunch";

type Launch = { id: string; name: string; symbol: string; description: string; accent: string; bg: string; raise: number; committed: number; price: number; ends: string; icon: string; risk: string };
const launches: Launch[] = [
  { id: "orion", name: "Orion Protocol", symbol: "ORN", description: "Decentralized coordination layer for autonomous agents.", accent: "#8b5cf6", bg: "#ede9fe", raise: 250000, committed: 315800, price: 0.12, ends: "02h 14m 38s", icon: "O", risk: "Verified" },
  { id: "lattice", name: "Lattice Finance", symbol: "LAT", description: "Programmable yield rails for the next generation of DeFi.", accent: "#0ea5a4", bg: "#d9f7f2", raise: 500000, committed: 184200, price: 0.08, ends: "1d 06h 09m", icon: "L", risk: "Verified" },
  { id: "arc", name: "Arcade Labs", symbol: "ARCD", description: "Open economy for player-owned worlds and digital goods.", accent: "#f97316", bg: "#ffedd5", raise: 100000, committed: 92000, price: 0.04, ends: "04h 51m 02s", icon: "A", risk: "Audited" },
];
const usd = (value: number) => value >= 1000000 ? `$${(value / 1000000).toFixed(1)}m` : `$${Math.round(value / 1000)}k`;

function App() {
  const [selectedId, setSelectedId] = useState("orion");
  const [amount, setAmount] = useState("250");
  const [activeTab, setActiveTab] = useState("Launches");
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [committed, setCommitted] = useState(false);
  const [refunded, setRefunded] = useState(false);
  const [txState, setTxState] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [txMessage, setTxMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const selected = launches.find((launch) => launch.id === selectedId) ?? launches[0];
  const amountNumber = Math.max(0, Number(amount) || 0);
  const oversubscription = selected.committed / selected.raise;
  const allocationPercent = Math.min(100, 100 / oversubscription);
  const preview = useMemo(() => ({ tokens: amountNumber / selected.price, fill: Math.min(100, (amountNumber / selected.raise) * 100), allocationPercent }), [amountNumber, selected, allocationPercent]);
  const provider = (window as Window & { ethereum?: Eip1193Provider }).ethereum;
  const connectWallet = async () => {
    try {
      const address = await connectBaseWallet(provider);
      setWalletAddress(address);
      setWalletConnected(true);
      setCommitted(false);
      setRefunded(false);
      setTxState("idle");
      setTxMessage("");
    } catch (error) {
      setTxState("error");
      setTxMessage(error instanceof Error ? error.message : "Wallet connection failed.");
    }
  };
  const handleCommit = async () => {
    if (!walletConnected || !walletAddress) { await connectWallet(); return; }
    try {
      setTxState("pending");
      setTxMessage("Approve USDC, then confirm the commitment in your wallet…");
      await approveAndCommit(provider, walletAddress as `0x${string}`, String(amountNumber));
      setCommitted(true);
      setRefunded(false);
      setTxState("success");
      setTxMessage("Commitment confirmed on Base.");
    } catch (error) {
      setTxState("error");
      setTxMessage(error instanceof Error ? error.message : "Commitment transaction failed.");
    }
  };
  const handleRefund = async () => {
    if (!walletConnected || !walletAddress) { await connectWallet(); return; }
    try {
      setTxState("pending");
      setTxMessage("Confirm the refund transaction in your wallet…");
      await requestRefund(provider, walletAddress as `0x${string}`);
      setRefunded(true);
      setCommitted(false);
      setTxState("success");
      setTxMessage("Refund requested on Base.");
    } catch (error) {
      setTxState("error");
      setTxMessage(error instanceof Error ? error.message : "Refund transaction failed.");
    }
  };
  const handleCopy = () => { navigator.clipboard?.writeText("0x91...4f2a"); setCopied(true); window.setTimeout(() => setCopied(false), 1400); };

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand-lockup"><div className="brand-mark"><span /></div><div><strong>FAIRLAUNCH</strong><small>OPEN TOKEN SALES</small></div></div>
      <div className="sidebar-label">PLATFORM</div>
      <nav className="side-nav">{[["Launches", LayoutGrid], ["My commitments", BarChart3], ["How it works", CircleHelp]].map(([label, Icon]) => <button className={activeTab === label ? "nav-item active" : "nav-item"} key={label as string} onClick={() => setActiveTab(label as string)}><Icon size={17} strokeWidth={1.8} /><span>{label as string}</span>{label === "Launches" && <span className="nav-count">3</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="network-row"><span className="network-dot" /> Base network <ChevronDown size={14} /></div><div className="side-help"><ShieldCheck size={17} /><span><strong>Fair by design</strong><small>Pro-rata allocation · Onchain refunds</small></span></div><div className="side-version">FAIRLAUNCH V1.0 <span>●</span> ALL SYSTEMS OPERATIONAL</div></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="breadcrumbs"><span>FAIRLAUNCH</span><span className="slash">/</span><strong>{activeTab.toUpperCase()}</strong></div><div className="topbar-actions"><button className="icon-btn"><CircleHelp size={17} /></button><button className={walletConnected ? "wallet-btn connected" : "wallet-btn"} onClick={connectWallet}><Wallet size={16} />{walletConnected ? "0x91...4f2a" : "Connect wallet"}</button>{walletConnected && <button className="profile-dot">0x</button>}</div></header>
      <section className="hero-row"><div><div className="eyebrow"><Sparkles size={14} /> FAIR LAUNCHES, BUILT FOR EVERYONE</div><h1>Launch fair.<br /><span>Own your share.</span></h1><p className="hero-copy">Discover early-stage projects. Commit what you want.<br />If demand exceeds supply, everyone gets a proportional allocation.</p></div><div className="hero-stat-card"><div className="stat-orbit"><span className="orbit-dot" /><span className="orbit-line" /><span className="orbit-center">FL</span></div><div><small>RAISED THROUGH FAIRLAUNCH</small><strong>$12.8m</strong><p>Across 42 successful launches</p></div></div></section>

      <section className="launch-section"><div className="section-heading"><div><span className="section-number">01</span><h2>Active launches</h2><span className="live-pill"><i /> 3 LIVE NOW</span></div><button className="text-btn">View all launches <ArrowUpRight size={15} /></button></div><div className="launch-grid">{launches.map((launch) => { const progress = Math.min(100, (launch.committed / launch.raise) * 100); return <button key={launch.id} className={selectedId === launch.id ? "launch-card selected" : "launch-card"} onClick={() => { setSelectedId(launch.id); setCommitted(false); setRefunded(false); }}><div className="launch-card-top"><div className="token-avatar" style={{ background: launch.bg, color: launch.accent }}>{launch.icon}</div><div className="launch-meta"><strong>{launch.name}</strong><span>${launch.symbol}</span></div><MoreHorizontal size={18} className="more" /></div><p>{launch.description}</p><div className="progress-line"><span style={{ width: `${progress}%`, background: launch.accent }} /></div><div className="launch-details"><div><small>COMMITTED</small><strong>{usd(launch.committed)} <em>/ {usd(launch.raise)}</em></strong></div><div><small>PRICE</small><strong>${launch.price.toFixed(2)} <em>/ token</em></strong></div></div><div className="launch-footer"><span><Clock3 size={13} /> Ends in {launch.ends}</span><span className="verified"><Check size={12} /> {launch.risk}</span></div></button>; })}</div></section>

      <section className="commit-section"><div className="section-heading"><div><span className="section-number">02</span><h2>Make a commitment</h2></div><span className="step-label">STEP 1 OF 2</span></div><div className="commit-grid">
        <div className="commit-card"><div className="commit-card-head"><div><span className="mini-label">SELECTED LAUNCH</span><h3><span className="small-token" style={{ background: selected.bg, color: selected.accent }}>{selected.icon}</span>{selected.name}</h3></div><span className="live-pill"><i /> LIVE</span></div><div className="commit-price-row"><div><small>TOKEN PRICE</small><strong>${selected.price.toFixed(2)} <em>USD</em></strong></div><div><small>RAISE TARGET</small><strong>{usd(selected.raise)}</strong></div><div><small>ALLOCATION</small><strong>PRO-RATA</strong></div></div><div className="amount-label"><span>COMMIT AMOUNT</span><span>Balance: 1,240 USDC</span></div><div className="amount-input-wrap"><span>$</span><input aria-label="Commit amount in USDC" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} /><span className="currency">USDC</span></div><div className="quick-amounts">{[100, 250, 500, 1000].map((value) => <button key={value} onClick={() => setAmount(String(value))}>${value}</button>)}</div><button className="commit-btn" onClick={handleCommit}>{committed ? <><Check size={17} /> Commitment submitted</> : walletConnected ? <><LockKeyhole size={16} /> Commit {amountNumber || 0} USDC</> : <><Wallet size={16} /> Connect wallet to commit</>}<ArrowUpRight size={16} /></button>{committed && <div className="success-note"><Check size={14} /> Your commitment is recorded. You can request a refund before the launch ends.</div>}<p className="fine-print"><LockKeyhole size={12} /> Funds are held in escrow until the launch ends. You can cancel and refund at any time before then.</p></div>
        <div className="preview-card"><div className="preview-head"><div><span className="mini-label">ALLOCATION PREVIEW</span><h3>What you could receive</h3></div><span className="preview-badge">LIVE ESTIMATE</span></div><div className="allocation-number"><strong>{preview.tokens.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong><span>{selected.symbol} <small>EST. TOKENS</small></span></div><div className="allocation-bar"><span style={{ width: `${preview.fill}%` }} /></div><div className="allocation-row"><span><i className="dot dot-purple" />Your commitment<strong>{amountNumber.toLocaleString()} USDC</strong></span><span><i className="dot dot-lilac" />Est. allocation<strong>{preview.allocationPercent.toFixed(1)}%</strong></span></div><div className="formula"><div className="formula-cell"><small>YOUR COMMITMENT</small><strong>{amountNumber.toLocaleString()} USDC</strong></div><span>÷</span><div className="formula-cell"><small>TOTAL COMMITTED</small><strong>{usd(selected.committed)}</strong></div><span>=</span><div className="formula-cell result"><small>YOUR SHARE</small><strong>{((amountNumber / selected.committed) * 100 || 0).toFixed(2)}%</strong></div></div><div className="refund-box"><RefreshCcw size={16} /><div><strong>Refunds are automatic</strong><p>Any unallocated USDC is returned to your wallet after the sale settles.</p></div><ArrowUpRight size={15} /></div></div>
      </div></section>

      {txMessage && <div className={`tx-banner tx-banner--${txState}`}><span>{txState === "pending" ? "●" : txState === "success" ? "✓" : "!"}</span>{txMessage}</div>}
      <section className="bottom-grid"><div className="my-commitments"><div className="section-heading compact"><div><span className="section-number">03</span><h2>My commitments</h2></div><button className="text-btn">View history <ArrowUpRight size={15} /></button></div><div className="empty-state"><div className="empty-icon"><ArrowDownToLine size={19} /></div><strong>{refunded ? "Refund requested" : "Your commitments will appear here"}</strong><p>Commit to a live launch above to track your allocation and refund status.</p></div></div><div className="fairness-card"><div className="fairness-icon"><FileCheck2 size={20} /></div><div><span className="mini-label">THE FAIRLAUNCH PROMISE</span><h3>Same rules.<br /><em>Every wallet.</em></h3><p>No gas wars. No private rounds. Just transparent, proportional allocation.</p><button className="outline-btn" onClick={() => setActiveTab("How it works")}>Learn how it works <ArrowUpRight size={14} /></button></div></div></section>
      <footer className="footer"><span>© 2026 FAIRLAUNCH</span><span>BUILT ON BASE <span className="blue-dot" /></span><span className="footer-links"><button>Docs</button><button>Terms</button><button>Security</button></span></footer>
    </main>
    <button className="refund-float" onClick={handleRefund} disabled={txState === "pending"}><RefreshCcw size={15} /> Request refund <span>↗</span></button><button className="copy-dev" onClick={handleCopy}><Copy size={13} /> {copied ? "Copied" : "Copy wallet"}</button>
  </div>;
}
export default App;
