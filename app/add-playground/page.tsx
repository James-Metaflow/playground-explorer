import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Star, Camera, Trophy, Search, Plus } from 'lucide-react'
import AuthButton from "@/components/auth-button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏰</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                PlaygroundExplorer
              </h1>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/search" className="text-gray-700 hover:text-orange-500 font-medium">
                Search
              </Link>
              <Link href="/add-playground" className="text-gray-700 hover:text-orange-500 font-medium">
                Add Playground
              </Link>
              <Link href="/profile" className="text-gray-700 hover:text-orange-500 font-medium">
                My Profile
              </Link>
              <AuthButton />
            </nav>
          </div>
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
              asChild
              size="lg"
              className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-lg px-8 py-4"
            >
              <Link href="/search">
                <Search className="w-5 h-5 mr-2" />
                Find Playgrounds
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 text-lg px-8 py-4 bg-transparent"
            >
              <Link href="/add-playground">
                <Plus className="w-5 h-5 mr-2" />
                Add a Playground
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/search">
            <Card className="bg-white/70 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow cursor-pointer">
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
          </Link>

          <Link href="/profile">
            <Card className="bg-white/70 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-green-600">Rate & Review</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Create custom rating categories and share your playground experiences
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile">
            <Card className="bg-white/70 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow cursor-pointer">
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
          </Link>

          <Link href="/search">
            <Card className="bg-white/70 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow cursor-pointer">
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
          </Link>
        </div>
      </section>

      {/* Top 5 Playgrounds Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            🏆 Top 5 Playgrounds This Month
          </h3>
          <p className="text-gray-600 text-lg">The highest-rated playgrounds loved by families across the UK</p>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((rank) => (
            <Link key={rank} href="/search">
              <Card
                className={`bg-white/80 backdrop-blur-sm border-2 hover:shadow-lg transition-all cursor-pointer ${
                  rank === 1
                    ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50"
                    : rank === 2
                      ? "border-gray-400 bg-gradient-to-br from-gray-50 to-blue-50"
                      : rank === 3
                        ? "border-orange-400 bg-gradient-to-br from-orange-50 to-pink-50"
                        : "border-orange-200"
                }`}
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
                  <CardTitle className="text-sm">
                    Adventure Park{" "}
                    {rank === 1 ? "Central" : rank === 2 ? "North" : rank === 3 ? "West" : rank === 4 ? "East" : "South"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < (6 - rank) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{(5.0 - (rank - 1) * 0.2).toFixed(1)} rating</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    London, UK
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">Ready to Start Your Playground Adventure?</h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of families discovering and sharing amazing playground experiences across the UK!
          </p>
          <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-4">
            <Link href="/search">Get Started Today</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-orange-200 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">🏰</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              PlaygroundExplorer
            </span>
          </div>
          <p className="text-gray-600">Making playground discovery fun for families across the UK</p>
        </div>
      </footer>
    </div>
  )
}