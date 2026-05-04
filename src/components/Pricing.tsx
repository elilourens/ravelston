"use client";
import { useState } from "react";
import { Diamond } from "./Ornaments";

function Article({ n, t, children }: { n: string; t: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 14, padding: "16px 0", borderBottom: "1px solid var(--rule-soft)" }}>
      <div className="display ital" style={{ fontSize: 24, color: "var(--pink-ink)", fontWeight: 600, lineHeight: 1 }}>{n}.</div>
      <div>
        <div className="smallcaps" style={{ fontSize: 12, letterSpacing: ".15em", color: "var(--forest)", marginBottom: 4 }}>{t}</div>
        <p style={{ fontSize: 13.5, margin: 0, lineHeight: 1.55, color: "var(--forest-ink)" }}>{children}</p>
      </div>
    </div>
  );
}

const tiers = [
  { name: "Starter", price: 49, props: "Up to 30 properties", highlight: false },
  { name: "Growth", price: 99, props: "31–100 properties", highlight: true, tag: "Most common" },
  { name: "Pro", price: 199, props: "101–300 properties", highlight: false },
];

export default function Pricing() {
  const [selected, setSelected] = useState(1);
  const tier = tiers[selected];

  return (
    <section id="pricing" style={{ padding: "clamp(40px,6vw,72px) clamp(20px,5vw,40px) clamp(48px,7vw,80px)", borderBottom: "1px solid var(--forest)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "min(160px,22vw) 1fr", gap: "clamp(20px,4vw,40px)", marginBottom: 36, alignItems: "start" }}>
        <div>
          <div className="display ital" style={{ fontSize: "clamp(40px,5vw,64px)", lineHeight: 1, color: "var(--emerald)" }}>V.</div>
          <hr className="hr-thin" style={{ margin: "12px 0" }} />
          <div className="smallcaps mono" style={{ fontSize: 13 }}>Pricing</div>
        </div>
        <div>
          <h3 className="display" style={{
            fontSize: "clamp(28px,4vw,54px)", lineHeight: 1.02, margin: 0,
            color: "var(--forest)", fontWeight: 500, letterSpacing: "-.015em", maxWidth: "24ch"
          }}>
            Pick your tier. <em style={{ color: "var(--emerald)" }}>Cancel any time.</em>
          </h3>
        </div>
      </div>

      <div className="pricing-grid">
        {/* plan selector card */}
        <div className="hairline" style={{
          padding: "clamp(24px,4vw,36px) clamp(20px,4vw,40px) clamp(20px,3vw,32px)",
          background: "var(--cream)", position: "relative",
          boxShadow: "6px 6px 0 var(--rule-soft)"
        }}>
          <div style={{ position: "absolute", top: -14, left: 36, background: "var(--cream)", padding: "0 12px", fontSize: 11 }} className="smallcaps mono">
            Choose your plan
          </div>
          {/* wax seal */}
          <div style={{ position: "absolute", top: 24, right: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 999,
              background: "var(--pink)", border: "3px double var(--pink-ink)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transform: "rotate(-8deg)", boxShadow: "0 0 0 6px rgba(255,185,229,.3)"
            }}>
              <div className="display" style={{ fontSize: 11, color: "var(--forest-ink)", textAlign: "center", lineHeight: 1, fontStyle: "italic", fontWeight: 600 }}>
                flat<br />rate<br />/ mo
              </div>
            </div>
          </div>

          <div className="display" style={{ fontSize: "clamp(24px,3vw,36px)", lineHeight: 1.1, color: "var(--forest)", fontWeight: 500, maxWidth: "16ch", marginBottom: 24 }}>
            One flat rate. <em>Unlimited notices.</em>
          </div>

          {/* tier buttons */}
          <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
            {tiers.map((t, i) => (
              <button key={t.name} onClick={() => setSelected(i)} style={{
                flex: 1, minWidth: 90,
                padding: "14px 12px",
                border: i === selected ? "2px solid var(--forest)" : "1px solid var(--rule-soft)",
                background: i === selected ? "rgba(23,130,80,.06)" : "transparent",
                cursor: "pointer", fontFamily: "inherit",
                textAlign: "center"
              }}>
                {t.tag && <div className="smallcaps mono" style={{ fontSize: 9, color: "var(--emerald)", marginBottom: 3 }}>{t.tag}</div>}
                <div className="display" style={{ fontSize: 22, fontWeight: 600, color: "var(--forest)", lineHeight: 1 }}>£{t.price}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--forest)", marginTop: 4, opacity: .6 }}>/mo</div>
                <div className="smallcaps" style={{ fontSize: 10, color: "var(--forest-ink)", marginTop: 6 }}>{t.name}</div>
              </button>
            ))}
          </div>

          <hr className="hr-double" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0 6px", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div className="smallcaps mono" style={{ fontSize: 13, color: "var(--emerald)" }}>{tier.props}</div>
              <div className="display" style={{ fontSize: "clamp(40px,6vw,64px)", fontWeight: 600, color: "var(--forest)", lineHeight: 1 }}>
                £{tier.price}<span style={{ fontSize: 20, fontWeight: 400, color: "var(--forest-ink)" }}>/mo</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="smallcaps mono" style={{ fontSize: 13, color: "var(--emerald)" }}>White-label landlord portal</div>
              <div className="display" style={{ fontSize: 24, fontWeight: 600, color: "var(--forest-ink)" }}>+£49/mo</div>
              <div className="mono" style={{ fontSize: 13, color: "var(--emerald)", marginTop: 3, fontStyle: "italic" }}>optional add-on</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24, alignItems: "center", flexWrap: "wrap" }}>
            <a href="/waitlist" style={{
              flex: 1, border: "1px solid var(--forest)",
              background: "var(--forest)", color: "var(--cream)",
              padding: "16px 24px", fontSize: 12, letterSpacing: ".18em",
              fontFamily: "inherit", cursor: "pointer",
              boxShadow: "4px 4px 0 var(--pink)", minWidth: "min(180px, 100%)",
              textDecoration: "none", display: "block", textAlign: "center"
            }} className="smallcaps">
              Join the waitlist →
            </a>
            <div style={{ fontSize: 11, color: "var(--forest)", fontStyle: "italic", maxWidth: 170, lineHeight: 1.4 }}>
              Early access. Be first when we launch.
            </div>
          </div>
        </div>

        {/* fine print column */}
        <div>
          <div className="smallcaps mono" style={{ fontSize: 13, color: "var(--emerald)", marginBottom: 14 }}>
            <Diamond size={6} /> The fine print, in plain English <Diamond size={6} />
          </div>
          <Article n="01" t="Notices included">
            All plans include unlimited AI-drafted notices: Section 8 (all 14 grounds), Section 13 rent review letters, RRA Information Sheets, and contractor instructions. No per-document charge.
          </Article>
          <Article n="02" t="Audit vault included">
            Every plan includes the encrypted audit vault. Every document generated, reviewed, approved, and sent is timestamped automatically. Court-ready PDF export is one click, always included.
          </Article>
          <Article n="03" t="Certificate tracking included">
            Gas Safety, EICR, EPC, Right to Rent, smoke and CO alarms — tracked per property across all plans. Automated email alerts at 90, 30, 14, and 7 days before expiry.
          </Article>
          <Article n="04" t="Cancel any time">
            Pause or cancel from your dashboard. No exit fees, no notice period, no &ldquo;talk to sales&rdquo; gate. Your data is exportable as CSV at any point.
          </Article>
          <Article n="05" t="Data &amp; security">
            All data is stored in an encrypted Postgres database with row-level security. Each agency&apos;s data is fully isolated. No data is used to train AI models. GDPR compliant.
          </Article>

          <div style={{ marginTop: 24, padding: "18px 20px", border: "1px solid var(--forest)", background: "rgba(255,185,229,.18)" }} id="enterprise">
            <div className="smallcaps mono" style={{ fontSize: 13, color: "var(--emerald)", marginBottom: 6 }}>300+ properties</div>
            <div className="display" style={{ fontSize: 22, lineHeight: 1.2, color: "var(--forest)", marginBottom: 6, fontWeight: 500 }}>
              Enterprise pricing. <em>Talk to us.</em>
            </div>
            <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>
              Managing a large multi-branch portfolio? We offer custom pricing, priority support, bulk CSV migration, and white-glove onboarding for agencies with 300+ properties under management.
            </p>
            <a href="/contact" className="smallcaps" style={{ display: "inline-block", marginTop: 10, fontSize: 13, borderBottom: "1px solid var(--forest)", cursor: "pointer" }}>
              Get in touch →
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .pricing-grid {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: clamp(28px,5vw,48px);
          align-items: start;
        }
        @media (max-width: 820px) {
          .pricing-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
