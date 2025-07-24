"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <Button disabled className="bg-gradient-to-r from-orange-400 to-pink-500">
        Loading...
      </Button>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{user.email?.split("@")[0]}</span>
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
        >
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <Button className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600">
      Sign In
    </Button>
  )
}
