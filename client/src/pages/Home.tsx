/**
 * $AASA — Authorized Mischief visual system.
 * Neo-pop editorial streetwear: carbon-black poster wall, AASA Volt accents,
 * large official avatar artwork, sharp printed rules, and evidence-led copy.
 */
import { useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";

const announcementUrl = "https://x.com/HakuramaSam/status/2091809146857205882";
const basedPadMarketUrl =
  "https://basedpad.fun/token/0xb2000000000000000000001582178DD38A037f83";
const contractAddress = "0xb2000000000000000000001582178DD38A037f83";
const baseScanUrl = `https://basescan.org/address/${contractAddress}`;

const navItems = [
  { label: "About", href: "#about" },
  { label: "Staking", href: "#staking" },
  { label: "BasedPad ecosystem", href: "#ecosystem" },
];

const routeSteps = [
  {
    number: "01",
    label: "Pair",
    title: "$AASA / META",
    body: "The announced canonical market pairs $AASA with the META stock token on BasedPad.",
    tone: "lime",
  },
  {
    number: "02",
    label: "Stake",
    title: "Lock the signal",
    body: "Stake $AASA to enter the proposed META reward stream.",
    tone: "magenta",
  },
  {
    number: "03",
    label: "Stream",
    title: "30% to stakers",
    body: "The launch note states that 30% of quote-side LP fees stream to $AASA stakers.",
    tone: "cyan",
  },
  {
    number: "04",
    label: "Build",
    title: "NFT launchpad",
    body: "The reward loop is designed to support an upcoming AI-owned NFT launchpad and ecosystem.",
    tone: "orange",
  },
];

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="kicker">
      <span className="kicker-dot" />
      {children}
    </div>
  );
}

