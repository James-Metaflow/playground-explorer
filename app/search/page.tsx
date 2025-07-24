"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapPin, Loader2, Navigation, AlertCircle, Bug } from "lucide-react"
import Link from "next/link"
import AuthButton from "@/components/auth-button"
import SimpleMap from "@/components/simple-map"
import {
  searchPlaygroundsByLocation,
  fetchPlaygroundsNearLocation,
  getCurrentLocation,
  calculateDistance,
  type PlaygroundData,
} from "@/lib/playground-api"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [playgrounds, setPlaygrounds] = useState<PlaygroundData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.5074, -0.1278]) // Default to London
  const [selectedPlayground, setSelectedPlayground] = useState<PlaygroundData | null>(null)
  const [debugMode, setDebugMode] = useState(false)

  // Add immediate logging when component loads
  useEffect(() => {
    console.log("🚀 SearchPage component loaded!")
    console.log("📍 Current user location:", userLocation)
    console.log("🗺️ Current map center:", mapCenter)
    console.log("🏰 Current playgrounds:", playgrounds)
  }, [])

  // Test function for debugging
  const runDebugTest = async () => {
    console.log("=".repeat(50))
    console.log("🐛 STARTING DEBUG TEST")
    console.log("=".repeat(50))
    setDebugMode(true)

    try {
      // Test 1: Basic API connectivity
      console.log("🧪 Test 1: Testing basic connectivity...")
      const testResponse = await fetch("https://httpbin.org/get")
      console.log("✅ Basic connectivity result:", testResponse.ok, testResponse.status)

      // Test 2: Test geocoding
      console.log("🧪 Test 2: Testing geocoding for London...")
      const geocodeTest = await fetch(
        "https://nominatim.openstreetmap.org/search?format=json&q=London&countrycodes=gb&limit=1",
        {
          headers: {
            "User-Agent": "PlaygroundExplorer/1.0 (https://playground-explorer.vercel.app)",
          },
        },
      )
      console.log("📍 Geocoding response status:", geocodeTest.status, geocodeTest.statusText)
      const geocodeData = await geocodeTest.json()
      console.log("📍 Geocoding data:", geocodeData)

      // Test 3: Test playground search
      console.log("🧪 Test 3: Testing playground search...")
      const playgroundResults = await searchPlaygroundsByLocation("London")
      console.log("🏰 Playground search results:", playgroundResults)
      console.log("🏰 Number of playgrounds found:", playgroundResults.length)

      setPlaygrounds(playgroundResults)
      if (playgroundResults.length > 0) {
        setMapCenter([playgroundResults[0].lat, playgroundResults[0].lon])
        console.log("📍 Map centered on first result:", playgroundResults[0].lat, playgroundResults[0].lon)
      }

      console.log("✅ DEBUG TEST COMPLETED SUCCESSFULLY!")
    } catch (error) {
      console.error("❌ DEBUG TEST FAILED:", error)
      setError(`Debug test failed: ${error}`)
    }

    console.log("=".repeat(50))
    setDebugMode(false)
  }

  // Get user's location on component mount
  useEffect(() => {
    console.log("🚀 SearchPage component mounted")

    getCurrentLocation()
      .then(({ lat, lon }) => {
        console.log("✅ Got user location:", lat, lon)
        setUserLocation([lat, lon])
        setMapCenter([lat, lon])
        // Automatically search for nearby playgrounds
        handleNearbySearch(lat, lon)
      })
      .catch((error) => {
        console.log("⚠️ Could not get user location:", error)
        // Default to London and search there
        console.log("🔄 Falling back to London search...")
        handleLocationSearch("London, UK")
      })
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      console.log("❌ Empty search query")
      return
    }

    console.log(`🔍 Starting search for: "${searchQuery}"`)
    setLoading(true)
    setError(null)

    try {
      const results = await searchPlaygroundsByLocation(searchQuery)
      console.log("✅ Search completed, results:", results)

      setPlaygrounds(results)

      if (results.length > 0) {
        // Center map on first result
        setMapCenter([results[0].lat, results[0].lon])
        console.log("📍 Map centered on:", results[0].lat, results[0].lon)
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

  const handleNearbySearch = async (lat?: number, lon?: number) => {
    const searchLat = lat || userLocation?.[0]
    const searchLon = lon || userLocation?.[1]

    if (!searchLat || !searchLon) {
      console.log("❌ No location available for nearby search")
      setError("Location not available. Please search by city or postcode.")
      return
    }

    console.log(`🔍 Starting nearby search at: ${searchLat}, ${searchLon}`)
    setLoading(true)
    setError(null)

    try {
      const results = await fetchPlaygroundsNearLocation(searchLat, searchLon, 10)
      console.log("✅ Nearby search completed, results:", results)

      setPlaygrounds(results)

      if (results.length === 0) {
        setError("No playgrounds found nearby. Try expanding your search area.")
      }
    } catch (error) {
      console.error("❌ Nearby search failed:", error)
      setError(`Failed to find nearby playgrounds: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSearch = async (location: string) => {
    console.log(`🔍 Starting location search for: "${location}"`)
    setLoading(true)
    setError(null)

    try {
      const results = await searchPlaygroundsByLocation(location)
      console.log("✅ Location search completed, results:", results)

      setPlaygrounds(results)

      if (results.length > 0) {
        setMapCenter([results[0].lat, results[0].lon])
        console.log("📍 Map centered on:", results[0].lat, results[0].lon)
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

      {/* Debug Panel - Make it more prominent */}
      <Card className="bg-yellow-50 border-2 border-yellow-300 mb-8 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <Bug className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-yellow-800 text-lg">🔧 Debug Mode</h3>
                <p className="text-yellow-700 text-sm">Test the search functionality step by step</p>
              </div>
            </div>
            <Button
              onClick={runDebugTest}
              disabled={debugMode}
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-3"
            >
              {debugMode ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Testing...
                </>
              ) : (
                <>
                  <Bug className="w-5 h-5 mr-2" />🧪 Run Debug Test
                </>
              )}
            </Button>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 font-medium mb-2">📋 Instructions:</p>
            <ol className="text-yellow-700 text-sm space-y-1 list-decimal list-inside">
              <li>Open your browser console first (Cmd + Option + I on Mac, then click Console tab)</li>
              <li>Click the "Run Debug Test" button above</li>
              <li>Watch the detailed logs in the console to see what's working/failing</li>
              <li>Try the search buttons below and check console for more logs</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Find Real UK Playgrounds
          </h2>
          <p className="text-gray-600 text-lg">
            Discover actual playgrounds across the United Kingdom using OpenStreetMap data
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
                    disabled={loading || !searchQuery.trim()}
                    className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Search
                  </Button>
                  <Button
                    onClick={() => handleNearbySearch()}
                    disabled={loading}
                    variant="outline"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Near Me
                  </Button>
                </div>
              </div>

              {/* Quick search buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => handleLocationSearch("London")}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                >
                  London
                </Button>
                <Button
                  onClick={() => handleLocationSearch("Manchester")}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                >
                  Manchester
                </Button>
                <Button
                  onClick={() => handleLocationSearch("Birmingham")}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                >
                  Birmingham
                </Button>
                <Button
                  onClick={() => handleLocationSearch("Edinburgh")}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                >
                  Edinburgh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-50 border-red-200 mb-8">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
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
                <p className="text-gray-600">Searching for real playgrounds...</p>
                <p className="text-sm text-gray-500 mt-2">Check browser console (F12) for detailed logs</p>
              </div>
            )}

            {!loading && playgrounds.length === 0 && !error && (
              <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
                <CardContent className="p-8 text-center">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Start Your Search</h3>
                  <p className="text-gray-600 mb-4">
                    Search for a UK location or use "Near Me" to find real playgrounds around you.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => handleLocationSearch("London")}
                      className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
                    >
                      Search London
                    </Button>
                    <Button
                      onClick={runDebugTest}
                      variant="outline"
                      className="border-yellow-300 text-yellow-600 hover:bg-yellow-50 bg-transparent"
                    >
                      <Bug className="w-4 h-4 mr-2" />
                      Debug Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {sortedPlaygrounds.map((playground) => (
              <Card
                key={playground.id}
                className="bg-white/80 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handlePlaygroundClick(playground)}
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
                        <Badge
                          variant="secondary"
                          className={
                            playground.id.startsWith("mock")
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }
                        >
                          {playground.id.startsWith("mock") ? "Test Data" : "Real Data"}
                        </Badge>
                      </div>

                      {playground.amenities && playground.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {playground.amenities.slice(0, 4).map((amenity, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                              {amenity}
                            </Badge>
                          ))}
                          {playground.amenities.length > 4 && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                              +{playground.amenities.length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600">
                          View on Map
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
                  <h3 className="text-xl font-bold mb-2">{selectedPlayground.name}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        {selectedPlayground.address && `${selectedPlayground.address}, `}
                        {selectedPlayground.city || "UK"}
                      </p>
                      {selectedPlayground.postcode && (
                        <p className="text-gray-600 mb-2">Postcode: {selectedPlayground.postcode}</p>
                      )}
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
                              <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600">
                      Add Rating
                    </Button>
                    <Button
                      variant="outline"
                      className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                    >
                      Save to Favorites
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




