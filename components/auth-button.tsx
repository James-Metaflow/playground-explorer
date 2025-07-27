"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { Loader2, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle } from "lucide-react"

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [signingOut, setSigningOut] = useState(false)

  // Form data
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    let mounted = true

    // Get initial session with better error handling
    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        }
        
        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
          console.log('👤 Initial user:', session?.user?.email || 'Not logged in')
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes with enhanced user creation
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email || 'No user')
      
      if (mounted) {
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ User signed in, ensuring database record...')
          setShowDialog(false)
          setMessage('')
          setError('')
          
          // Ensure user exists in custom users table
          await ensureUserInDatabase(session.user)
        }

        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out')
          setUser(null)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Enhanced user creation with better error handling
  const ensureUserInDatabase = async (authUser: User) => {
    try {
      console.log('🔍 Checking if user exists in database...')
      
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, email, full_name')
        .eq('id', authUser.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking user:', checkError)
        return
      }

      if (!existingUser) {
        console.log('👤 Creating user in database...')
        
        const userData = {
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || 
                    authUser.user_metadata?.name || 
                    name || 
                    authUser.email?.split('@')[0] || 
                    'User',
          avatar_url: authUser.user_metadata?.avatar_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { error: insertError } = await supabase
          .from('users')
          .insert(userData)

        if (insertError) {
          console.error('❌ Error creating user:', insertError)
          // Don't show error to user as this shouldn't break the flow
        } else {
          console.log('✅ User created successfully in database')
        }
      } else {
        console.log('✅ User already exists in database:', existingUser.email)
        
        // Update user info if needed
        const shouldUpdate = 
          existingUser.full_name !== (authUser.user_metadata?.full_name || authUser.user_metadata?.name) ||
          !existingUser.full_name

        if (shouldUpdate) {
          console.log('🔄 Updating user info...')
          const { error: updateError } = await supabase
            .from('users')
            .update({
              full_name: authUser.user_metadata?.full_name || 
                        authUser.user_metadata?.name || 
                        existingUser.full_name ||
                        authUser.email?.split('@')[0] || 
                        'User',
              avatar_url: authUser.user_metadata?.avatar_url,
              updated_at: new Date().toISOString()
            })
            .eq('id', authUser.id)

          if (updateError) {
            console.error('❌ Error updating user:', updateError)
          } else {
            console.log('✅ User info updated')
          }
        }
      }
    } catch (error) {
      console.error('💥 Unexpected error in ensureUserInDatabase:', error)
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      console.log('👋 Signing out...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ Sign out error:', error)
        setError('Error signing out')
      } else {
        console.log('✅ Signed out successfully')
      }
    } catch (error) {
      console.error('💥 Sign out error:', error)
      setError('Error signing out')
    } finally {
      setSigningOut(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setError('')
    setMessage('')

    console.log(`🚀 Starting ${isSignUp ? 'signup' : 'signin'}...`)

    try {
      if (isSignUp) {
        console.log('📝 Attempting signup...')
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              name: name // Backup field
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })

        console.log('📊 Signup response:', { 
          user: data.user?.email, 
          session: !!data.session, 
          error: error?.message 
        })

        if (error) {
          console.error('❌ Signup error:', error)
          setError(error.message)
        } else if (data.user) {
          if (data.session) {
            console.log('🎉 User signed up and logged in immediately')
            setMessage('Account created successfully!')
            // User will be handled by auth state change
          } else {
            console.log('📧 User created, email confirmation required')
            setMessage('Account created! Please check your email (including spam folder) for a verification link.')
          }
        }
      } else {
        console.log('🔐 Attempting signin...')
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        console.log('📊 Signin response:', { 
          user: data.user?.email, 
          session: !!data.session, 
          error: error?.message 
        })

        if (error) {
          console.error('❌ Signin error:', error)
          setError(error.message)
        } else {
          console.log('✅ Signin successful')
          // User will be handled by auth state change
        }
      }
    } catch (err: any) {
      console.error('💥 Unexpected auth error:', err)
      setError('An unexpected error occurred')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (!email) {
      setError('Please enter your email first')
      return
    }

    setAuthLoading(true)
    console.log('📧 Resending verification email...')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) {
        console.error('❌ Resend error:', error)
        setError(error.message)
      } else {
        console.log('✅ Resend successful')
        setMessage('Verification email resent! Check your inbox and spam folder.')
      }
    } catch (err: any) {
      console.error('💥 Resend error:', err)
      setError('Failed to resend email')
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

  // Loading state
  if (loading) {
    return (
      <Button disabled className="bg-gradient-to-r from-orange-400 to-pink-500">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    )
  }

  // Authenticated user state
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium hidden sm:inline">
            {user.user_metadata?.full_name || 
             user.user_metadata?.name || 
             user.email?.split("@")[0] || 
             'User'}
          </span>
        </div>
        <Button
          onClick={handleSignOut}
          disabled={signingOut}
          variant="outline"
          size="sm"
          className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
        >
          {signingOut ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing out...
            </>
          ) : (
            'Sign Out'
          )}
        </Button>
      </div>
    )
  }

  // Unauthenticated state
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
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{message}</AlertDescription>
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

          {/* Resend email button for signup */}
          {isSignUp && email && (
            <Button
              type="button"
              variant="outline"
              className="w-full border-blue-200 text-blue-600"
              onClick={handleResendEmail}
              disabled={authLoading}
            >
              📧 Resend Verification Email
            </Button>
          )}

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