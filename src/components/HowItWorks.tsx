export default function HowItWorks() {
  const steps = [
    { n: "01", t: "Upload your portfolio", b: "Import properties via CSV or add them manually. Landlord, tenant, property address, rent amount, tenancy start date, certificate expiry dates — all in one schema. Takes minutes for a full portfolio.", side: "One-time setup" },
    { n: "02", t: "Dashboard shows risk", b: "Every property gets a 0–100 compliance score sorted by urgency. Red means act today. Amber means act soon. Green means compliant. You see instantly which properties need attention and why.", side: "Risk at a glance" },
    { n: "03", t: "AI drafts the document", b: "Click the flagged issue and Ravelston drafts the required document — Section 8, Section 13, contractor instruction, or RRA Information Sheet — prefilled from your tenancy data. You review and approve.", side: "AI-drafted, human-approved" },
    { n: "04", t: "Audit vault logs everything", b: "Every document generated, reviewed, approved, and sent is timestamped and stored in an encrypted audit vault. If possession is ever disputed, you have court-ready evidence exportable in one click.", side: "Proof of every action" },
  ];

  return (
    <section id="how-it-works" style={{
      padding: "clamp(40px,6vw,72px) clamp(20px,5vw,40px) clamp(36px,5vw,60px)",
      borderBottom: "1px solid var(--forest)",
      background: "var(--forest)", color: "var(--cream)"
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "min(160px,25vw) 1fr", gap: "clamp(20px,4vw,40px)", marginBottom: 32, alignItems: "start" }}>
        <div>
          <div className="display ital" style={{ fontSize: "clamp(40px,5vw,64px)", lineHeight: 1, color: "var(--pink)" }}>II.</div>
          <hr style={{ border: 0, borderTop: "1px solid rgba(255,250,223,.3)", margin: "12px 0" }} />
          <div className="smallcaps mono" style={{ fontSize: 13, color: "var(--pink)" }}>How it works</div>
        </div>
        <div>
          <h3 className="display" style={{
            fontSize: "clamp(30px,4vw,54px)", lineHeight: 1.02, margin: 0,
            color: "var(--cream)", fontWeight: 500, letterSpacing: "-.015em", maxWidth: "22ch"
          }}>
            AI drafts. You approve. <em style={{ color: "var(--pink)" }}>Compliance at machine speed.</em>
          </h3>
        </div>
      </div>

      <div className="steps-grid" style={{ borderTop: "1px solid rgba(255,250,223,.3)", borderBottom: "1px solid rgba(255,250,223,.3)" }}>
        {steps.map((s, i) => (
          <div key={s.n} className="step-card" style={{
            padding: "clamp(18px,3vw,28px) clamp(16px,2.5vw,24px) clamp(22px,3.5vw,32px)",
            borderRight: i < steps.length - 1 ? "1px solid rgba(255,250,223,.18)" : "none",
            position: "relative"
          }}>
            <div className="display" style={{
              fontSize: "clamp(54px,7vw,84px)", lineHeight: .9,
              color: "var(--pink)", fontStyle: "italic", margin: "0 0 4px", fontWeight: 500
            }}>
              {s.n}.
            </div>
            <div className="smallcaps mono" style={{ fontSize: 12, color: "var(--pink)", marginBottom: 8 }}>{s.side}</div>
            <h4 className="display" style={{ fontSize: "clamp(18px,2vw,24px)", lineHeight: 1.1, margin: "0 0 10px", color: "var(--cream)", fontWeight: 600 }}>
              {s.t}
            </h4>
            <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: 0, color: "rgba(255,250,223,.8)" }}>{s.b}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, fontSize: 12, color: "rgba(255,250,223,.6)", fontStyle: "italic", textAlign: "center" }}>
        no lock-in · no minimum term · cancel any time
      </div>

      <style>{`
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }
        @media (max-width: 900px) {
          .steps-grid { grid-template-columns: repeat(2, 1fr); }
          .step-card:nth-child(2) { border-right: none; }
          .step-card:nth-child(3) { border-top: 1px solid rgba(255,250,223,.18); border-right: 1px solid rgba(255,250,223,.18); }
          .step-card:nth-child(4) { border-top: 1px solid rgba(255,250,223,.18); border-right: none; }
        }
        @media (max-width: 500px) {
          .steps-grid { grid-template-columns: 1fr; }
          .step-card { border-right: none !important; border-bottom: 1px solid rgba(255,250,223,.18); }
          .step-card:last-child { border-bottom: none; }
        }
      `}</style>
    </section>
  );
}
