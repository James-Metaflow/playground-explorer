"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Star, Camera, Trophy, Search, Pencil, User, Menu, X } from "lucide-react"
import AuthButton from "@/components/auth-button"
import { supabase } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface TopPlayground {
  id: string
  name: string
  location: string
  average_rating: number
  total_ratings: number
}

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [topPlaygrounds, setTopPlaygrounds] = useState<TopPlayground[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    })

    // Load top playgrounds
    loadTopPlaygrounds()

    return () => subscription.unsubscribe()
  }, [])

  const loadTopPlaygrounds = async () => {
    try {
      // Query top-rated playgrounds from database
      const { data, error } = await supabase
        .from('playgrounds')
        .select(`
          id,
          name,
          location,
          ratings (
            score
          )
        `)
        .limit(5)

      if (error) {
        console.error('Error loading top playgrounds:', error)
        // Use mock data if database query fails
        setTopPlaygrounds(getMockTopPlaygrounds())
        return
      }

      // Calculate average ratings
      const playgroundsWithRatings = data?.map(playground => {
        const ratings = playground.ratings as any[]
        const averageRating = ratings.length > 0 
          ? ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length
          : 0
        
        return {
          id: playground.id,
          name: playground.name,
          location: playground.location,
          average_rating: averageRating,
          total_ratings: ratings.length
        }
      }) || []

      // Sort by average rating and total ratings
      const sortedPlaygrounds = playgroundsWithRatings
        .sort((a, b) => {
          if (b.average_rating !== a.average_rating) {
            return b.average_rating - a.average_rating
          }
          return b.total_ratings - a.total_ratings
        })
        .slice(0, 5)

      setTopPlaygrounds(sortedPlaygrounds.length > 0 ? sortedPlaygrounds : getMockTopPlaygrounds())
    } catch (error) {
      console.error('Error loading top playgrounds:', error)
      setTopPlaygrounds(getMockTopPlaygrounds())
    }
  }

  const getMockTopPlaygrounds = (): TopPlayground[] => [
    { id: '1', name: 'Adventure Park Central', location: 'London, UK', average_rating: 4.8, total_ratings: 124 },
    { id: '2', name: 'Adventure Park North', location: 'Manchester, UK', average_rating: 4.6, total_ratings: 98 },
    { id: '3', name: 'Adventure Park West', location: 'Bristol, UK', average_rating: 4.4, total_ratings: 87 },
    { id: '4', name: 'Adventure Park East', location: 'Norwich, UK', average_rating: 4.2, total_ratings: 76 },
    { id: '5', name: 'Adventure Park South', location: 'Brighton, UK', average_rating: 4.0, total_ratings: 65 },
  ]

  const handleSignIn = () => {
    router.push('/auth/signin')
  }

  const handleSearchClick = () => {
    router.push('/search')
  }

  // New: Rate a Playground flow goes to /search (user finds then rates)
  const handleRatePlaygroundClick = () => {
    router.push('/search?tab=rating')
  }

  const handleGetStarted = () => {
    if (!user) {
      router.push('/auth/signin')
    } else {
      router.push('/search')
    }
  }

  const handlePlaygroundClick = (playgroundId: string) => {
    router.push(`/playground/${playgroundId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏰</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                PlaygroundExplorer
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/search" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                Search
              </Link>
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors px-0"
                onClick={handleRatePlaygroundClick}
              >
                Rate a Playground
              </Button>
              {user && (
                <Link href="/profile" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                  My Profile
                </Link>
              )}
              {loading ? (
                <Button disabled>Loading...</Button>
              ) : user ? (
                <AuthButton />
              ) : (
                <Button onClick={handleSignIn} className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600">
                  Sign In
                </Button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-orange-200 pt-4">
              <div className="flex flex-col gap-3">
                <Link 
                  href="/search" 
                  className="text-gray-700 hover:text-orange-500 font-medium px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Search
                </Link>
                <button
                  className="text-gray-700 hover:text-orange-500 font-medium px-2 py-1 text-left"
                  onClick={() => {
                    handleRatePlaygroundClick()
                    setMobileMenuOpen(false)
                  }}
                >
                  Rate a Playground
                </button>
                {user && (
                  <Link 
                    href="/profile" 
                    className="text-gray-700 hover:text-orange-500 font-medium px-2 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                )}
                <div className="pt-2">
                  {user ? (
                    <AuthButton />
                  ) : (
                    <Button 
                      onClick={() => {
                        handleSignIn()
                        setMobileMenuOpen(false)
                      }} 
                      className="w-full bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Discover Amazing Playgrounds!
          </h2>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            Help other families find the perfect playground for their little adventurers. Rate, review, and share your
            playground experiences across the UK!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleSearchClick}
              className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-lg px-8 py-4"
            >
              <Search className="w-5 h-5 mr-2" />
              Find Playgrounds
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleRatePlaygroundClick}
              className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 text-lg px-8 py-4 bg-transparent"
            >
              <Pencil className="w-5 h-5 mr-2" />
              Rate a Playground
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={handleSearchClick}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-blue-600">Search & Discover</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Find amazing playgrounds near you with our easy search feature
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={handleRatePlaygroundClick}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pencil className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-green-600">Rate a Playground</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Share your playground experiences and help others choose the best spots
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => user ? router.push('/profile') : handleSignIn()}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-purple-600">Capture Memories</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Upload and keep your playground photos private in your personal collection
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={handleSearchClick}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-orange-600">Top Playgrounds</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Discover the highest-rated playgrounds and hidden gems in your area
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Top 5 Playgrounds Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            🏆 Top 5 Playgrounds This Month
          </h3>
          <p className="text-gray-600 text-lg">The highest-rated playgrounds loved by families across the UK</p>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          {topPlaygrounds.map((playground, index) => {
            const rank = index + 1
            return (
              <Card
                key={playground.id}
                className={`bg-white/80 backdrop-blur-sm border-2 hover:shadow-lg transition-all cursor-pointer ${
                  rank === 1
                    ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50"
                    : rank === 2
                      ? "border-gray-400 bg-gradient-to-br from-gray-50 to-blue-50"
                      : rank === 3
                        ? "border-orange-400 bg-gradient-to-br from-orange-50 to-pink-50"
                        : "border-orange-200"
                }`}
                onClick={() => handlePlaygroundClick(playground.id)}
              >
                <CardHeader className="text-center pb-2">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      rank === 1
                        ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                        : rank === 2
                          ? "bg-gradient-to-br from-gray-400 to-gray-600"
                          : rank === 3
                            ? "bg-gradient-to-br from-orange-400 to-red-500"
                            : "bg-gradient-to-br from-blue-400 to-purple-500"
                    }`}
                  >
                    <span className="text-white font-bold text-lg">#{rank}</span>
                  </div>
                  <CardTitle className="text-sm">{playground.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(playground.average_rating) 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    {playground.average_rating.toFixed(1)} rating
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {playground.location}
                  </p>
                  <p className="text-xs text-gray-500">
                    {playground.total_ratings} reviews
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">Ready to Start Your Playground Adventure?</h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of families discovering and sharing amazing playground experiences across the UK!
          </p>
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-4"
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-orange-200 py-8">
        <div className="container mx-auto px-4 text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">🏰</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              PlaygroundExplorer
            </span>
          </Link>
          <p className="text-gray-600 mb-4">Making playground discovery fun for families across the UK</p>
          <div className="flex justify-center gap-6 text-sm text-gray-500">
            <Link href="/about" className="hover:text-orange-500">About</Link>
            <Link href="/privacy" className="hover:text-orange-500">Privacy</Link>
            <Link href="/terms" className="hover:text-orange-500">Terms</Link>
            <Link href="/contact" className="hover:text-orange-500">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}