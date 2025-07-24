"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Star, Camera, Upload, Heart, Users, Shield, Accessibility } from "lucide-react"
import Link from "next/link"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const mockPlayground = {
  id: 1,
  name: "Sunshine Adventure Park",
  location: "Hyde Park, London",
  description:
    "A fantastic playground with modern equipment suitable for children of all ages. Features include climbing frames, swings, slides, and a dedicated toddler area.",
  rating: 4.8,
  totalRatings: 124,
  features: ["Swings", "Slides", "Climbing Frame", "Sand Pit", "Toddler Area", "Picnic Tables"],
  ageRange: "2-12 years",
  accessibility: "Wheelchair accessible",
  openingHours: "6:00 AM - 10:00 PM",
  facilities: ["Toilets", "Parking", "Cafe nearby"],
}

const mockRatings = [
  { category: "Safety", score: 4.9, color: "#ef4444" },
  { category: "Equipment Quality", score: 4.7, color: "#f97316" },
  { category: "Cleanliness", score: 4.8, color: "#eab308" },
  { category: "Age Appropriateness", score: 4.6, color: "#22c55e" },
  { category: "Accessibility", score: 4.5, color: "#3b82f6" },
  { category: "Overall Fun Factor", score: 4.9, color: "#8b5cf6" },
]

const chartData = mockRatings.map((rating) => ({
  category: rating.category,
  score: rating.score,
  fill: rating.color,
}))

export default function PlaygroundDetailPage() {
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false)
  const [userPhotos, setUserPhotos] = useState<string[]>([])

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // In a real app, you'd upload to your storage service
      const newPhotos = Array.from(files).map((file) => URL.createObjectURL(file))
      setUserPhotos((prev) => [...prev, ...newPhotos])
    }
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
              <Link href="/search" className="text-gray-700 hover:text-orange-500 font-medium">
                Search
              </Link>
              <Link href="/add-playground" className="text-gray-700 hover:text-orange-500 font-medium">
                Add Playground
              </Link>
              <Link href="/profile" className="text-gray-700 hover:text-orange-500 font-medium">
                My Profile
              </Link>
              <Button className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600">
                Sign In
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Playground Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                {mockPlayground.name}
              </h2>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="text-lg">{mockPlayground.location}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  <span className="text-xl font-semibold">{mockPlayground.rating}</span>
                  <span className="text-gray-500">({mockPlayground.totalRatings} reviews)</span>
                </div>
                <Badge variant="outline" className="border-green-300 text-green-700">
                  {mockPlayground.ageRange}
                </Badge>
              </div>
            </div>
            <div className="flex gap-3">
              <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600">
                    <Star className="w-4 h-4 mr-2" />
                    Add Rating
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Rate Your Experience</DialogTitle>
                    <DialogDescription>Share your experience at {mockPlayground.name}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {mockRatings.map((rating) => (
                      <div key={rating.category} className="space-y-2">
                        <Label>{rating.category}</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                            <SelectItem value="4">⭐⭐⭐⭐ Good</SelectItem>
                            <SelectItem value="3">⭐⭐⭐ Average</SelectItem>
                            <SelectItem value="2">⭐⭐ Poor</SelectItem>
                            <SelectItem value="1">⭐ Very Poor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                    <div className="space-y-2">
                      <Label htmlFor="review">Review (Optional)</Label>
                      <Textarea id="review" placeholder="Share your thoughts about this playground..." />
                    </div>
                    <Button className="w-full bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600">
                      Submit Rating
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50 bg-transparent">
                <Heart className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
          <p className="text-gray-700 text-lg leading-relaxed">{mockPlayground.description}</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 border border-orange-200">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
            <TabsTrigger value="photos">My Photos</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Features & Equipment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mockPlayground.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="bg-blue-100 text-blue-700">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overall Rating</span>
                    <span className="font-semibold">{mockPlayground.rating}/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Reviews</span>
                    <span className="font-semibold">{mockPlayground.totalRatings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age Range</span>
                    <span className="font-semibold">{mockPlayground.ageRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accessibility</span>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      <Accessibility className="w-3 h-3 mr-1" />
                      Accessible
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ratings" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
              <CardHeader>
                <CardTitle>Rating Breakdown</CardTitle>
                <CardDescription>See how this playground scores across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    score: {
                      label: "Score",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-80"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} fontSize={12} />
                      <YAxis domain={[0, 5]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {mockRatings.map((rating) => (
                <Card key={rating.category} className="bg-white/80 backdrop-blur-sm border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{rating.category}</span>
                      <span className="font-bold text-lg">{rating.score}/5.0</span>
                    </div>
                    <Progress value={rating.score * 20} className="h-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-500" />
                  My Private Photos
                </CardTitle>
                <CardDescription>
                  Upload and manage your personal photos from this playground visit. These photos are private and only
                  visible to you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-700 mb-2">Upload Your Photos</p>
                      <p className="text-gray-500">Click to select photos from your visit</p>
                    </label>
                  </div>

                  {userPhotos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {userPhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo || "/placeholder.svg"}
                            alt={`Playground photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Button size="sm" variant="destructive">
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {userPhotos.length === 0 && (
                    <div className="text-center py-8">
                      <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No photos uploaded yet</p>
                      <p className="text-sm text-gray-400">Start building your playground memory collection!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
                <CardHeader>
                  <CardTitle>Opening Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">{mockPlayground.openingHours}</p>
                  <p className="text-sm text-gray-600 mt-2">Open daily, weather permitting</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
                <CardHeader>
                  <CardTitle>Facilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockPlayground.facilities.map((facility) => (
                      <div key={facility} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{facility}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-orange-200 md:col-span-2">
                <CardHeader>
                  <CardTitle>Location & Accessibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Address</h4>
                      <p className="text-gray-600">{mockPlayground.location}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Accessibility</h4>
                      <p className="text-gray-600">{mockPlayground.accessibility}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
