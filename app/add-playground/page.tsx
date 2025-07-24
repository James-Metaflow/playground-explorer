"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Plus, Upload, Check } from "lucide-react"
import Link from "next/link"

const equipmentOptions = [
  "Swings",
  "Slides",
  "Climbing Frame",
  "See-saw",
  "Monkey Bars",
  "Sand Pit",
  "Spring Riders",
  "Zip Line",
  "Climbing Wall",
  "Roundabout",
  "Balance Beam",
  "Toddler Area",
  "Basketball Hoop",
  "Football Goals",
]

const facilityOptions = [
  "Toilets",
  "Parking",
  "Cafe nearby",
  "Picnic Tables",
  "Benches",
  "Shade/Shelter",
  "Water Fountain",
  "Bike Racks",
  "Dog Area",
]

export default function AddPlaygroundPage() {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    ageRange: "",
    equipment: [] as string[],
    facilities: [] as string[],
    accessibility: "",
    openingHours: "",
    photos: [] as File[],
  })

  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      equipment: checked ? [...prev.equipment, equipment] : prev.equipment.filter((e) => e !== equipment),
    }))
  }

  const handleFacilityChange = (facility: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      facilities: checked ? [...prev.facilities, facility] : prev.facilities.filter((f) => f !== facility),
    }))
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...Array.from(files)],
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you'd submit to your backend
    console.log("Submitting playground:", formData)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <Card className="max-w-md bg-white/80 backdrop-blur-sm border-orange-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Playground Added Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for contributing to our playground community. Your submission is being reviewed and will be
              available soon.
            </p>
            <div className="flex gap-3">
              <Button
                asChild
                className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
              >
                <Link href="/search">Browse Playgrounds</Link>
              </Button>
              <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                Add Another
              </Button>
            </div>
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
              <Link href="/search" className="text-gray-700 hover:text-orange-500 font-medium">
                Search
              </Link>
              <Link href="/add-playground" className="text-orange-500 font-medium">
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
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Add a New Playground
            </h2>
            <p className="text-gray-600 text-lg">
              Help other families discover amazing play areas by sharing your finds!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  Basic Information
                </CardTitle>
                <CardDescription>Tell us about this playground</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Playground Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Sunshine Adventure Park"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    className="border-orange-200 focus:border-orange-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Hyde Park, London"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    required
                    className="border-orange-200 focus:border-orange-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what makes this playground special..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="border-orange-200 focus:border-orange-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageRange">Age Range</Label>
                  <Select
                    value={formData.ageRange}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, ageRange: value }))}
                  >
                    <SelectTrigger className="border-orange-200">
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-3 years">0-3 years (Toddlers)</SelectItem>
                      <SelectItem value="2-6 years">2-6 years (Preschool)</SelectItem>
                      <SelectItem value="5-12 years">5-12 years (School Age)</SelectItem>
                      <SelectItem value="2-12 years">2-12 years (Mixed Ages)</SelectItem>
                      <SelectItem value="All ages">All ages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Equipment */}
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
              <CardHeader>
                <CardTitle>Equipment & Features</CardTitle>
                <CardDescription>What equipment is available at this playground?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {equipmentOptions.map((equipment) => (
                    <div key={equipment} className="flex items-center space-x-2">
                      <Checkbox
                        id={equipment}
                        checked={formData.equipment.includes(equipment)}
                        onCheckedChange={(checked) => handleEquipmentChange(equipment, checked as boolean)}
                      />
                      <Label htmlFor={equipment} className="text-sm">
                        {equipment}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Facilities */}
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
              <CardHeader>
                <CardTitle>Facilities & Amenities</CardTitle>
                <CardDescription>What facilities are available nearby?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {facilityOptions.map((facility) => (
                    <div key={facility} className="flex items-center space-x-2">
                      <Checkbox
                        id={facility}
                        checked={formData.facilities.includes(facility)}
                        onCheckedChange={(checked) => handleFacilityChange(facility, checked as boolean)}
                      />
                      <Label htmlFor={facility} className="text-sm">
                        {facility}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
                <CardDescription>Help families plan their visit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accessibility">Accessibility Information</Label>
                  <Select
                    value={formData.accessibility}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, accessibility: value }))}
                  >
                    <SelectTrigger className="border-orange-200">
                      <SelectValue placeholder="Select accessibility level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fully-accessible">Fully wheelchair accessible</SelectItem>
                      <SelectItem value="partially-accessible">Partially accessible</SelectItem>
                      <SelectItem value="not-accessible">Not wheelchair accessible</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="openingHours">Opening Hours</Label>
                  <Input
                    id="openingHours"
                    placeholder="e.g., 6:00 AM - 10:00 PM"
                    value={formData.openingHours}
                    onChange={(e) => setFormData((prev) => ({ ...prev, openingHours: e.target.value }))}
                    className="border-orange-200 focus:border-orange-400"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Photos */}
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
              <CardHeader>
                <CardTitle>Photos (Optional)</CardTitle>
                <CardDescription>Add photos to help other families visualize the playground</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center">
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
                    <p className="text-lg font-medium text-gray-700 mb-2">Upload Photos</p>
                    <p className="text-gray-500">Click to select photos of the playground</p>
                  </label>
                </div>
                {formData.photos.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">{formData.photos.length} photo(s) selected</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-lg py-6"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Playground
              </Button>
              <Button
                type="button"
                variant="outline"
                className="px-8 py-6 border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
