"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Info } from "lucide-react"
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
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

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
    console.log('🔍 Starting Google OAuth...')
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/auth/callback" }
    })
    
    if (error) {
      console.error('❌ Google OAuth Error:', error)
      setError(error.message)
    }
    setLoading(false)
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    setDebugInfo(null)

    console.log(`🔍 Starting ${mode}...`)
    console.log('📧 Email:', email)
    console.log('🌐 Supabase URL:', supabase.supabaseUrl)
    console.log('🔗 Redirect URL:', window.location.origin + "/auth/callback")

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
      
      console.log('📝 Attempting signup...')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/auth/callback" }
      })
      
      console.log('📊 Signup Response:', { data, error })
      setDebugInfo({ data, error })
      
      if (error) {
        console.error('❌ Signup Error:', error)
        setError(error.message)
      } else {
        console.log('✅ Signup Success:', data)
        
        if (data.user && !data.session) {
          console.log('📧 User created, email confirmation required')
          setSuccess("Account created! Please check your email (including spam folder) for a verification link.")
        } else if (data.session) {
          console.log('🎉 User signed up and logged in immediately')
          setSuccess("Account created and logged in successfully!")
          router.replace(redirect)
        } else {
          console.log('⚠️ Unexpected signup result')
          setSuccess("Account created! Please check your email for further instructions.")
        }
      }
    } else {
      console.log('🔐 Attempting signin...')
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      console.log('📊 Signin Response:', { data, error })
      setDebugInfo({ data, error })
      
      if (error) {
        console.error('❌ Signin Error:', error)
        setError(error.message)
      } else {
        console.log('✅ Signin Success:', data)
        router.replace(redirect)
      }
    }
    setLoading(false)
  }

  const testEmailResend = async () => {
    if (!email) {
      setError("Please enter your email first")
      return
    }
    
    setLoading(true)
    console.log('📧 Testing email resend...')
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    })
    
    if (error) {
      console.error('❌ Resend error:', error)
      setError(error.message)
    } else {
      console.log('✅ Resend successful')
      setSuccess('Verification email resent! Check your inbox and spam folder.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
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
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
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
                {loading ? "Loading..." : (mode === "signup" ? "Sign Up" : "Sign In")}
              </Button>
            </form>

            {mode === "signup" && email && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2 border-blue-200 text-blue-600"
                onClick={testEmailResend}
                disabled={loading}
              >
                📧 Resend Verification Email
              </Button>
            )}

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
                    onClick={() => {
                      setMode("signin")
                      setError(null)
                      setSuccess(null)
                      setDebugInfo(null)
                    }}
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
                    onClick={() => {
                      setMode("signup")
                      setError(null)
                      setSuccess(null)
                      setDebugInfo(null)
                    }}
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

        {/* Debug Information */}
        {debugInfo && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4" />
                Debug Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-2">
                <div>
                  <strong>User Created:</strong> {debugInfo.data?.user ? '✅ Yes' : '❌ No'}
                </div>
                <div>
                  <strong>Session Created:</strong> {debugInfo.data?.session ? '✅ Yes' : '❌ No'}
                </div>
                <div>
                  <strong>Email Confirmed:</strong> {debugInfo.data?.user?.email_confirmed_at ? '✅ Yes' : '⏳ Pending'}
                </div>
                {debugInfo.error && (
                  <div>
                    <strong>Error Code:</strong> {debugInfo.error.name || 'Unknown'}
                  </div>
                )}
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">Raw Response</summary>
                  <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuration Check */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="text-xs space-y-1">
              <div className="font-medium mb-2">🔧 Configuration Check:</div>
              <div>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}</div>
              <div>Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌'}</div>
              <div>Current URL: {typeof window !== 'undefined' ? window.location.origin : 'Loading...'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}