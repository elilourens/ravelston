'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="smallcaps"
      style={{
        padding: "10px 18px",
        background: "transparent",
        color: "var(--forest)",
        border: "1px solid var(--forest)",
        fontSize: 11,
        letterSpacing: ".18em",
        fontFamily: "inherit",
        cursor: "pointer",
        transition: "background .15s, color .15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--forest)"
        e.currentTarget.style.color = "var(--cream)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent"
        e.currentTarget.style.color = "var(--forest)"
      }}
    >
      Sign out
    </button>
  )
}
