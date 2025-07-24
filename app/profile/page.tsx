"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MapPin, Star, Camera, Settings, Plus, Edit, Trash2, Heart } from "lucide-react"
import Link from "next/link"

const mockUser = {
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  joinDate: "March 2024",
  totalRatings: 15,
  totalPhotos: 42,
  favoritePlaygrounds: 8,
}

const mockRatings = [
  {
    id: 1,
    playgroundName: "Sunshine Adventure Park",
    location: "Hyde Park, London",
    rating: 4.8,
    date: "2024-01-15",
    review: "Amazing playground with great equipment for all ages!",
  },
  {
    id: 2,
    playgroundName: "Rainbow Play Area",
    location: "Regent's Park, London",
    rating: 4.2,
    date: "2024-01-10",
    review: "Nice playground but could use more shade.",
  },
  {
    id: 3,
    playgroundName: "Castle Playground",
    location: "Hampstead Heath, London",
    rating: 5.0,
    date: "2024-01-05",
    review: "Absolutely fantastic! The kids loved the castle theme.",
  },
]

const mockCategories = [
  { id: 1, name: "Safety", description: "How safe is the playground?" },
  { id: 2, name: "Equipment Quality", description: "Quality and condition of play equipment" },
  { id: 3, name: "Cleanliness", description: "How clean and well-maintained is the area?" },
  { id: 4, name: "Age Appropriateness", description: "Suitable for the intended age group?" },
  { id: 5, name: "Accessibility", description: "Accessible for children with disabilities?" },
  { id: 6, name: "Overall Fun Factor", description: "How much fun did your child have?" },
]

export default function ProfilePage() {
  const [isEditingCategories, setIsEditingCategories] = useState(false)
  const [categories, setCategories] = useState(mockCategories)
  const [newCategory, setNewCategory] = useState({ name: "", description: "" })

  const handleAddCategory = () => {
    if (newCategory.name && newCategory.description) {
      setCategories((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: newCategory.name,
          description: newCategory.description,
        },
      ])
      setNewCategory({ name: "", description: "" })
    }
  }

  const handleDeleteCategory = (id: number) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id))
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
              <Link href="/profile" className="text-orange-500 font-medium">
                My Profile
              </Link>
              <Button className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600">
                Sign Out
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="bg-white/80 backdrop-blur-sm border-orange-200 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder-user.jpg" alt={mockUser.name} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-orange-400 to-pink-500 text-white">
                  {mockUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  {mockUser.name}
                </h2>
                <p className="text-gray-600 mb-4">{mockUser.email}</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">{mockUser.totalRatings}</div>
                    <div className="text-sm text-gray-600">Ratings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-500">{mockUser.totalPhotos}</div>
                    <div className="text-sm text-gray-600">Photos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">{mockUser.favoritePlaygrounds}</div>
                    <div className="text-sm text-gray-600">Favorites</div>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent">
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="ratings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 border border-orange-200">
            <TabsTrigger value="ratings">My Ratings</TabsTrigger>
            <TabsTrigger value="photos">My Photos</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="categories">Rating Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="ratings" className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">My Playground Ratings</h3>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                {mockUser.totalRatings} total ratings
              </Badge>
            </div>

            <div className="grid gap-4">
              {mockRatings.map((rating) => (
                <Card key={rating.id} className="bg-white/80 backdrop-blur-sm border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">{rating.playgroundName}</h4>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{rating.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{rating.rating}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {new Date(rating.date).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{rating.review}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">My Private Photos</h3>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {mockUser.totalPhotos} photos
              </Badge>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
              <CardContent className="p-8 text-center">
                <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Your Photo Collection</h4>
                <p className="text-gray-600 mb-4">
                  All your playground photos are stored privately and only visible to you. Upload photos when visiting
                  playgrounds to build your memory collection!
                </p>
                <Button className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Photos
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Favorite Playgrounds</h3>
              <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                {mockUser.favoritePlaygrounds} favorites
              </Badge>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
              <CardContent className="p-8 text-center">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Your Favorite Playgrounds</h4>
                <p className="text-gray-600 mb-4">
                  Save playgrounds you love to easily find them again. Click the heart icon on any playground to add it
                  to your favorites!
                </p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
                >
                  <Link href="/search">
                    <MapPin className="w-4 h-4 mr-2" />
                    Discover Playgrounds
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold">Rating Categories</h3>
                <p className="text-gray-600">Customize the categories you use to rate playgrounds</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Rating Category</DialogTitle>
                    <DialogDescription>
                      Create a custom category to rate specific aspects of playgrounds
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryName">Category Name</Label>
                      <Input
                        id="categoryName"
                        placeholder="e.g., Shade Coverage"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoryDescription">Description</Label>
                      <Input
                        id="categoryDescription"
                        placeholder="e.g., How much shade is available?"
                        value={newCategory.description}
                        onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <Button
                      onClick={handleAddCategory}
                      className="w-full bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
                    >
                      Add Category
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="bg-white/80 backdrop-blur-sm border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">{category.name}</h4>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
