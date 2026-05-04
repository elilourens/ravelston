"use client";
import { useState } from "react";

export default function Masthead() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{ borderBottom: "1px solid var(--forest)" }}>
      {/* nav bar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        padding: "11px 40px",
        fontSize: 11,
        borderBottom: "1px solid var(--rule-soft)"
      }} className="smallcaps hidden-mobile">
        <div style={{ display: "flex", gap: 24 }}>
          <a href="#dashboard" style={{ cursor: "pointer" }}>Dashboard</a>
          <a href="#notices" style={{ cursor: "pointer" }}>Notices</a>
          <a href="#pricing" style={{ cursor: "pointer" }}>Pricing</a>
        </div>
        <div className="mono" style={{ color: "var(--forest)", opacity: .8, letterSpacing: ".2em", fontSize: 11, fontWeight: 700 }}>
          Compliance software for UK letting agents
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <a href="/waitlist" style={{ cursor: "pointer" }}>Join waitlist →</a>
        </div>
      </div>

      {/* wordmark */}
      <div style={{ padding: "clamp(8px,1.5vw,14px) clamp(20px,5vw,40px) clamp(6px,1vw,10px)", position: "relative" }}>
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{
            position: "absolute", right: "clamp(20px,5vw,40px)", top: "50%", transform: "translateY(-50%)",
            display: "none", background: "none", border: "1px solid var(--forest)",
            padding: "6px 10px", cursor: "pointer", color: "var(--forest)", fontSize: 16,
            lineHeight: 1
          }}
          className="show-mobile"
          aria-label="Menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <hr className="hr-thin" style={{ margin: "0 0 4px" }} />
        <h1 className="display" style={{
          fontSize: "clamp(38px, 7vw, 96px)",
          margin: 0,
          lineHeight: .9,
          letterSpacing: "-.025em",
          fontWeight: 500,
          textAlign: "center",
          color: "var(--forest)"
        }}>
          Ravelston<span style={{ color: "var(--pink-ink)", fontStyle: "italic" }}>.ai</span>
        </h1>
        <hr className="hr-thin" style={{ margin: "4px 0 0" }} />

        <div className="show-mobile mono" style={{ textAlign: "center", fontSize: 9.5, color: "var(--forest)", opacity: .5, letterSpacing: ".18em", marginTop: 6, fontVariantCaps: "all-small-caps" }}>
          Compliance software for UK letting agents
        </div>
      </div>

      {menuOpen && (
        <nav style={{
          borderTop: "1px solid var(--rule)",
          background: "var(--cream-2)",
          padding: "20px 24px",
          display: "flex", flexDirection: "column", gap: 14
        }} className="show-mobile">
          {[
            ["#dashboard", "Dashboard"],
            ["#notices", "Notices"],
            ["#pricing", "Pricing"],
            ["/waitlist", "Join waitlist →"],
          ].map(([href, label]) => (
            <a key={href} href={href}
              onClick={() => setMenuOpen(false)}
              className="smallcaps"
              style={{ fontSize: 13, color: "var(--forest)", borderBottom: "1px solid var(--rule-soft)", paddingBottom: 10 }}>
              {label}
            </a>
          ))}
        </nav>
      )}

      <style>{`
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 641px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}
