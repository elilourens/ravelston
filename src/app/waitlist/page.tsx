"use client";
import { useState } from "react";
import Link from "next/link";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        const data = await res.json();
        setErrorMsg(data.error ?? "Something went wrong.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="paper" style={{
      maxWidth: 1440, margin: "0 auto",
      borderLeft: "1px solid var(--forest)", borderRight: "1px solid var(--forest)",
      minHeight: "100vh",
    }}>
      {/* header */}
      <header style={{ borderBottom: "1px solid var(--forest)", padding: "clamp(8px,1.5vw,14px) clamp(20px,5vw,40px)" }}>
        <hr className="hr-thin" style={{ margin: "0 0 4px" }} />
        <Link href="/" className="display" style={{
          fontSize: "clamp(28px,5vw,64px)", lineHeight: .9,
          letterSpacing: "-.025em", fontWeight: 500,
          color: "var(--forest)", display: "block", textAlign: "center"
        }}>
          Ravelston<span style={{ color: "var(--pink-ink)", fontStyle: "italic" }}>.ai</span>
        </Link>
        <hr className="hr-thin" style={{ margin: "4px 0 0" }} />
      </header>

      {/* main */}
      <main style={{
        padding: "clamp(48px,8vw,96px) clamp(20px,5vw,40px)",
        maxWidth: 640, margin: "0 auto",
      }}>
        <div className="display ital" style={{ fontSize: "clamp(40px,5vw,64px)", lineHeight: 1, color: "var(--emerald)", marginBottom: 12 }}>
          Join the waitlist.
        </div>
        <hr className="hr-thin" style={{ margin: "0 0 28px" }} />

        <h1 className="display" style={{
          fontSize: "clamp(28px,4vw,48px)", lineHeight: 1.05,
          color: "var(--forest)", fontWeight: 500, letterSpacing: "-.015em",
          margin: "0 0 16px", maxWidth: "22ch"
        }}>
          Be first when Ravelston launches.
        </h1>

        <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--forest-ink)", margin: "0 0 36px", maxWidth: "48ch" }}>
          Compliance software for UK letting agents. Portfolio risk dashboard, AI-drafted notices, certificate tracking, and an encrypted audit vault.
        </p>

        {status === "success" ? (
          <div style={{
            border: "1px solid var(--emerald)", background: "rgba(23,130,80,.07)",
            padding: "28px 32px",
          }}>
            <div className="display" style={{ fontSize: 28, color: "var(--emerald)", marginBottom: 8 }}>
              You&apos;re on the list.
            </div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--forest-ink)", lineHeight: 1.6 }}>
              We&apos;ll be in touch when we&apos;re ready. In the meantime, feel free to explore the site.
            </p>
            <Link href="/" className="smallcaps" style={{
              display: "inline-block", marginTop: 20,
              fontSize: 12, color: "var(--forest)", borderBottom: "1px solid var(--forest)"
            }}>
              ← Back to Ravelston
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label className="smallcaps mono" style={{ display: "block", fontSize: 11, color: "var(--emerald)", marginBottom: 8, letterSpacing: ".18em" }}>
                Your email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@youragency.co.uk"
                required
                style={{
                  width: "100%", padding: "14px 16px",
                  border: "1px solid var(--forest)", background: "var(--cream)",
                  fontFamily: "inherit", fontSize: 15, color: "var(--forest-ink)",
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>

            {status === "error" && (
              <div style={{ fontSize: 13, color: "#c0392b", marginBottom: 12 }}>{errorMsg}</div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="smallcaps"
              style={{
                width: "100%", padding: "16px 24px",
                background: status === "loading" ? "var(--rule-soft)" : "var(--forest)",
                color: "var(--cream)", border: "1px solid var(--forest)",
                fontSize: 13, letterSpacing: ".2em", fontFamily: "inherit",
                cursor: status === "loading" ? "not-allowed" : "pointer",
                boxShadow: status === "loading" ? "none" : "4px 4px 0 var(--pink)",
                transition: "box-shadow .15s, background .15s",
              }}
            >
              {status === "loading" ? "Sending…" : "Join the waitlist →"}
            </button>

            <p style={{ fontSize: 12, color: "var(--forest-ink)", marginTop: 14, fontStyle: "italic", opacity: .7 }}>
              No spam. Just a heads-up when we launch.
            </p>
          </form>
        )}
      </main>
    </div>
  );
}
