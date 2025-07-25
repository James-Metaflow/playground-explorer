"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, MapPin, Loader2, Navigation, AlertCircle, Heart, Star } from "lucide-react"
import Link from "next/link"
import AuthButton from "@/components/auth-button"
import SimpleMap from "@/components/simple-map"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import {
  searchPlaygroundsByLocation,
  fetchPlaygroundsNearLocation,
  getCurrentLocation,
  calculateDistance,
  type PlaygroundData,
} from "@/lib/playground-api"

interface DatabasePlayground {
  id: string
  name: string
  location: string
  description: string
  lat?: number
  lon?: number
  age_range: string
  accessibility: string
  opening_hours: string
  equipment: string[]
  facilities: string[]
  created_by: string
}

export default function SearchPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [playgrounds, setPlaygrounds] = useState<PlaygroundData[]>([])
  const [dbPlaygrounds, setDbPlaygrounds] = useState<DatabasePlayground[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.5074, -0.1278]) // Default to London
  const [selectedPlayground, setSelectedPlayground] = useState<PlaygroundData | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Auth state management
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserFavorites(session.user.id)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserFavorites(session.user.id)
      } else {
        setFavorites(new Set())
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load database playgrounds on mount (but don't search automatically)
  useEffect(() => {
    console.log("🚀 SearchPage component mounted")
    loadDatabasePlaygrounds()
  }, [])

  const loadDatabasePlaygrounds = async () => {
    try {
      const { data, error } = await supabase
        .from('playgrounds')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading database playgrounds:', error)
        return
      }

      setDbPlaygrounds(data || [])
      console.log('✅ Loaded database playgrounds:', data?.length || 0)
    } catch (error) {
      console.error('Error loading database playgrounds:', error)
    }
  }

  const loadUserFavorites = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('playground_id')
        .eq('user_id', userId)

      if (error) {
        console.error('Error loading favorites:', error)
        return
      }

      const favoriteIds = new Set(data?.map(f => f.playground_id) || [])
      setFavorites(favoriteIds)
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }

  const toggleFavorite = async (playgroundId: string) => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    try {
      if (favorites.has(playgroundId)) {
        // Remove favorite
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('playground_id', playgroundId)

        if (error) throw error

        setFavorites(prev => {
          const next = new Set(prev)
          next.delete(playgroundId)
          return next
        })
      } else {
        // Add favorite
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            playground_id: playgroundId
          })

        if (error) throw error

        setFavorites(prev => new Set([...prev, playgroundId]))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      console.log("❌ Empty search query")
      return
    }

    console.log(`🔍 Starting search for: "${searchQuery}"`)
    setLoading(true)
    setError(null)

    try {
      // Search both external API and database
      const [externalResults, dbResults] = await Promise.all([
        searchPlaygroundsByLocation(searchQuery),
        searchDatabasePlaygrounds(searchQuery)
      ])

      console.log("✅ External search completed:", externalResults.length, "results")
      console.log("✅ Database search completed:", dbResults.length, "results")

      // Combine and deduplicate results
      const combinedResults = [...externalResults, ...dbResults]
      setPlaygrounds(combinedResults)

      if (combinedResults.length > 0) {
        // Center map on first result
        setMapCenter([combinedResults[0].lat, combinedResults[0].lon])
        console.log("📍 Map centered on:", combinedResults[0].lat, combinedResults[0].lon)
      } else {
        setError(`No playgrounds found near "${searchQuery}". Try a different location.`)
      }
    } catch (error) {
      console.error("❌ Search failed:", error)
      setError(`Search failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const searchDatabasePlaygrounds = async (query: string): Promise<PlaygroundData[]> => {
    try {
      const { data, error } = await supabase
        .from('playgrounds')
        .select('*')
        .or(`name.ilike.%${query}%,location.ilike.%${query}%`)

      if (error) throw error

      return (data || []).map(pg => ({
        id: `db-${pg.id}`,
        name: pg.name,
        lat: pg.lat || 51.5074,
        lon: pg.lon || -0.1278,
        address: pg.location,
        city: pg.location,
        amenities: pg.equipment || [],
        surface: 'unknown',
        access: pg.accessibility,
        opening_hours: pg.opening_hours
      }))
    } catch (error) {
      console.error('Database search error:', error)
      return []
    }
  }

  const handleNearbySearch = async () => {
    // First get user location if we don't have it
    let searchLat = userLocation?.[0]
    let searchLon = userLocation?.[1]

    if (!searchLat || !searchLon) {
      console.log("🔍 Getting user location for nearby search...")
      setLocationLoading(true)
      
      try {
        const location = await getCurrentLocation()
        searchLat = location.lat
        searchLon = location.lon
        setUserLocation([searchLat, searchLon])
        setMapCenter([searchLat, searchLon])
        console.log("✅ Got user location:", searchLat, searchLon)
      } catch (error) {
        console.log("❌ Could not get user location:", error)
        setError("Could not access your location. Please search by city or postcode instead.")
        setLocationLoading(false)
        return
      } finally {
        setLocationLoading(false)
      }
    }

    console.log(`🔍 Starting nearby search at: ${searchLat}, ${searchLon}`)
    setLoading(true)
    setError(null)

    try {
      const [externalResults, dbResults] = await Promise.all([
        fetchPlaygroundsNearLocation(searchLat, searchLon, 10),
        getNearbyDatabasePlaygrounds(searchLat, searchLon)
      ])

      console.log("✅ Nearby search completed - External:", externalResults.length, "Database:", dbResults.length)

      const combinedResults = [...externalResults, ...dbResults]
      setPlaygrounds(combinedResults)

      if (combinedResults.length === 0) {
        setError("No playgrounds found nearby. Try expanding your search area or search by city name.")
      }
    } catch (error) {
      console.error("❌ Nearby search failed:", error)
      setError(`Failed to find nearby playgrounds: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const getNearbyDatabasePlaygrounds = async (lat: number, lon: number): Promise<PlaygroundData[]> => {
    // For simplicity, return all database playgrounds
    // In a real app, you'd implement proper geospatial queries
    return dbPlaygrounds.map(pg => ({
      id: `db-${pg.id}`,
      name: pg.name,
      lat: pg.lat || lat + (Math.random() - 0.5) * 0.1,
      lon: pg.lon || lon + (Math.random() - 0.5) * 0.1,
      address: pg.location,
      city: pg.location,
      amenities: pg.equipment || [],
      surface: 'unknown',
      access: pg.accessibility,
      opening_hours: pg.opening_hours
    }))
  }

  const handleLocationSearch = async (location: string) => {
    console.log(`🔍 Starting location search for: "${location}"`)
    setLoading(true)
    setError(null)
    setSearchQuery(location) // Update search input

    try {
      const [externalResults, dbResults] = await Promise.all([
        searchPlaygroundsByLocation(location),
        searchDatabasePlaygrounds(location)
      ])

      console.log("✅ Location search completed - External:", externalResults.length, "Database:", dbResults.length)

      const combinedResults = [...externalResults, ...dbResults]
      setPlaygrounds(combinedResults)

      if (combinedResults.length > 0) {
        setMapCenter([combinedResults[0].lat, combinedResults[0].lon])
        console.log("📍 Map centered on:", combinedResults[0].lat, combinedResults[0].lon)
      } else {
        setError(`No playgrounds found in ${location}.`)
      }
    } catch (error) {
      console.error("❌ Location search failed:", error)
      setError(`Location search failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePlaygroundClick = (playground: PlaygroundData) => {
    console.log("🏰 Playground clicked:", playground)
    setSelectedPlayground(playground)
    setMapCenter([playground.lat, playground.lon])
  }

  const handleViewDetails = (playground: PlaygroundData) => {
    router.push(`/playground/${playground.id}`)
  }

  const handleAddRating = (playground: PlaygroundData) => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
    router.push(`/playground/${playground.id}?tab=rating`)
  }

  // Sort playgrounds by distance if user location is available
  const sortedPlaygrounds = [...playgrounds].sort((a, b) => {
    if (!userLocation) return 0
    const distA = calculateDistance(userLocation[0], userLocation[1], a.lat, a.lon)
    const distB = calculateDistance(userLocation[0], userLocation[1], b.lat, b.lon)
    return distA - distB
  })

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
              <Link href="/add-playground" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                Add Playground
              </Link>
              {user && (
                <Link href="/profile" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                  My Profile
                </Link>
              )}
              <AuthButton />
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Find Amazing Playgrounds
          </h2>
          <p className="text-gray-600 text-lg">
            Discover real playgrounds across the UK using our comprehensive database and OpenStreetMap
          </p>
        </div>

        {/* Search Controls */}
        <Card className="bg-white/80 backdrop-blur-sm border-orange-200 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by city, postcode, or area (e.g., 'Manchester', 'SW1A 1AA', 'Camden')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 border-orange-200 focus:border-orange-400"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSearch}
                    disabled={loading || locationLoading || !searchQuery.trim()}
                    className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Search
                  </Button>
                  <Button
                    onClick={handleNearbySearch}
                    disabled={loading || locationLoading}
                    variant="outline"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                  >
                    {locationLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Navigation className="w-4 h-4 mr-2" />
                    )}
                    Near Me
                  </Button>
                </div>
              </div>

              {/* Quick search buttons */}
              <div className="flex gap-2 flex-wrap">
                {['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Cardiff', 'Belfast'].map(city => (
                  <Button
                    key={city}
                    onClick={() => handleLocationSearch(city)}
                    disabled={loading || locationLoading}
                    variant="outline"
                    size="sm"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                  >
                    {city}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert className="mb-8" variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 border border-orange-200">
            <TabsTrigger value="list">List View ({playgrounds.length})</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {loading && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
                <p className="text-gray-600">Searching for playgrounds...</p>
                <p className="text-sm text-gray-500 mt-2">Checking both our database and OpenStreetMap</p>
              </div>
            )}

            {!loading && playgrounds.length === 0 && !error && (
              <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
                <CardContent className="p-8 text-center">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Start Your Search</h3>
                  <p className="text-gray-600 mb-4">
                    Enter a UK location in the search box above or use "Near Me" to find playgrounds around you.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => handleLocationSearch("London")}
                      className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
                    >
                      Search London
                    </Button>
                    <Button
                      onClick={() => router.push('/add-playground')}
                      variant="outline"
                      className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                    >
                      Add a Playground
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {sortedPlaygrounds.map((playground) => (
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
                            <span className="text-sm">
                              {playground.address && `${playground.address}, `}
                              {playground.city || "UK"}
                              {userLocation && (
                                <span className="ml-2 text-orange-600 font-medium">
                                  •{" "}
                                  {calculateDistance(
                                    userLocation[0],
                                    userLocation[1],
                                    playground.lat,
                                    playground.lon,
                                  ).toFixed(1)}
                                  km away
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(playground.id)
                            }}
                            className={`${
                              favorites.has(playground.id) 
                                ? 'text-pink-600 hover:text-pink-700' 
                                : 'text-gray-400 hover:text-pink-600'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${favorites.has(playground.id) ? 'fill-current' : ''}`} />
                          </Button>
                          <Badge
                            variant="secondary"
                            className={
                              playground.id.startsWith("mock") || playground.id.startsWith("db-")
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }
                          >
                            {playground.id.startsWith("db-") ? "User Added" : 
                             playground.id.startsWith("mock") ? "Test Data" : "OpenStreetMap"}
                          </Badge>
                        </div>
                      </div>

                      {playground.amenities && playground.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {playground.amenities.slice(0, 4).map((amenity, index) => (
                            <Badge key={index} variant="outline" className="border-blue-300 text-blue-700">
                              {amenity}
                            </Badge>
                          ))}
                          {playground.amenities.length > 4 && (
                            <Badge variant="outline" className="border-gray-300 text-gray-600">
                              +{playground.amenities.length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button 
                          onClick={() => handleViewDetails(playground)}
                          className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={() => handlePlaygroundClick(playground)}
                          variant="outline"
                          className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                        >
                          View on Map
                        </Button>
                        <Button
                          onClick={() => handleAddRating(playground)}
                          variant="outline"
                          className="border-green-300 text-green-600 hover:bg-green-50 bg-transparent"
                        >
                          <Star className="w-4 h-4 mr-1" />
                          Rate
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {playgrounds.length} playground{playgrounds.length !== 1 ? "s" : ""} found
                  </h3>
                  <p className="text-gray-600 text-sm">Click on playground markers to see details</p>
                </div>
                <SimpleMap
                  center={mapCenter}
                  zoom={12}
                  height="500px"
                  playgrounds={playgrounds}
                  onPlaygroundClick={handlePlaygroundClick}
                />
              </CardContent>
            </Card>

            {selectedPlayground && (
              <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{selectedPlayground.name}</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            {selectedPlayground.address && `${selectedPlayground.address}, `}
                            {selectedPlayground.city || "UK"}
                          </p>
                          {selectedPlayground.opening_hours && (
                            <p className="text-gray-600 mb-2">Hours: {selectedPlayground.opening_hours}</p>
                          )}
                          {userLocation && (
                            <p className="text-orange-600 font-medium mb-2">
                              Distance:{" "}
                              {calculateDistance(
                                userLocation[0],
                                userLocation[1],
                                selectedPlayground.lat,
                                selectedPlayground.lon,
                              ).toFixed(1)}
                              km away
                            </p>
                          )}
                        </div>
                        <div>
                          {selectedPlayground.amenities && selectedPlayground.amenities.length > 0 && (
                            <div>
                              <p className="font-medium mb-2">Equipment:</p>
                              <div className="flex flex-wrap gap-1">
                                {selectedPlayground.amenities.map((amenity, index) => (
                                  <Badge key={index} variant="outline" className="border-blue-300 text-blue-700">
                                    {amenity}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(selectedPlayground.id)}
                      className={`${
                        favorites.has(selectedPlayground.id) 
                          ? 'text-pink-600 hover:text-pink-700' 
                          : 'text-gray-400 hover:text-pink-600'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${favorites.has(selectedPlayground.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleViewDetails(selectedPlayground)}
                      className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
                    >
                      View Full Details
                    </Button>
                    <Button
                      onClick={() => handleAddRating(selectedPlayground)}
                      variant="outline"
                      className="border-green-300 text-green-600 hover:bg-green-50 bg-transparent"
                    >
                      <Star className="w-4 h-4 mr-1" />
                      Add Rating
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}