function PixelMark({ light = false }: { light?: boolean }) {
  return (
    <span className={`pixel-mark ${light ? "pixel-mark--light" : ""}`} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="aasa-site">
      <div className="site-grain" aria-hidden="true" />

      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label="$AASA home" onClick={closeMenu}>
          <img
            className="brand-emblem"
            src="/manus-storage/aasa-pixel-emblem_f7385758.png"
            alt=""
          />
          <span className="brand-word wordmark-registered">$AASA</span>
          <span className="brand-sub">B20 / BASE</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="nav-proof" href={basedPadMarketUrl} target="_blank" rel="noreferrer">
          Trade on BasedPad <ArrowUpRight size={14} strokeWidth={2.4} />
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {menuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <a href={item.href} key={item.href} onClick={closeMenu}>
              {item.label}
              <ArrowDownRight size={18} />
            </a>
          ))}
          <a href={basedPadMarketUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>
            Trade on BasedPad <ExternalLink size={18} />
          </a>
        </nav>
      )}

      <main id="top">
        <section className="hero" id="signal">
          <img
            className="hero-poster"
            src="/manus-storage/aasa-hero-poster_7c653c89.jpg"
            alt=""
            aria-hidden="true"
          />
          <div className="hero-overlay" aria-hidden="true" />

          <div className="hero-rail" aria-hidden="true">
            <span>AUTHORIZED AGENTIC SOCIAL AVATAR</span>
            <PixelMark light />
            <span>BASE MAINNET · B20</span>
          </div>

          <div className="hero-inner">
            <div className="hero-art-wrap">
              <div className="art-caption art-caption--top">OFFICIAL TOKEN ART / 01</div>
              <div className="avatar-frame">
                <img
                  src="/manus-storage/aasa-token-avatar_ce3abdfc.gif"
                  alt="$AASA official token avatar wearing pixel sunglasses and a rainbow shirt"
                />
              </div>
              <div className="art-stamp">
                <span>AVATAR</span>
                <strong>AUTHORIZED</strong>
                <PixelMark />
              </div>
              <div className="hero-color-key" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>

            <div className="hero-copy">
              <Kicker>Preparing to launch on BasedPad</Kicker>
              <h1>
                <span>AVATAR</span>
                <span className="headline-stroke">AUTHORIZED.</span>
                <span>REWARDS</span>
                <span className="headline-lime">ROUTED.</span>
              </h1>
              <p className="hero-lead">
                <strong>$AASA</strong> is the Authorized Agentic Social Avatar — an upcoming Base-native
                B20 designed for the AI-owned NFT launchpad and ecosystem ahead.
              </p>
              <div className="hero-actions">
                <a className="button button--lime" href={basedPadMarketUrl} target="_blank" rel="noreferrer">
                  Trade $AASA / META <ArrowUpRight size={19} />
                </a>
                <a
                  className="button button--outline"
                  href={basedPadMarketUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Stake $AASA <ArrowUpRight size={18} />
                </a>
                <a className="button button--outline" href="/create">
                  Create an NFT <ArrowRight size={18} />
                </a>
              </div>
              <a className="hero-inline-source" href={announcementUrl} target="_blank" rel="noreferrer">
                Read launch signal <ArrowUpRight size={14} />
              </a>
              <div className="hero-facts">
                <div>
                  <span>PAIR</span>
                  <strong>$AASA / META</strong>
                </div>
                <div>
                  <span>REWARD PATH</span>
                  <strong>Stake $AASA → META</strong>
                </div>
                <div>
                  <span>STAKER STREAM</span>
                  <strong>30% quote-side LP fees</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="signal-ticker" aria-label="Key $AASA launch details">
          <div className="ticker-track">
            <span>BASE-NATIVE B20</span><PixelMark />
            <span>UPCOMING NFT LAUNCHPAD</span><PixelMark />
            <span>STAKE $AASA · EARN META</span><PixelMark />
            <span>CANONICAL MARKET SIGNAL</span><PixelMark />
            <span>BASE-NATIVE B20</span><PixelMark />
            <span>UPCOMING NFT LAUNCHPAD</span><PixelMark />
          </div>
        </div>

        <section className="intro-section section-shell" id="about">
          <div className="intro-index">[ 01 / THE SIGNAL ]</div>
          <div className="intro-copy">
            <Kicker>An avatar with an operating model</Kicker>
            <h2>NOT A MASCOT.<br />A <em>MARKET</em> PARTICIPANT.</h2>
            <p>
              $AASA gives an Authorized Agentic Social Avatar a native economic lane on Base. The announced
              market pairs the token with META, while staking is designed to surface META-denominated reward
              flow to the people who hold the signal.
            </p>
            <p className="text-muted">
              The project is preparing to launch. This page explains the publicly announced design; it does not
              publish a contract address, price, yield estimate, or launch date.
            </p>
          </div>
          <div className="intro-aside">
            <div className="quote-block">
              <span className="quote-mark">“</span>
              <p>Authorized Agentic Social Avatar on B20 — built for the upcoming AI-owned NFT launchpad ecosystem.</p>
              <span className="quote-source">PROJECT DESCRIPTION</span>
            </div>
            <div className="signal-checks">
              <span><Check size={15} /> Base mainnet</span>
              <span><Check size={15} /> B20 launch model</span>
              <span><Check size={15} /> META reward route</span>
            </div>
          </div>
        </section>

        <section className="rewards-section" id="staking">
          <div className="rewards-head section-shell">
            <div>
              <Kicker>Mechanism, in plain language</Kicker>
              <h2>THE <span>REWARD</span><br />ROUTE.</h2>
            </div>
            <p>
              BasedPad’s public B20 pages describe canonical markets and pro-rata reward streams. For $AASA,
              the launch announcement specifies META as the quote token and a 30% quote-side LP fee stream for
              $AASA stakers.
            </p>
          </div>

          <div className="reward-visual section-shell" aria-label="Abstract visual representation of the $AASA reward route">
            <div className="reward-flow-art" aria-hidden="true">
              <div className="flow-line flow-line--one" />
              <div className="flow-line flow-line--two" />
              <div className="flow-node flow-node--aasa"><span>$AASA</span><PixelMark light /></div>
              <div className="flow-node flow-node--pool"><span>V4</span><i /></div>
              <div className="flow-node flow-node--meta"><span>META</span><PixelMark /></div>
              <div className="flow-node flow-node--reward"><span>30%</span><i /></div>
              <div className="flow-crop flow-crop--one" />
              <div className="flow-crop flow-crop--two" />
              <div className="flow-label flow-label--left">CANONICAL PAIR / BASE</div>
              <div className="flow-label flow-label--right">STAKE → STREAM</div>
            </div>
            <div className="reward-visual-note">
              <PixelMark />
              <span>PROPOSED FLOW / VERIFY ONCHAIN AT LAUNCH</span>
            </div>
          </div>

          <div className="route-grid section-shell">
            {routeSteps.map((step) => (
              <article className={`route-card route-card--${step.tone}`} key={step.number}>
                <div className="route-card-top">
                  <span>{step.number}</span>
                  <span>{step.label}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <ArrowRight className="route-arrow" size={22} />
              </article>
            ))}
          </div>

          <div className="fee-strip section-shell">
            <div className="fee-strip-label">ANNOUNCED STAKER ALLOCATION</div>
            <div className="fee-meter" aria-label="30 percent to $AASA stakers">
              <span className="fee-meter-fill" />
            </div>
            <strong>30%</strong>
            <p>of quote-side LP fees stream to $AASA stakers.</p>
            <a href={announcementUrl} target="_blank" rel="noreferrer" aria-label="Open the $AASA announcement">
              <ArrowUpRight size={20} />
            </a>
          </div>
          <div className="launch-gateway section-shell">
            <div className="gateway-rail" aria-hidden="true">LIVE ROUTE / BASE MAINNET</div>
            <div className="gateway-main">
              <Kicker>Verified launch access</Kicker>
              <h3>TRADE THE PAIR.<br /><span>STAKE THE SIGNAL.</span></h3>
              <p>
                The official $AASA/META market route is live on BasedPad. Trade the pair or connect a Base wallet
                on BasedPad to use its available $AASA staking controls and earn META through the announced route.
              </p>
              <div className="gateway-actions">
                <a className="button button--lime" href={basedPadMarketUrl} target="_blank" rel="noreferrer">
                  Trade $AASA / META <ArrowUpRight size={18} />
                </a>
                <a className="button button--outline" href={basedPadMarketUrl} target="_blank" rel="noreferrer">
                  Open staking app <ArrowUpRight size={18} />
                </a>
              </div>
            </div>
            <div className="gateway-proof">
              <span className="gateway-proof-label">OFFICIAL B20 CONTRACT</span>
              <a href={baseScanUrl} target="_blank" rel="noreferrer" className="contract-link">
                <span>{contractAddress.slice(0, 10)}…{contractAddress.slice(-8)}</span>
                <ArrowUpRight size={18} />
              </a>
              <div className="gateway-check"><Check size={15} /> BaseScan contract view</div>
              <div className="gateway-check"><Check size={15} /> BasedPad $AASA / META route</div>
              <p>Verify the contract in your wallet before approving any transaction.</p>
            </div>
          </div>
        </section>

        <section className="ecosystem-section" id="ecosystem">
          <div className="ecosystem-image" aria-label="Abstract $AASA ecosystem poster artwork">
            <div className="ecosystem-collage" aria-hidden="true">
              <div className="collage-tile collage-tile--lime">AI<br />OWNED</div>
              <div className="collage-tile collage-tile--ink"><PixelMark light /><span>B20</span></div>
              <div className="collage-disc"><span>AASA</span></div>
              <div className="collage-frame"><i /><i /><i /><i /></div>
              <div className="collage-label">AGENTIC CULTURE<br />ON BASE</div>
              <div className="collage-rule" />
              <div className="collage-squares"><i /><i /><i /><i /><i /><i /></div>
            </div>
            <div className="image-flag">[ 02 / ECOSYSTEM ]</div>
          </div>
          <div className="ecosystem-copy">
            <Kicker>Built beyond the first swap</Kicker>
            <h2>THE SIGNAL<br />WANTS A <em>WORLD.</em></h2>
            <p>
              The $AASA story points toward an AI-owned NFT launchpad and a broader ecosystem of agentic social
              avatars. That gives the token a narrative destination beyond a single trading screen.
            </p>
            <div className="ecosystem-list">
              <div>
                <span>01</span>
                <strong>AI-owned NFT launchpad</strong>
                <p>An upcoming creative layer where ownership and avatar identity meet.</p>
              </div>
              <div>
                <span>02</span>
                <strong>Base-native market rails</strong>
                <p>A B20 launch framing with a stated canonical $AASA/META market.</p>
              </div>
              <div>
                <span>03</span>
                <strong>Staker-aligned participation</strong>
                <p>A proposed META reward path tied to the announced quote-side LP fee stream.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="proof-section section-shell" id="proof">
          <div className="proof-heading">
            <Kicker>Do the verification</Kicker>
            <h2>THE PROOF<br />PACKET.</h2>
            <p>
              $AASA is preparing to launch. Use the source links below to inspect the public announcement and the
              BasedPad B20 model before taking any action.
            </p>
          </div>
          <div className="proof-links">
            <a href={announcementUrl} target="_blank" rel="noreferrer" className="proof-link proof-link--dark">
              <div>
                <span>SOURCE / 01</span>
                <strong>$AASA / META launch note</strong>
                <p>Public post describing the upcoming market and 30% staker stream.</p>
              </div>
              <ArrowUpRight size={28} />
            </a>
            <a href={basedPadMarketUrl} target="_blank" rel="noreferrer" className="proof-link proof-link--lime">
              <div>
                <span>SOURCE / 02</span>
                <strong>$AASA / META market</strong>
                <p>Direct BasedPad route for trading the pair and accessing available staking controls.</p>
              </div>
              <ArrowUpRight size={28} />
            </a>
            <a href={baseScanUrl} target="_blank" rel="noreferrer" className="proof-link proof-link--contract">
              <div>
                <span>SOURCE / 03</span>
                <strong>Official B20 contract</strong>
                <p>{contractAddress}</p>
              </div>
              <ArrowUpRight size={28} />
            </a>
          </div>
        </section>

        <section className="closing-section">
          <div className="closing-stamp">
            <PixelMark light />
            <span>AUTHORIZED</span>
          </div>
          <h2>STAY CLOSE.<br /><span>VERIFY FIRST.</span></h2>
          <a className="button button--lime" href="/create">
            Open creator flow <ArrowRight size={19} />
          </a>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <img src="/manus-storage/aasa-pixel-emblem_f7385758.png" alt="" />
          <strong className="wordmark-registered">$AASA</strong>
          <span>AUTHORIZED AGENTIC SOCIAL AVATAR</span>
        </div>
        <p>
          Informational only. Digital assets are volatile. Verify all contract addresses and live terms directly
          from the project before participating.
        </p>
        <a href="#top">Back to top <ArrowUpRight size={14} /></a>
      </footer>
    </div>
  );
}
