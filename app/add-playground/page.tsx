"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Camera, Plus, X, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import AuthButton from "@/components/auth-button"
import SimpleMap from "@/components/simple-map"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface FormData {
  name: string
  location: string
  description: string
  ageRange: string
  accessibility: string
  openingHours: string
  lat?: number
  lon?: number
}

export default function AddPlaygroundPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    location: '',
    description: '',
    ageRange: '',
    accessibility: '',
    openingHours: ''
  })
  
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])
  const [customRatingCategories, setCustomRatingCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.5074, -0.1278])
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)

  const availableFeatures = [
    "Swings", "Slides", "Climbing Frame", "Sand Pit", "See-saw", "Monkey Bars",
    "Zip Line", "Climbing Wall", "Roundabout", "Spring Riders", "Basketball Hoop",
    "Football Goals", "Water Play", "Sensory Play", "Musical Equipment"
  ]

  const availableFacilities = [
    "Toilets", "Parking", "Cafe nearby", "Picnic Tables", "Benches",
    "Shade/Shelter", "Fenced Area", "Accessible Equipment", "Baby Changing"
  ]

  const defaultCategories = ["Safety", "Cleanliness", "Equipment Quality", "Fun Factor"]

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        router.push('/auth/signin?redirect=/add-playground')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) => 
      prev.includes(feature) 
        ? prev.filter((f) => f !== feature) 
        : [...prev, feature]
    )
  }

  const toggleFacility = (facility: string) => {
    setSelectedFacilities((prev) => 
      prev.includes(facility) 
        ? prev.filter((f) => f !== facility) 
        : [...prev, facility]
    )
  }

  const addCustomCategory = () => {
    if (newCategory.trim() && !customRatingCategories.includes(newCategory.trim())) {
      setCustomRatingCategories((prev) => [...prev, newCategory.trim()])
      setNewCategory("")
    }
  }

  const removeCustomCategory = (category: string) => {
    setCustomRatingCategories((prev) => prev.filter((c) => c !== category))
  }

  const handleLocationSelect = (lat: number, lon: number) => {
    setSelectedLocation([lat, lon])
    setFormData(prev => ({ ...prev, lat, lon }))
    
    // Reverse geocode to get address
    reverseGeocode(lat, lon)
  }

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            'User-Agent': 'PlaygroundExplorer/1.0'
          }
        }
      )
      const data = await response.json()
      
      if (data.display_name) {
        setFormData(prev => ({ 
          ...prev, 
          location: data.display_name.split(',').slice(0, 3).join(', ')
        }))
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newPhotos = Array.from(files).filter(file => file.type.startsWith('image/'))
      setPhotos(prev => [...prev, ...newPhotos].slice(0, 10)) // Limit to 10 photos
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const uploadPhotos = async (playgroundId: string): Promise<string[]> => {
    if (!user || photos.length === 0) return []

    const uploadedUrls: string[] = []

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      const fileExt = photo.name.split('.').pop()
      const fileName = `${user.id}/${playgroundId}/${Date.now()}-${i}.${fileExt}`

      try {
        const { data, error } = await supabase.storage
          .from('playground-photos')
          .upload(fileName, photo)

        if (error) {
          console.error('Photo upload error:', error)
          continue
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('playground-photos')
          .getPublicUrl(fileName)

        if (urlData?.publicUrl) {
          uploadedUrls.push(urlData.publicUrl)
        }
      } catch (error) {
        console.error('Photo upload failed:', error)
      }
    }

    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be signed in to add a playground')
      return
    }

    if (!formData.name.trim() || !formData.location.trim() || !formData.ageRange) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create playground record
      const playgroundData = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        age_range: formData.ageRange,
        accessibility: formData.accessibility || 'Unknown',
        opening_hours: formData.openingHours || 'Unknown',
        equipment: selectedFeatures,
        facilities: selectedFacilities,
        created_by: user.id,
        lat: selectedLocation?.[0] || null,
        lon: selectedLocation?.[1] || null
      }

      const { data: playground, error: playgroundError } = await supabase
        .from('playgrounds')
        .insert(playgroundData)
        .select()
        .single()

      if (playgroundError) {
        throw new Error(`Failed to create playground: ${playgroundError.message}`)
      }

      // Upload photos if any
      const photoUrls = await uploadPhotos(playground.id)

      // Save photos to user_photos table
      if (photoUrls.length > 0) {
        const photoRecords = photoUrls.map(url => ({
          user_id: user.id,
          playground_id: playground.id,
          photo_url: url,
          caption: null
        }))

        const { error: photoError } = await supabase
          .from('user_photos')
          .insert(photoRecords)

        if (photoError) {
          console.error('Failed to save photo records:', photoError)
        }
      }

      // Create custom rating categories
      if (customRatingCategories.length > 0) {
        const categoryRecords = customRatingCategories.map(name => ({
          user_id: user.id,
          name,
          description: `Custom category for ${formData.name}`
        }))

        const { error: categoryError } = await supabase
          .from('rating_categories')
          .insert(categoryRecords)

        if (categoryError) {
          console.error('Failed to create custom categories:', categoryError)
        }
      }

      setSuccess(true)
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/playground/${playground.id}`)
      }, 2000)

    } catch (error) {
      console.error('Error creating playground:', error)
      setError(error instanceof Error ? error.message : 'Failed to create playground')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">Success!</h2>
            <p className="text-gray-600 mb-4">Your playground has been added successfully.</p>
            <p className="text-sm text-gray-500">Redirecting to playground details...</p>
          </CardContent>
        </Card>
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
              <Link href="/add-playground" className="text-orange-500 font-medium">
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Add a New Playground
            </h2>
            <p className="text-gray-600 text-lg">Help other families discover amazing play areas!</p>
          </div>

          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Form Fields */}
              <div className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-800">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Playground Name *
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g., Sunshine Adventure Park"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="border-orange-200 focus:border-orange-400"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                        Location *
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="location"
                          placeholder="e.g., Hyde Park, London (or click on map)"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          className="pl-10 border-orange-200 focus:border-orange-400"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="ageRange" className="text-sm font-medium text-gray-700">
                        Age Range *
                      </Label>
                      <Select value={formData.ageRange} onValueChange={(value) => setFormData(prev => ({ ...prev, ageRange: value }))}>
                        <SelectTrigger className="border-orange-200">
                          <SelectValue placeholder="Select age range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="toddler">Toddlers (1-3 years)</SelectItem>
                          <SelectItem value="preschool">Preschool (3-6 years)</SelectItem>
                          <SelectItem value="school">School Age (6-12 years)</SelectItem>
                          <SelectItem value="mixed">Mixed Ages (2-12 years)</SelectItem>
                          <SelectItem value="teen">Teens (12+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="accessibility" className="text-sm font-medium text-gray-700">
                        Accessibility
                      </Label>
                      <Select value={formData.accessibility} onValueChange={(value) => setFormData(prev => ({ ...prev, accessibility: value }))}>
                        <SelectTrigger className="border-orange-200">
                          <SelectValue placeholder="Select accessibility level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fully-accessible">Fully Accessible</SelectItem>
                          <SelectItem value="partially-accessible">Partially Accessible</SelectItem>
                          <SelectItem value="not-accessible">Not Accessible</SelectItem>
                          <SelectItem value="unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="openingHours" className="text-sm font-medium text-gray-700">
                        Opening Hours
                      </Label>
                      <Input
                        id="openingHours"
                        placeholder="e.g., 6:00 AM - 10:00 PM or 24 hours"
                        value={formData.openingHours}
                        onChange={(e) => setFormData(prev => ({ ...prev, openingHours: e.target.value }))}
                        className="border-orange-200 focus:border-orange-400"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Tell us about this playground... What makes it special?"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="border-orange-200 focus:border-orange-400 min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Features Selection */}
                <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
                  <CardHeader>
                    <CardTitle>Playground Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableFeatures.map((feature) => (
                        <Badge
                          key={feature}
                          variant={selectedFeatures.includes(feature) ? "default" : "outline"}
                          className={`cursor-pointer text-center justify-center py-2 ${
                            selectedFeatures.includes(feature)
                              ? "bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
                              : "border-orange-300 text-orange-600 hover:bg-orange-50"
                          }`}
                          onClick={() => toggleFeature(feature)}
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Facilities Selection */}
                <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
                  <CardHeader>
                    <CardTitle>Available Facilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableFacilities.map((facility) => (
                        <Badge
                          key={facility}
                          variant={selectedFacilities.includes(facility) ? "default" : "outline"}
                          className={`cursor-pointer text-center justify-center py-2 ${
                            selectedFacilities.includes(facility)
                              ? "bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600"
                              : "border-blue-300 text-blue-600 hover:bg-blue-50"
                          }`}
                          onClick={() => toggleFacility(facility)}
                        >
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Map and Photos */}
              <div className="space-y-6">
                {/* Location Map */}
                <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
                  <CardHeader>
                    <CardTitle>Select Location on Map</CardTitle>
                    <p className="text-sm text-gray-600">Click on the map to pinpoint the exact playground location</p>
                  </CardHeader>
                  <CardContent>
                    <SimpleMap
                      center={mapCenter}
                      zoom={13}
                      height="300px"
                      onLocationSelect={handleLocationSelect}
                      playgrounds={selectedLocation ? [{
                        id: 'new-playground',
                        name: formData.name || 'New Playground',
                        lat: selectedLocation[0],
                        lon: selectedLocation[1],
                        amenities: selectedFeatures
                      }] : []}
                    />
                    {selectedLocation && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700 font-medium">
                          📍 Location selected: {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Photo Upload */}
                <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Photos (Optional)
                    </CardTitle>
                    <p className="text-sm text-gray-600">Upload photos of the playground. These will be private to your account.</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label htmlFor="photo-upload" className="cursor-pointer">
                          <Camera className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                          <p className="text-gray-600 mb-1">Click to upload photos</p>
                          <p className="text-sm text-gray-500">Up to 10 photos, max 5MB each</p>
                        </label>
                      </div>

                      {photos.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                          {photos.map((photo, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(photo)}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Custom Rating Categories */}
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
              <CardHeader>
                <CardTitle>Custom Rating Categories (Optional)</CardTitle>
                <p className="text-sm text-gray-600">
                  Default categories: {defaultCategories.join(", ")}. Add your own categories for rating this playground.
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Add custom category (e.g., Accessibility, Parking)"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="border-orange-200 focus:border-orange-400"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomCategory())}
                  />
                  <Button
                    type="button"
                    onClick={addCustomCategory}
                    className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {customRatingCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {customRatingCategories.map((category) => (
                      <Badge key={category} variant="secondary" className="bg-purple-100 text-purple-700 pr-1">
                        {category}
                        <button 
                          type="button"
                          onClick={() => removeCustomCategory(category)} 
                          className="ml-2 hover:text-purple-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
              <CardContent className="p-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-lg py-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Playground...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Add Playground
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500 text-center mt-3">
                  By adding a playground, you agree to our community guidelines and terms of service.
                </p>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}signin?redirect=/add-playground')
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        router.push('/auth/
