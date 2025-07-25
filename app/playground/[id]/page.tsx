"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
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
import { MapPin, Star, Camera, Upload, Heart, Users, Shield, Accessibility, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AuthButton from "@/components/auth-button"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface PlaygroundDetails {
  id: string
  name: string
  location: string
  description: string
  lat?: number
  lon?: number
  age_range?: string
  accessibility?: string
  opening_hours?: string
  equipment?: string[]
  facilities?: string[]
  created_by?: string
  rating?: number
  totalRatings?: number
  source: 'database' | 'google' | 'osm' | 'mock'
}

interface Rating {
  category: string
  score: number
  color: string
}

const defaultRatings: Rating[] = [
  { category: "Safety", score: 0, color: "#ef4444" },
  { category: "Equipment Quality", score: 0, color: "#f97316" },
  { category: "Cleanliness", score: 0, color: "#eab308" },
  { category: "Age Appropriateness", score: 0, color: "#22c55e" },
  { category: "Accessibility", score: 0, color: "#3b82f6" },
  { category: "Overall Fun Factor", score: 0, color: "#8b5cf6" },
]

export default function PlaygroundDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const playgroundId = params.id as string
  
  const [user, setUser] = useState<User | null>(null)
  const [playground, setPlayground] = useState<PlaygroundDetails | null>(null)
  const [ratings, setRatings] = useState<Rating[]>(defaultRatings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false)
  const [userPhotos, setUserPhotos] = useState<string[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [userRatings, setUserRatings] = useState<{[key: string]: number}>({})
  const [userReview, setUserReview] = useState("")

  // Check if we should open rating tab automatically
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'rating') {
      setIsRatingDialogOpen(true)
    }
  }, [searchParams])

  // Auth state management
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load playground data
  useEffect(() => {
    if (playgroundId) {
      loadPlaygroundData(playgroundId)
    }
  }, [playgroundId])

  // Load user-specific data when user is available
  useEffect(() => {
    if (user && playground) {
      loadUserFavoriteStatus()
      loadUserPhotos()
    }
  }, [user, playground])

  const loadPlaygroundData = async (id: string) => {
    console.log(`🔍 Loading playground data for ID: ${id}`)
    setLoading(true)
    setError(null)

    try {
      // First try to load from database
      const { data: dbData, error: dbError } = await supabase
        .from('playgrounds')
        .select('*')
        .eq('id', id)
        .single()

      if (dbData && !dbError) {
        console.log('✅ Found playground in database:', dbData)
        
        setPlayground({
          id: dbData.id,
          name: dbData.name,
          location: dbData.location,
          description: dbData.description || 'No description available.',
          lat: dbData.lat,
          lon: dbData.lon,
          age_range: dbData.age_range,
          accessibility: dbData.accessibility,
          opening_hours: dbData.opening_hours,
          equipment: dbData.equipment || [],
          facilities: dbData.facilities || [],
          created_by: dbData.created_by,
          source: 'database'
        })

        // Load ratings for this playground
        await loadPlaygroundRatings(id)
      } else {
        console.log('⚠️ Playground not found in database, trying Google Places...')
        
        // If not in database, try to fetch from Google Places API
        await loadFromGooglePlaces(id)
      }

    } catch (error) {
      console.error('❌ Error loading playground:', error)
      setError('Failed to load playground details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadFromGooglePlaces = async (placeId: string) => {
    try {
      // Call your backend API to get place details
      const response = await fetch(`/api/places/details?place_id=${placeId}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.result) {
          const place = data.result
          setPlayground({
            id: placeId,
            name: place.name || 'Unknown Playground',
            location: place.formatted_address || place.vicinity || 'Unknown Location',
            description: place.editorial_summary?.overview || 'A playground found via Google Places.',
            lat: place.geometry?.location?.lat,
            lon: place.geometry?.location?.lng,
            age_range: 'All ages',
            accessibility: place.wheelchair_accessible_entrance ? 'Wheelchair accessible' : 'Unknown',
            opening_hours: place.opening_hours?.weekday_text?.join(', ') || 'Unknown',
            equipment: extractEquipmentFromPlace(place),
            facilities: extractFacilitiesFromPlace(place),
            rating: place.rating,
            totalRatings: place.user_ratings_total,
            source: 'google'
          })
        } else {
          throw new Error('Place not found')
        }
      } else {
        throw new Error('Failed to fetch from Google Places')
      }
    } catch (error) {
      console.error('❌ Failed to load from Google Places:', error)
      
      // Fall back to mock data with the provided ID
      setPlayground({
        id: playgroundId,
        name: `Playground ${playgroundId}`,
        location: 'Location not available',
        description: 'This playground data is not available in our database. Please add more information by rating and reviewing it!',
        age_range: 'Unknown',
        accessibility: 'Unknown',
        opening_hours: 'Unknown',
        equipment: [],
        facilities: [],
        source: 'mock'
      })
    }
  }

  const extractEquipmentFromPlace = (place: any): string[] => {
    const equipment: string[] = []
    
    // Try to extract from place types or description
    const types = place.types || []
    const name = (place.name || '').toLowerCase()
    
    if (name.includes('swing')) equipment.push('Swings')
    if (name.includes('slide')) equipment.push('Slides')
    if (name.includes('climb')) equipment.push('Climbing Equipment')
    if (name.includes('sand')) equipment.push('Sand Pit')
    if (types.includes('park')) equipment.push('Park Setting')
    
    return equipment.length > 0 ? equipment : ['Playground Equipment']
  }

  const extractFacilitiesFromPlace = (place: any): string[] => {
    const facilities: string[] = []
    
    if (place.wheelchair_accessible_entrance) facilities.push('Wheelchair Accessible')
    if (place.restroom) facilities.push('Toilets')
    if (place.types?.includes('parking')) facilities.push('Parking')
    
    return facilities
  }

  const loadPlaygroundRatings = async (playgroundId: string) => {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('category, score')
        .eq('playground_id', playgroundId)

      if (error) {
        console.error('Error loading ratings:', error)
        return
      }

      // Calculate average ratings by category
      const ratingMap: {[key: string]: number[]} = {}
      
      data?.forEach(rating => {
        if (!ratingMap[rating.category]) {
          ratingMap[rating.category] = []
        }
        ratingMap[rating.category].push(rating.score)
      })

      // Update ratings with averages
      const updatedRatings = defaultRatings.map(defaultRating => {
        const scores = ratingMap[defaultRating.category] || []
        const average = scores.length > 0 
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
          : 0
        
        return {
          ...defaultRating,
          score: average
        }
      })

      setRatings(updatedRatings)

      // Calculate overall rating
      const overallScore = updatedRatings.reduce((sum, rating) => sum + rating.score, 0) / updatedRatings.length
      const totalRatings = Object.values(ratingMap).reduce((sum, scores) => sum + scores.length, 0)

      if (playground) {
        setPlayground({
          ...playground,
          rating: overallScore > 0 ? overallScore : undefined,
          totalRatings: totalRatings > 0 ? totalRatings : undefined
        })
      }

    } catch (error) {
      console.error('Error loading playground ratings:', error)
    }
  }

  const loadUserFavoriteStatus = async () => {
    if (!user || !playground) return

    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('playground_id', playground.id)
        .single()

      setIsFavorite(!error && !!data)
    } catch (error) {
      console.error('Error loading favorite status:', error)
    }
  }

  const loadUserPhotos = async () => {
    if (!user || !playground) return

    try {
      const { data, error } = await supabase
        .from('user_photos')
        .select('photo_url')
        .eq('user_id', user.id)
        .eq('playground_id', playground.id)

      if (data && !error) {
        setUserPhotos(data.map(photo => photo.photo_url))
      }
    } catch (error) {
      console.error('Error loading user photos:', error)
    }
  }

  const toggleFavorite = async () => {
    if (!user || !playground) {
      router.push('/auth/signin')
      return
    }

    try {
      if (isFavorite) {
        // Remove favorite
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('playground_id', playground.id)

        if (!error) {
          setIsFavorite(false)
        }
      } else {
        // Add favorite
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            playground_id: playground.id
          })

        if (!error) {
          setIsFavorite(true)
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleRatingSubmit = async () => {
    if (!user || !playground) {
      router.push('/auth/signin')
      return
    }

    try {
      // Submit ratings for each category
      const ratingPromises = Object.entries(userRatings).map(([category, score]) => 
        supabase
          .from('ratings')
          .upsert({
            user_id: user.id,
            playground_id: playground.id,
            category,
            score,
            review: userReview || null
          })
      )

      await Promise.all(ratingPromises)

      // Reload ratings
      await loadPlaygroundRatings(playground.id)
      
      setIsRatingDialogOpen(false)
      setUserRatings({})
      setUserReview("")

      alert('Thank you for your rating!')
    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('Failed to submit rating. Please try again.')
    }
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !playground) {
      router.push('/auth/signin')
      return
    }

    const files = event.target.files
    if (!files) return

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${playground.id}/${Date.now()}.${fileExt}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('playground-photos')
          .upload(fileName, file)

        if (error) throw error

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('playground-photos')
          .getPublicUrl(fileName)

        if (urlData?.publicUrl) {
          // Save to database
          await supabase
            .from('user_photos')
            .insert({
              user_id: user.id,
              playground_id: playground.id,
              photo_url: urlData.publicUrl
            })

          return urlData.publicUrl
        }
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const validUrls = uploadedUrls.filter(url => url) as string[]
      
      setUserPhotos(prev => [...prev, ...validUrls])
    } catch (error) {
      console.error('Error uploading photos:', error)
      alert('Failed to upload photos. Please try again.')
    }
  }

  const chartData = ratings.map((rating) => ({
    category: rating.category,
    score: rating.score,
    fill: rating.color,
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
            <p>Loading playground details...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-blue-100">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => router.push('/search')}>
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!playground) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-blue-100">
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>Playground not found.</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => router.push('/search')}>
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    )
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
              <Link href="/search" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
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
        {/* Playground Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                {playground.name}
              </h2>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="text-lg">{playground.location}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  <span className="text-xl font-semibold">
                    {playground.rating ? playground.rating.toFixed(1) : 'Not rated'}
                  </span>
                  {playground.totalRatings && (
                    <span className="text-gray-500">({playground.totalRatings} reviews)</span>
                  )}
                </div>
                {playground.age_range && (
                  <Badge variant="outline" className="border-green-300 text-green-700">
                    {playground.age_range}
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className={
                    playground.source === 'google'
                      ? "bg-blue-100 text-blue-700"
                      : playground.source === 'database'
                      ? "bg-green-100 text-green-700"
                      : playground.source === 'osm'
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-700"
                  }
                >
                  {playground.source === 'google' ? 'Google Places' :
                   playground.source === 'database' ? 'User Added' :
                   playground.source === 'osm' ? 'OpenStreetMap' : 'Limited Data'}
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
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Rate Your Experience</DialogTitle>
                    <DialogDescription>Share your experience at {playground.name}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {defaultRatings.map((rating) => (
                      <div key={rating.category} className="space-y-2">
                        <Label>{rating.category}</Label>
                        <Select 
                          value={userRatings[rating.category]?.toString() || ""}
                          onValueChange={(value) => setUserRatings(prev => ({
                            ...prev,
                            [rating.category]: parseInt(value)
                          }))}
                        >
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
                      <Textarea 
                        id="review" 
                        placeholder="Share your thoughts about this playground..." 
                        value={userReview}
                        onChange={(e) => setUserReview(e.target.value)}
                      />
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
                      onClick={handleRatingSubmit}
                      disabled={Object.keys(userRatings).length === 0}
                    >
                      Submit Rating
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button 
                variant="outline" 
                className={`border-pink-300 hover:bg-pink-50 bg-transparent ${
                  isFavorite ? 'text-pink-600' : 'text-pink-400'
                }`}
                onClick={toggleFavorite}
              >
                <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>
          <p className="text-gray-700 text-lg leading-relaxed">{playground.description}</p>
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
                    {playground.equipment && playground.equipment.length > 0 ? (
                      playground.equipment.map((feature) => (
                        <Badge key={feature} variant="secondary" className="bg-blue-100 text-blue-700">
                          {feature}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500">No equipment information available</p>
                    )}
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
                    <span className="font-semibold">
                      {playground.rating ? `${playground.rating.toFixed(1)}/5.0` : 'Not rated'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Reviews</span>
                    <span className="font-semibold">{playground.totalRatings || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age Range</span>
                    <span className="font-semibold">{playground.age_range || 'All ages'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accessibility</span>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      <Accessibility className="w-3 h-3 mr-1" />
                      {playground.accessibility || 'Unknown'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
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
                {user ? (
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
                              src={photo}
                              alt={`Playground photo ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={async () => {
                                  // Remove photo logic
                                  try {
                                    await supabase
                                      .from('user_photos')
                                      .delete()
                                      .eq('user_id', user.id)
                                      .eq('photo_url', photo)
                                    
                                    setUserPhotos(prev => prev.filter((_, i) => i !== index))
                                  } catch (error) {
                                    console.error('Error removing photo:', error)
                                  }
                                }}
                              >
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
                ) : (
                  <div className="text-center py-8">
                    <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Sign in to upload and manage your playground photos</p>
                    <Button 
                      onClick={() => router.push('/auth/signin')}
                      className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
                    >
                      Sign In to Upload Photos
                    </Button>
                  </div>
                )}
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
                  <p className="text-lg font-medium">{playground.opening_hours || 'Hours not available'}</p>
                  {playground.opening_hours && playground.opening_hours !== 'Unknown' && (
                    <p className="text-sm text-gray-600 mt-2">Open daily, weather permitting</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
                <CardHeader>
                  <CardTitle>Facilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {playground.facilities && playground.facilities.length > 0 ? (
                      playground.facilities.map((facility) => (
                        <div key={facility} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{facility}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No facility information available</p>
                    )}
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
                      <p className="text-gray-600">{playground.location}</p>
                      {playground.lat && playground.lon && (
                        <p className="text-sm text-gray-500 mt-1">
                          Coordinates: {playground.lat.toFixed(4)}, {playground.lon.toFixed(4)}
                        </p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Accessibility</h4>
                      <p className="text-gray-600">{playground.accessibility || 'Accessibility information not available'}</p>
                    </div>
                  </div>
                  {playground.source === 'mock' && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Help improve this listing:</strong> This playground has limited information. 
                        You can help by adding ratings, photos, and reviews to make it more useful for other families!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Back to Search Button */}
        <div className="mt-8 text-center">
          <Button 
            onClick={() => router.push('/search')}
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
          >
            ← Back to Search Results
          </Button>
        </div>
      </div>
    </div>
  )
}>

          <TabsContent value="ratings" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
              <CardHeader>
                <CardTitle>Rating Breakdown</CardTitle>
                <CardDescription>See how this playground scores across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                {ratings.some(r => r.score > 0) ? (
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
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No ratings yet</p>
                    <p className="text-sm text-gray-400">Be the first to rate this playground!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {ratings.map((rating) => (
                <Card key={rating.category} className="bg-white/80 backdrop-blur-sm border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{rating.category}</span>
                      <span className="font-bold text-lg">
                        {rating.score > 0 ? `${rating.score.toFixed(1)}/5.0` : 'Not rated'}
                      </span>
                    </div>
                    <Progress value={rating.score * 20} className="h-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent