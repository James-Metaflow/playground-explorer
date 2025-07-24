i"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Camera, Plus, X } from 'lucide-react'
import Link from "next/link"

export default function AddPlaygroundPage() {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [customRatingCategories, setCustomRatingCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState("")

  const availableFeatures = [
    "Swings", "Slides", "Climbing Frame", "Sand Pit", "See-saw", "Monkey Bars",
    "Zip Line", "Climbing Wall", "Roundabout", "Spring Riders", "Basketball Hoop",
    "Football Goals", "Picnic Tables", "Benches", "Shade/Shelter", "Fenced Area",
    "Accessible Equipment", "Water Play", "Sensory Play", "Musical Equipment"
  ]

  const defaultCategories = ["Safety", "Cleanliness", "Equipment Quality", "Fun Factor"]

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    )
  }

  const addCustomCategory = () => {
    if (newCategory.trim() && !customRatingCategories.includes(newCategory.trim())) {
      setCustomRatingCategories(prev => [...prev, newCategory.trim()])
      setNewCategory("")
    }
  }

  const removeCustomCategory = (category: string) => {
    setCustomRatingCategories(prev => prev.filter(c => c !== category))
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
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Add a New Playground
            </h2>
            <p className="text-gray-600 text-lg">Help other families discover amazing play areas!</p>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800">Playground Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Playground Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Sunshine Adventure Park"
                    className="border-orange-200 focus:border-orange-400"
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
                      placeholder="e.g., Hyde Park, London"
                      className="pl-10 border-orange-200 focus:border-orange-400"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="ageRange" className="text-sm font-medium text-gray-700">
                    Age Range *
                  </Label>
                  <Select>
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
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us about this playground... What makes it special?"
                    className="border-orange-200 focus:border-orange-400 min-h-[100px]"
                  />
                </div>
              </div>

              {/* Features Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Playground Features
                </Label>
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
              </div>

              {/* Custom Rating Categories */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Custom Rating Categories
                </Label>
                <p className="text-sm text-gray-600 mb-3">
                  Default categories: {defaultCategories.join(", ")}
                </p>
                
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Add custom category (e.g., Accessibility, Parking)"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="border-orange-200 focus:border-orange-400"
                    onKeyPress={(e) => e.key === 'Enter' && addCustomCategory()}
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
                      <Badge
                        key={category}
                        variant="secondary"
                        className="bg-purple-100 text-purple-700 pr-1"
                      >
                        {category}
                        <button
                          onClick={() => removeCustomCategory(category)}
                          className="ml-2 hover:text-purple-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Photo Upload */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Photos (Optional)
                </Label>
                <div className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors">
                  <Camera className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Upload photos of the playground</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Photos will be kept private in your personal collection
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50"
                  >
                    Choose Photos
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-lg py-3"
                >
                  Add Playground
                </Button>
                <p className="text-sm text-gray-500 text-center mt-2">
                  By adding a playground, you agree to our community guidelines
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}