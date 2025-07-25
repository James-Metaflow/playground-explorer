"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.replace(redirect)
      }
    })
  }, [router, redirect])

  const handleGoogle = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/auth/callback" }
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!email || !password) {
      setError("Please enter your email and password.")
      setLoading(false)
      return
    }

    if (mode === "signup") {
      if (!PASSWORD_REGEX.test(password)) {
        setError("Password must be at least 8 characters, include uppercase, lowercase, number, and special character.")
        setLoading(false)
        return
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.")
        setLoading(false)
        return
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/auth/callback" }
      })
      if (error) setError(error.message)
      else setError("Check your email to confirm your account.")
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-blue-100 flex items-center justify-center">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-orange-200">
        <CardHeader>
          <CardTitle className="text-2xl text-center bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            {mode === "signup" ? "Sign Up" : "Sign In"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-center text-gray-600">
            {mode === "signup"
              ? "Create your Playground Explorer account"
              : "Sign in to continue to Playground Explorer"}
          </p>

          {error && (
            <div className="mb-4 text-red-600 text-center text-sm">{error}</div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="border-orange-200"
            />
            <Input
              type="password"
              placeholder="Password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="border-orange-200"
            />
            {mode === "signup" && (
              <Input
                type="password"
                placeholder="Confirm Password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="border-orange-200"
              />
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
              disabled={loading}
            >
              {mode === "signup" ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-2 text-gray-400 text-xs">or</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-orange-200"
            onClick={handleGoogle}
            disabled={loading}
          >
            Sign in with Google
          </Button>

          <div className="mt-6 text-center text-sm">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-orange-500 hover:underline"
                  onClick={() => setMode("signin")}
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  className="text-orange-500 hover:underline"
                  onClick={() => setMode("signup")}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
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