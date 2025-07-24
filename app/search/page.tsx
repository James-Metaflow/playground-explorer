"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Star, Filter, Camera } from "lucide-react"
import Link from "next/link"
import AuthButton from "@/components/auth-button"

const mockPlaygrounds = [
  {
    id: 1,
    name: "Sunshine Adventure Park",
    location: "Hyde Park, London",
    rating: 4.8,
    totalRatings: 124,
    distance: "0.5 miles",
    features: ["Swings", "Slides", "Climbing Frame", "Sand Pit"],
    ageRange: "2-12 years",
    hasPhotos: true,
  },
  {
    id: 2,
    name: "Rainbow Play Area",
    location: "Regent's Park, London",
    rating: 4.6,
    totalRatings: 89,
    distance: "1.2 miles",
    features: ["Swings", "See-saw", "Monkey Bars"],
    ageRange: "3-10 years",
    hasPhotos: false,
  },
  {
    id: 3,
    name: "Castle Playground",
    location: "Hampstead Heath, London",
    rating: 4.9,
    totalRatings: 156,
    distance: "2.1 miles",
    features: ["Castle Structure", "Zip Line", "Climbing Wall", "Slides"],
    ageRange: "4-14 years",
    hasPhotos: true,
  },
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("distance")
  const [filterAge, setFilterAge] = useState("all")

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
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
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

        {/* Results */}
        <div className="grid gap-6">
          {mockPlaygrounds.map((playground) => (
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
                            {playground.location} • {playground.distance}
                          </span>
                        </div>
                      </div>
                      {playground.hasPhotos && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          <Camera className="w-3 h-3 mr-1" />
                          Photos
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{playground.rating}</span>
                        <span className="text-gray-500 text-sm">({playground.totalRatings} reviews)</span>
                      </div>
                      <Badge variant="outline" className="border-green-300 text-green-700">
                        {playground.ageRange}
                      </Badge>
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
                        View Details
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

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent">
            Load More Playgrounds
          </Button>
        </div>
      </div>
    </div>
  )
}
