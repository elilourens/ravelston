import { Fleuron } from "./Ornaments";

export default function Footer() {
  const cols: { h: string; l: string[] }[] = [];

  return (
    <footer style={{ padding: "clamp(36px,5vw,56px) clamp(20px,5vw,40px) clamp(20px,3vw,32px)", background: "var(--cream-2)" }}>
      <div className="footer-grid" style={{ marginBottom: 36 }}>
        <div>
          <div className="display" style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 500, color: "var(--forest)", lineHeight: 1 }}>
            Ravelston<span style={{ color: "var(--pink-ink)", fontStyle: "italic" }}>.ai</span>
          </div>
          <p style={{ fontSize: 13, maxWidth: "36ch", marginTop: 14, color: "var(--forest-ink)", lineHeight: 1.55 }}>
            Compliance software for UK letting agents. Portfolio risk dashboard, AI-drafted notices, certificate tracking, and an encrypted audit vault. Built for the post-Section 21 world.
          </p>
          <div className="mono" style={{ fontSize: 13, color: "var(--emerald)", marginTop: 14, letterSpacing: ".05em" }}>
            Ravelston · Edinburgh
          </div>
        </div>
        {cols.map(c => (
          <div key={c.h}>
            <div className="smallcaps" style={{
              fontSize: 11, letterSpacing: ".18em", color: "var(--emerald)",
              marginBottom: 10, borderBottom: "1px solid var(--forest)", paddingBottom: 6
            }}>{c.h}</div>
            {c.l.map(x => (
              <a key={x} href="#" style={{ display: "block", fontSize: 13, padding: "4px 0", color: "var(--forest-ink)" }}>
                {x}
              </a>
            ))}
          </div>
        ))}
      </div>

      <hr className="hr-double" />

      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "18px 0 0", fontSize: 11, flexWrap: "wrap", gap: 10
      }} className="smallcaps">
        <div>© 2026 Ravelston Ltd. All rights reserved.</div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          fontStyle: "italic", fontFamily: '"Cormorant Garamond",serif',
          textTransform: "none", letterSpacing: 0, fontSize: 13
        }}>
          <Fleuron size={14} color="var(--emerald)" /> Made in Edinburgh <Fleuron size={14} color="var(--emerald)" />
        </div>
        <div>v 1.0 · May 2026</div>
      </div>

      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
          gap: clamp(20px,4vw,32px);
        }
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </footer>
  );
}
