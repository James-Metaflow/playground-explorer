"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { Loader2, Mail, Lock, User as UserIcon } from "lucide-react"

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Form data
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN') {
        setShowDialog(false)
        setMessage('')
        setError('')
        
        // Create user profile if it doesn't exist
        if (session?.user) {
          const { error: profileError } = await supabase
            .from('users')
            .upsert({
              id: session.user.id,
              email: session.user.email,
              name: name || session.user.email?.split('@')[0] || 'User',
              updated_at: new Date().toISOString()
            })
          
          if (profileError) {
            console.error('Error creating user profile:', profileError)
          }
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [name])

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      setError('Error signing out')
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setError('')
    setMessage('')

    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name
            }
          }
        })

        if (error) {
          setError(error.message)
        } else if (data.user) {
          setMessage('Check your email for the confirmation link!')
        }
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setError(error.message)
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setAuthLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setName('')
    setError('')
    setMessage('')
  }

  const switchMode = () => {
    setIsSignUp(!isSignUp)
    resetForm()
  }

  if (loading) {
    return (
      <Button disabled className="bg-gradient-to-r from-orange-400 to-pink-500">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium hidden sm:inline">
            {user.user_metadata?.name || user.email?.split("@")[0] || 'User'}
          </span>
        </div>
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
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
          onClick={() => {
            setShowDialog(true)
            resetForm()
          }}
        >
          Sign In
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">🏰</span>
            </div>
          </div>
          <DialogTitle className="text-center">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isSignUp 
              ? 'Join PlaygroundExplorer to rate and share playground experiences!'
              : 'Sign in to your PlaygroundExplorer account'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
            disabled={authLoading}
          >
            {authLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={switchMode}
              className="text-sm text-orange-600 hover:text-orange-700 underline"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}