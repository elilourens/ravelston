"use client";

export default function Hero() {
  const headline = "The compliance cockpit every letting agent needs right now.";
  const words = headline.split(" ");

  return (
    <section style={{ padding: "clamp(32px,5vw,56px) clamp(20px,5vw,40px) clamp(28px,4vw,40px)", borderBottom: "1px solid var(--forest)" }}>
      <div className="hero-grid">
        {/* left margin */}
        <aside className="hero-aside">
          <div className="display ital" style={{ fontSize: "clamp(40px,5vw,64px)", lineHeight: 1, color: "var(--emerald)" }}>I.</div>
          <hr className="hr-thin" style={{ margin: "12px 0" }} />
          <div className="smallcaps mono" style={{ fontSize: 13, color: "var(--forest)" }}>What it is</div>
          <p style={{ fontSize: 13, lineHeight: 1.5, marginTop: 10, color: "var(--forest-ink)" }}>
            <span className="smallcaps">In one line:</span> a compliance dashboard for UK letting agents that tracks property-level risk, drafts Section 8 and Section 13 documents for review, and keeps court-ready proof of every tenancy action.
          </p>
        </aside>

        {/* main column */}
        <div>
          <h2 className="display" style={{
            fontSize: "clamp(36px, 5.4vw, 88px)",
            lineHeight: 1.02, margin: "0 0 22px",
            color: "var(--forest)", letterSpacing: "-.018em", fontWeight: 500
          }}>
            <span>{words.slice(0, 3).join(" ")} </span>
            <em style={{ color: "var(--emerald)", fontFamily: '"Cormorant Garamond",serif' }}>
              {words.slice(3, 7).join(" ")}{" "}
            </em>
            <span style={{ textDecoration: "underline", textDecorationColor: "var(--pink)", textDecorationThickness: 6, textUnderlineOffset: 8 }}>
              {words.slice(7).join(" ")}
            </span>
          </h2>

          <div className="hero-body-grid">
            <p style={{ fontSize: 17, lineHeight: 1.6, margin: 0 }}>
              <span className="display" style={{
                float: "left", fontSize: "clamp(48px,6vw,74px)", lineHeight: .85,
                paddingRight: 10, paddingTop: 6, color: "var(--emerald)", fontWeight: 600
              }}>S</span>
              ection 21 is gone. Every tenancy is now periodic. Section 8 notices, Section 13 rent reviews, Awaab's Law SLA timers, gas cert expiry — all of it lands on the agent. Ravelston handles the paperwork. <em>You review and approve.</em>
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0, color: "var(--forest)", borderLeft: "1px solid var(--forest)", paddingLeft: 18 }}>
              Upload your portfolio once. The dashboard flags which properties need action today, drafts the required document prefilled from your tenancy data, and logs every step to an encrypted audit vault. <span className="smallcaps">Court-ready export in one click.</span>
            </p>
          </div>

          <div style={{ display: "flex", gap: 14, marginTop: 36, alignItems: "center", flexWrap: "wrap" }}>
            <a href="/waitlist" className="hairline smallcaps" style={{
              background: "var(--forest)", color: "var(--cream)",
              padding: "16px 28px", fontSize: 13, letterSpacing: ".18em",
              textDecoration: "none", boxShadow: "3px 3px 0 var(--pink)", cursor: "pointer"
            }}>
              Join the waitlist →
            </a>
            <a href="#dashboard" className="smallcaps" style={{
              padding: "16px 24px", fontSize: 13, color: "var(--forest)", letterSpacing: ".18em",
              borderBottom: "1px solid var(--forest)", cursor: "pointer"
            }}>
              See the dashboard
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .hero-grid {
          display: grid;
          grid-template-columns: 160px 1fr;
          gap: 40px;
          align-items: start;
        }
        .hero-body-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-top: 28px;
        }
        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr; }
          .hero-aside { display: none; }
        }
        @media (max-width: 640px) {
          .hero-body-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }
        }
      `}</style>
    </section>
  );
}
