export default function Targeting() {
  const certs = [
    { label: "Gas Safety Certificate", sub: "Annual · £6,000+ fine if missed" },
    { label: "EICR", sub: "Every 5 years · £30,000 if lapsed" },
    { label: "EPC", sub: "Every 10 years · required at tenancy start" },
    { label: "Right to Rent", sub: "Checked at outset · ongoing duty" },
    { label: "RRA Information Sheet", sub: "Every tenant · £7,000 if not served" },
    { label: "Smoke & CO alarms", sub: "Checked at each tenancy start" },
  ];

  return (
    <section id="cert-tracker" style={{
      padding: "clamp(40px,6vw,72px) clamp(20px,5vw,40px) clamp(36px,5vw,60px)",
      borderBottom: "1px solid var(--forest)",
    }}>
      <div className="targeting-header">
        <div>
          <div className="display ital" style={{ fontSize: "clamp(40px,5vw,64px)", lineHeight: 1, color: "var(--emerald)" }}>IV.</div>
          <hr className="hr-thin" style={{ margin: "12px 0" }} />
          <div className="smallcaps mono" style={{ fontSize: 13, color: "var(--forest)" }}>Certificate tracker</div>
        </div>
        <div>
          <h3 className="display" style={{
            fontSize: "clamp(28px,4vw,54px)", lineHeight: 1.02, margin: "0 0 16px",
            color: "var(--forest)", fontWeight: 500, letterSpacing: "-.015em", maxWidth: "24ch"
          }}>
            A missed cert is a fine. <em style={{ color: "var(--emerald)" }}>We alert you at 90, 30, 14, and 7 days.</em>
          </h3>
          <p style={{ fontSize: 15, lineHeight: 1.65, margin: "0 0 32px", color: "var(--forest-ink)", maxWidth: "58ch" }}>
            Every certificate for every property is tracked automatically. When expiry approaches, Ravelston alerts you and drafts the contractor instruction so nothing slips through.
          </p>
        </div>
      </div>

      <div className="targeting-body">
        {/* cert list mock */}
        <div className="hairline" style={{
          padding: "clamp(20px,3vw,32px)",
          background: "var(--cream)",
          boxShadow: "6px 6px 0 var(--rule-soft)",
          position: "relative"
        }}>
          <div style={{ position: "absolute", top: -14, left: 36, background: "var(--cream)", padding: "0 12px", fontSize: 11 }} className="smallcaps mono">
            Certificates tracked per property
          </div>
          <div className="cert-grid" style={{ marginBottom: 20 }}>
            {certs.map((c, i) => (
              <div key={c.label} style={{
                padding: "12px 14px",
                border: i === 0 ? "1.5px solid #c0392b" : "1px solid var(--rule-soft)",
                background: i === 0 ? "rgba(192,57,43,.05)" : "transparent",
              }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: i === 0 ? "#c0392b" : "var(--forest)" }}>{c.label}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--emerald)", marginTop: 2 }}>{c.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--rule-soft)", paddingTop: 16 }}>
            <div className="smallcaps mono" style={{ fontSize: 11, color: "#c0392b", marginBottom: 4 }}>Flat 4, 18 Leith Walk</div>
            <div style={{ fontSize: 13, color: "#c0392b", fontWeight: 500 }}>Gas Safety Certificate expired 6 days ago</div>
            <div style={{ fontSize: 12, color: "var(--forest-ink)", marginTop: 6 }}>Contractor instruction drafted and ready to review.</div>
          </div>
        </div>

        {/* how alerts work */}
        <div>
          <div className="smallcaps mono" style={{ fontSize: 13, color: "var(--emerald)", marginBottom: 18 }}>
            How the alert system works
          </div>
          {[
            {
              n: "01",
              t: "Alerts at 90 / 30 / 14 / 7 days",
              b: "Ravelston sends email reminders as each certificate approaches expiry. The compliance score for that property drops automatically so it rises to the top of the dashboard."
            },
            {
              n: "02",
              t: "Contractor instructions drafted automatically",
              b: "When a cert is due, Ravelston drafts the contractor instruction prefilled with the property address and tenancy details. You review and send in one click."
            },
            {
              n: "03",
              t: "Certificates uploaded to the audit vault",
              b: "When the renewed certificate arrives, upload it directly to the property record. It is timestamped, stored in the encrypted vault, and the compliance score updates immediately."
            },
            {
              n: "04",
              t: "Full fine exposure per property",
              b: "The dashboard shows the fine at stake for each overdue or expiring cert — Gas Safety at £6,000+, EICR at £30,000, RRA Information Sheet at £7,000 — so you prioritise by real risk."
            },
          ].map(a => (
            <div key={a.n} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 14, padding: "16px 0", borderBottom: "1px solid var(--rule-soft)" }}>
              <div className="display ital" style={{ fontSize: 24, color: "var(--pink-ink)", fontWeight: 600, lineHeight: 1 }}>{a.n}.</div>
              <div>
                <div className="smallcaps" style={{ fontSize: 12, letterSpacing: ".15em", color: "var(--forest)", marginBottom: 4 }}>{a.t}</div>
                <p style={{ fontSize: 13.5, margin: 0, lineHeight: 1.55, color: "var(--forest-ink)" }}>{a.b}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .targeting-header {
          display: grid;
          grid-template-columns: min(160px,22vw) 1fr;
          gap: clamp(20px,4vw,40px);
          margin-bottom: 36px;
          align-items: start;
        }
        .targeting-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(28px,5vw,56px);
          align-items: start;
        }
        .cert-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        @media (max-width: 900px) {
          .targeting-header { grid-template-columns: 1fr; }
        }
        @media (max-width: 820px) {
          .targeting-body { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .cert-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
