"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Star, Filter, Camera, Loader2 } from 'lucide-react'
import Link from "next/link"
import AuthButton from "@/components/auth-button"
import { supabase } from "@/lib/supabase"

type Playground = {
  id: string
  name: string
  location: string
  description: string | null
  age_range: string | null
  equipment: string[] | null
  facilities: string[] | null
  created_at: string
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [filterAge, setFilterAge] = useState("all")
  const [playgrounds, setPlaygrounds] = useState<Playground[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredPlaygrounds, setFilteredPlaygrounds] = useState<Playground[]>([])

  // Fetch playgrounds from database
  useEffect(() => {
    async function fetchPlaygrounds() {
      try {
        const { data, error } = await supabase
          .from('playgrounds')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching playgrounds:', error)
        } else {
          setPlaygrounds(data || [])
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlaygrounds()
  }, [])

  // Filter and sort playgrounds
  useEffect(() => {
    let filtered = [...playgrounds]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (playground) =>
          playground.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          playground.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply age filter
    if (filterAge !== "all") {
      filtered = filtered.filter((playground) => {
        if (!playground.age_range) return false
        const ageRange = playground.age_range.toLowerCase()
        
        switch (filterAge) {
          case "toddler":
            return ageRange.includes("1-3") || ageRange.includes("0-3")
          case "preschool":
            return ageRange.includes("3-6") || ageRange.includes("2-6")
          case "school":
            return ageRange.includes("6-12") || ageRange.includes("5-12")
          case "teen":
            return ageRange.includes("12") || ageRange.includes("14")
          default:
            return true
        }
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "location":
          return a.location.localeCompare(b.location)
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

    setFilteredPlaygrounds(filtered)
  }, [playgrounds, searchQuery, filterAge, sortBy])

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
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/search" className="text-orange-500 font-medium">
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

      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Find Your Perfect Playground
          </h2>
          <p className="text-gray-600 text-lg">Discover amazing play areas for your little adventurers</p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-orange-200 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by playground name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-orange-200 focus:border-orange-400"
                />
              </div>
              <div className="flex gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 border-orange-200">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterAge} onValueChange={setFilterAge}>
                  <SelectTrigger className="w-40 border-orange-200">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Age Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="toddler">Toddlers (1-3)</SelectItem>
                    <SelectItem value="preschool">Preschool (3-6)</SelectItem>
                    <SelectItem value="school">School Age (6-12)</SelectItem>
                    <SelectItem value="teen">Teens (12+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-2 text-gray-600">Loading playgrounds...</span>
          </div>
        )}

        {/* Results */}
        {!loading && (
          <>
            <div className="mb-4">
              <p className="text-gray-600">
                Found {filteredPlaygrounds.length} playground{filteredPlaygrounds.length !== 1 ? 's' : ''}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>

            {filteredPlaygrounds.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">🏰</div>
                  <h3 className="text-xl font-semibold mb-2">No playgrounds found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery
                      ? `No playgrounds match your search for "${searchQuery}"`
                      : "No playgrounds available yet"}
                  </p>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
                  >
                    <Link href="/add-playground">Add the First Playground</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredPlaygrounds.map((playground) => (
                  <Card
                    key={playground.id}
                    className="bg-white/80 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-48 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-lg flex items-center justify-center">
                          <span className="text-4xl">🏰</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 mb-1">{playground.name}</h3>
                              <div className="flex items-center text-gray-600 mb-2">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span className="text-sm">{playground.location}</span>
                              </div>
                            </div>
                          </div>

                          {playground.age_range && (
                            <div className="flex items-center gap-4 mb-3">
                              <Badge variant="outline" className="border-green-300 text-green-700">
                                {playground.age_range}
                              </Badge>
                            </div>
                          )}

                          {playground.equipment && playground.equipment.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {playground.equipment.slice(0, 4).map((equipment) => (
                                <Badge key={equipment} variant="secondary" className="bg-blue-100 text-blue-700">
                                  {equipment}
                                </Badge>
                              ))}
                              {playground.equipment.length > 4 && (
                                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                  +{playground.equipment.length - 4} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {playground.description && (
                            <p className="text-gray-600 mb-4 line-clamp-2">{playground.description}</p>
                          )}

                          <div className="flex gap-3">
                            <Button
                              asChild
                              className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
                            >
                              <Link href={`/playground/${playground.id}`}>View Details</Link>
                            </Button>
                            <Button
                              variant="outline"
                              className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                            >
                              Add Rating
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Add Playground CTA */}
        {!loading && filteredPlaygrounds.length > 0 && (
          <div className="text-center mt-12">
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-2">Know of another great playground?</h3>
                <p className="text-gray-600 mb-4">Help other families discover amazing play areas!</p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
                >
                  <Link href="/add-playground">Add a Playground</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
