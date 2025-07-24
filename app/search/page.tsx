"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapPin, Loader2 } from "lucide-react"
import Link from "next/link"
import AuthButton from "@/components/auth-button"
import SimpleMap from "@/components/simple-map"

// Mock data for now - we'll replace with real data once basic functionality works
const mockPlaygrounds = [
  {
    id: 1,
    name: "Hyde Park Playground",
    location: "Hyde Park, London",
    lat: 51.5074,
    lon: -0.1278,
    features: ["Swings", "Slides", "Climbing Frame"],
    distance: "0.5 miles",
  },
  {
    id: 2,
    name: "Regent's Park Play Area",
    location: "Regent's Park, London",
    lat: 51.5267,
    lon: -0.1533,
    features: ["Swings", "See-saw", "Sand Pit"],
    distance: "1.2 miles",
  },
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.5074, -0.1278])
  const [selectedPlayground, setSelectedPlayground] = useState<any>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      // For now, just show mock data
    }, 1000)
  }

  const handlePlaygroundClick = (playground: any) => {
    setSelectedPlayground(playground)
    setMapCenter([playground.lat, playground.lon])
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
            Find UK Playgrounds Near You
          </h2>
          <p className="text-gray-600 text-lg">Discover amazing play areas across the United Kingdom</p>
        </div>

        {/* Search Controls */}
        <Card className="bg-white/80 backdrop-blur-sm border-orange-200 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by city, postcode, or area (e.g., 'Manchester', 'SW1A 1AA')"
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 border border-orange-200">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {mockPlaygrounds.map((playground) => (
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
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{playground.name}</h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">
                          {playground.location} • {playground.distance}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {playground.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="bg-blue-100 text-blue-700">
                            {feature}
                          </Badge>
                        ))}
                      </div>

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
                  <h3 className="text-lg font-semibold mb-2">Playground Map</h3>
                  <p className="text-gray-600 text-sm">Basic map functionality - click to test</p>
                </div>
                <SimpleMap
                  center={mapCenter}
                  zoom={12}
                  height="400px"
                  onLocationSelect={(lat, lon) => {
                    console.log("Location selected:", lat, lon)
                    alert(`Location selected: ${lat.toFixed(4)}, ${lon.toFixed(4)}`)
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

