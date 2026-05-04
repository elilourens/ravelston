export default function Register() {
  const properties = [
    {
      n: "01",
      address: "Flat 4, 18 Leith Walk",
      landlord: "D. Hargreaves",
      score: 14,
      status: "red",
      issue: "Gas cert expired 6 days ago",
      action: "Send contractor instruction",
    },
    {
      n: "02",
      address: "12 Bruntsfield Place",
      landlord: "A. Sinclair",
      score: 41,
      status: "red",
      issue: "Landlord requests possession",
      action: "Generate Section 8",
    },
    {
      n: "03",
      address: "8 Morningside Road",
      landlord: "P. Mackay",
      score: 58,
      status: "amber",
      issue: "Rent review due in 18 days",
      action: "Generate Section 13",
    },
    {
      n: "04",
      address: "32 Canongate",
      landlord: "F. Reid",
      score: 63,
      status: "amber",
      issue: "RRA Information Sheet not logged",
      action: "Mark sent / upload proof",
    },
    {
      n: "05",
      address: "2B Easter Road",
      landlord: "M. Thomson",
      score: 91,
      status: "green",
      issue: "Compliant",
      action: "",
    },
  ];

  const statusColour: Record<string, string> = {
    red: "#c0392b",
    amber: "#c47a1e",
    green: "var(--emerald)",
  };

  const statusBg: Record<string, string> = {
    red: "rgba(192,57,43,.08)",
    amber: "rgba(196,122,30,.08)",
    green: "rgba(23,130,80,.07)",
  };

  return (
    <section id="dashboard" style={{
      padding: "clamp(40px,6vw,72px) clamp(20px,5vw,40px) clamp(36px,5vw,60px)",
      borderBottom: "1px solid var(--forest)",
      background: "var(--cream-2)"
    }}>
      <div className="register-header">
        <div>
          <div className="display ital" style={{ fontSize: "clamp(40px,5vw,64px)", lineHeight: 1, color: "var(--emerald)" }}>III.</div>
          <hr className="hr-thin" style={{ margin: "12px 0" }} />
          <div className="smallcaps mono" style={{ fontSize: 13 }}>The dashboard</div>
        </div>
        <div>
          <h3 className="display" style={{
            fontSize: "clamp(28px,4vw,54px)", lineHeight: 1.02, margin: 0,
            color: "var(--forest)", fontWeight: 500, letterSpacing: "-.015em", maxWidth: "22ch"
          }}>
            Every property. <em style={{ color: "var(--emerald)" }}>Ranked by what needs doing today.</em>
          </h3>
        </div>
      </div>

      {/* summary bar */}
      <div className="summary-bar" style={{
        marginBottom: 24, padding: "18px 20px",
        border: "1px solid var(--forest)", background: "var(--cream)"
      }}>
        {[
          { label: "Total properties", val: "124" },
          { label: "Red — act today", val: "17", col: "#c0392b" },
          { label: "Amber — act soon", val: "31", col: "#c47a1e" },
          { label: "Notices awaiting review", val: "3", col: "var(--emerald)" },
        ].map(s => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div className="display" style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 600, color: s.col ?? "var(--forest)", lineHeight: 1 }}>{s.val}</div>
            <div className="smallcaps mono" style={{ fontSize: 10, color: "var(--forest)", marginTop: 4, opacity: .7 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* table header — hidden on mobile */}
      <div className="mono smallcaps table-header" style={{
        display: "grid",
        gridTemplateColumns: "48px 2fr 1.2fr 80px 1.5fr 2fr 100px",
        gap: 14, fontSize: 10, padding: "10px 14px",
        borderTop: "3px double var(--forest)", borderBottom: "1px solid var(--forest)",
        color: "var(--forest)"
      }}>
        <div>№</div>
        <div>Property</div>
        <div>Landlord</div>
        <div>Score</div>
        <div>Issue</div>
        <div>Next action</div>
        <div style={{ textAlign: "right" }}>Draft</div>
      </div>

      {/* property rows — desktop table / mobile cards */}
      {properties.map((p) => (
        <div key={p.n} className="property-row" style={{
          borderBottom: "1px solid var(--forest)",
          background: statusBg[p.status],
        }}>
          {/* desktop row */}
          <div className="property-row-desktop" style={{
            display: "grid",
            gridTemplateColumns: "48px 2fr 1.2fr 80px 1.5fr 2fr 100px",
            gap: 14, fontSize: 13, padding: "14px 14px",
            alignItems: "center",
          }}>
            <div className="mono smallcaps" style={{ fontSize: 11, color: "var(--forest)" }}>{p.n}</div>
            <div style={{ fontWeight: 500, color: "var(--forest)" }}>{p.address}</div>
            <div style={{ fontSize: 12, color: "var(--forest-ink)" }}>{p.landlord}</div>
            <div>
              <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: statusColour[p.status] }}>{p.score}</span>
              <span className="mono" style={{ fontSize: 9, color: "var(--forest)", opacity: .4 }}>/100</span>
            </div>
            <div style={{ fontSize: 12, color: statusColour[p.status], fontWeight: 500 }}>{p.issue}</div>
            <div style={{ fontSize: 12, color: "var(--forest-ink)" }}>{p.action}</div>
            <div style={{ textAlign: "right" }}>
              {p.action && (
                <a href="/waitlist" className="smallcaps hairline" style={{
                  display: "inline-block",
                  background: "var(--forest)", color: "var(--cream)",
                  padding: "7px 12px", fontSize: 10, letterSpacing: ".15em",
                  textDecoration: "none", boxShadow: "2px 2px 0 var(--pink)",
                }}>
                  Draft →
                </a>
              )}
            </div>
          </div>
          {/* mobile card */}
          <div className="property-row-mobile" style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontWeight: 500, color: "var(--forest)", fontSize: 14 }}>{p.address}</div>
              <div>
                <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: statusColour[p.status] }}>{p.score}</span>
                <span className="mono" style={{ fontSize: 9, color: "var(--forest)", opacity: .4 }}>/100</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--forest-ink)", marginBottom: 4 }}>{p.landlord}</div>
            <div style={{ fontSize: 12, color: statusColour[p.status], fontWeight: 500, marginBottom: p.action ? 10 : 0 }}>{p.issue}</div>
            {p.action && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 11, color: "var(--forest-ink)" }}>{p.action}</div>
                <a href="/waitlist" className="smallcaps hairline" style={{
                  background: "var(--forest)", color: "var(--cream)",
                  padding: "7px 12px", fontSize: 10, letterSpacing: ".15em",
                  textDecoration: "none", boxShadow: "2px 2px 0 var(--pink)",
                }}>
                  Draft →
                </a>
              </div>
            )}
          </div>
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginTop: 18, flexWrap: "wrap", gap: 12 }}>
        <div className="hairline" style={{
          display: "flex", flexWrap: "wrap", gap: 12, padding: "8px 14px",
          background: "rgba(23,130,80,.06)", fontSize: 13
        }}>
          <span className="smallcaps mono" style={{ color: "var(--emerald)" }}>✓ &nbsp;Every draft reviewed before it sends</span>
          <span className="smallcaps mono" style={{ color: "var(--emerald)" }}>✓ &nbsp;Encrypted audit vault on every action</span>
          <span className="smallcaps mono" style={{ color: "var(--emerald)" }}>✓ &nbsp;Court-ready export in one click</span>
        </div>
      </div>

      <style>{`
        .register-header {
          display: grid;
          grid-template-columns: min(160px,22vw) 1fr;
          gap: clamp(20px,4vw,40px);
          margin-bottom: 28px;
          align-items: start;
        }
        .summary-bar {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 14;
        }
        .property-row-mobile { display: none; }
        .property-row-desktop { display: grid; }
        @media (max-width: 900px) {
          .register-header { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .summary-bar { grid-template-columns: repeat(2,1fr); gap: 10px; }
          .table-header { display: none; }
          .property-row-desktop { display: none; }
          .property-row-mobile { display: block; }
        }
      `}</style>
    </section>
  );
}
