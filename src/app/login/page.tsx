'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
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
        maxWidth: 540, margin: "0 auto",
      }}>
        <div className="display ital" style={{ fontSize: "clamp(40px,5vw,64px)", lineHeight: 1, color: "var(--emerald)", marginBottom: 12 }}>
          Sign in.
        </div>
        <hr className="hr-thin" style={{ margin: "0 0 28px" }} />

        <h1 className="display" style={{
          fontSize: "clamp(24px,3.5vw,36px)", lineHeight: 1.05,
          color: "var(--forest)", fontWeight: 500, letterSpacing: "-.015em",
          margin: "0 0 32px"
        }}>
          Welcome back to Ravelston.
        </h1>

        <form onSubmit={handleLogin}>
          {error && (
            <div style={{
              border: "1px solid #c0392b", background: "rgba(192,57,43,.07)",
              padding: "16px 20px", marginBottom: 24
            }}>
              <div style={{ fontSize: 14, color: "#c0392b" }}>
                {error}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label className="smallcaps mono" style={{ display: "block", fontSize: 11, color: "var(--emerald)", marginBottom: 8, letterSpacing: ".18em" }}>
              Email address
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

          <div style={{ marginBottom: 24 }}>
            <label className="smallcaps mono" style={{ display: "block", fontSize: 11, color: "var(--emerald)", marginBottom: 8, letterSpacing: ".18em" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%", padding: "14px 16px",
                border: "1px solid var(--forest)", background: "var(--cream)",
                fontFamily: "inherit", fontSize: 15, color: "var(--forest-ink)",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="smallcaps"
            style={{
              width: "100%", padding: "16px 24px",
              background: loading ? "var(--rule-soft)" : "var(--forest)",
              color: loading ? "var(--rule)" : "var(--cream)",
              border: "1px solid var(--forest)",
              fontSize: 13, letterSpacing: ".2em", fontFamily: "inherit",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "4px 4px 0 var(--pink)",
              transition: "box-shadow .15s, background .15s",
            }}
          >
            {loading ? "Signing in…" : "Sign in →"}
          </button>

          <p style={{ fontSize: 13, color: "var(--forest-ink)", marginTop: 20, textAlign: "center" }}>
            Don't have an account?{" "}
            <Link href="/signup" style={{ color: "var(--emerald)", borderBottom: "1px solid var(--emerald)" }}>
              Sign up
            </Link>
          </p>

          <p style={{ fontSize: 13, color: "var(--forest-ink)", marginTop: 12, textAlign: "center" }}>
            <Link href="/" style={{ color: "var(--forest)", borderBottom: "1px solid var(--forest)" }}>
              ← Back to home
            </Link>
          </p>
        </form>
      </main>
    </div>
  )
}
