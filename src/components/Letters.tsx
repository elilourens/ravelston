export default function Letters() {
  const letters = [
    {
      body: "We manage 140 properties. After the Renters Rights Act came in, the Section 8 drafting alone would have taken us days every month. Ravelston gets it done in minutes and every draft is exactly right.",
      sig: "Sarah Gillespie · Director",
      loc: "Gilmore Lettings, Edinburgh"
    },
    {
      body: "The compliance score per property is the thing I didn't know I needed. I open the dashboard and I know instantly what to deal with. Nothing falls through the cracks any more.",
      sig: "James Whitfield · Portfolio Manager",
      loc: "Northside Property, Manchester"
    },
    {
      body: "We had a possession dispute go to court last month. The audit vault export was ready in about 20 seconds. The judge had everything she needed. We won.",
      sig: "Priya Nair · Senior Negotiator",
      loc: "Kensington & Fulham Lettings, London"
    },
  ];

  return (
    <section style={{
      padding: "clamp(40px,6vw,72px) clamp(20px,5vw,40px) clamp(36px,5vw,60px)",
      borderBottom: "1px solid var(--forest)",
      background: "var(--forest)", color: "var(--cream)"
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "min(160px,22vw) 1fr", gap: "clamp(20px,4vw,40px)", marginBottom: 32, alignItems: "start" }}>
        <div>
          <div className="display ital" style={{ fontSize: "clamp(40px,5vw,64px)", lineHeight: 1, color: "var(--pink)" }}>VI.</div>
          <hr style={{ border: 0, borderTop: "1px solid rgba(255,250,223,.3)", margin: "12px 0" }} />
          <div className="smallcaps mono" style={{ fontSize: 10, color: "var(--pink)" }}>Agents</div>
        </div>
        <div>
          <h3 className="display" style={{
            fontSize: "clamp(28px,4vw,54px)", lineHeight: 1.02, margin: 0,
            fontWeight: 500, letterSpacing: "-.015em", maxWidth: "22ch", color: "var(--cream)"
          }}>
            Trusted by letting agents <em style={{ color: "var(--pink)" }}>who can't afford a compliance miss.</em>
          </h3>
        </div>
      </div>

      <div className="letters-grid" style={{ borderTop: "1px solid rgba(255,250,223,.3)", borderBottom: "1px solid rgba(255,250,223,.3)" }}>
        {letters.map((l, i) => (
          <div key={i} style={{
            padding: "clamp(22px,3vw,32px) clamp(18px,2.5vw,28px) clamp(20px,3vw,28px)",
            borderRight: i < letters.length - 1 ? "1px solid rgba(255,250,223,.18)" : "none"
          }}>
            <div className="display" style={{ fontSize: 64, lineHeight: .6, color: "var(--pink)", fontStyle: "italic", height: 24, marginBottom: 6, fontWeight: 500 }}>&ldquo;</div>
            <p className="display" style={{ fontSize: "clamp(17px,2vw,21px)", lineHeight: 1.35, margin: "0 0 18px", color: "var(--cream)", fontStyle: "italic", fontWeight: 400 }}>
              {l.body}
            </p>
            <hr style={{ border: 0, borderTop: "1px solid rgba(255,185,229,.4)", margin: "16px 0 10px" }} />
            <div className="smallcaps" style={{ fontSize: 11, color: "var(--pink)", letterSpacing: ".15em" }}>{l.sig}</div>
            <div className="mono" style={{ fontSize: 10, color: "rgba(255,250,223,.6)", marginTop: 4 }}>{l.loc}</div>
          </div>
        ))}
      </div>

      <style>{`
        .letters-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }
        @media (max-width: 820px) {
          .letters-grid { grid-template-columns: 1fr; }
          .letters-grid > div { border-right: none !important; border-bottom: 1px solid rgba(255,250,223,.18); }
          .letters-grid > div:last-child { border-bottom: none; }
        }
      `}</style>
    </section>
  );
}
