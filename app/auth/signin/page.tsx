"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.replace(redirect)
      }
    })
  }, [router, redirect])

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/auth/callback" }
    })
    if (error) alert(error.message)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-blue-100 flex items-center justify-center">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-orange-200">
        <CardHeader>
          <CardTitle className="text-2xl text-center bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Sign In
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-center text-gray-600">Sign in to continue to Playground Explorer</p>
          <Button
            className="w-full bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
            onClick={handleSignIn}
          >
            Sign in with Google
          </Button>
          <div className="mt-6 text-center">
            <Link href="/" className="text-orange-500 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}