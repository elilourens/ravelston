import { Diamond } from "./Ornaments";

export default function Summons() {
  return (
    <section style={{
      padding: "clamp(28px,4vw,48px) clamp(20px,5vw,40px) clamp(36px,5vw,60px)",
      borderBottom: "1px solid var(--forest)", position: "relative", overflow: "hidden"
    }}>
      <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
        <div className="smallcaps" style={{ fontSize: 12, color: "var(--emerald)", letterSpacing: ".25em", marginBottom: 18 }}>
          <Diamond size={6} />&nbsp;&nbsp; The Renters Rights Act is live &nbsp;&nbsp;<Diamond size={6} />
        </div>
        <h2 className="display" style={{
          fontSize: "clamp(48px,8vw,128px)",
          lineHeight: .92, margin: "0 auto 28px",
          color: "var(--forest)", fontWeight: 500,
          letterSpacing: "-.022em", maxWidth: "16ch"
        }}>
          Removing the risks{" "}
          <em style={{ color: "var(--emerald)" }}>from</em>{" "}
          <span style={{ position: "relative", display: "inline-block" }}>
            renting out.
            <span style={{ position: "absolute", left: 0, right: 0, bottom: 8, height: 14, background: "var(--pink)", zIndex: -1, opacity: .85 }} />
          </span>
        </h2>
        <p className="display ital" style={{ fontSize: "clamp(17px,2vw,22px)", maxWidth: "58ch", margin: "0 auto 16px", color: "var(--forest-ink)", lineHeight: 1.4 }}>
          Section 21 is gone. Every missed certificate, every unserved notice, every overdue rent review is now your liability. Ravelston makes sure none of them slip.
        </p>
        <p className="smallcaps mono" style={{ fontSize: 14, color: "var(--emerald)", letterSpacing: ".18em", margin: "0 auto 36px", maxWidth: "58ch", textAlign: "center" }}>
          Every draft reviewed before it sends. Every action logged. Every document court-ready.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          <a href="/waitlist" className="smallcaps" style={{
            background: "var(--forest)", color: "var(--cream)",
            padding: "clamp(14px,2vw,20px) clamp(22px,3vw,36px)", fontSize: 13, letterSpacing: ".2em",
            border: "1px solid var(--forest)", cursor: "pointer",
            boxShadow: "5px 5px 0 var(--pink)", textDecoration: "none"
          }}>
            Join the waitlist &nbsp;→
          </a>
          <a href="#dashboard" className="smallcaps" style={{
            padding: "clamp(14px,2vw,20px) clamp(18px,2.5vw,28px)", fontSize: 13, letterSpacing: ".2em",
            color: "var(--forest)", borderBottom: "1px solid var(--forest)", cursor: "pointer"
          }}>
            See the dashboard
          </a>
        </div>
      </div>
    </section>
  );
}
