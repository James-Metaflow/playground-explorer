"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, MapPin, Loader2, Navigation, AlertCircle, Heart, Star, Database, TestTube } from "lucide-react"
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

interface PlaygroundPhoto {
  url: string
  source: 'google' | 'unsplash' | 'user'
  attribution?: string
  width?: number
  height?: number
}

// Enhanced PlaygroundData interface with photos
interface EnhancedPlaygroundData extends PlaygroundData {
  photos?: PlaygroundPhoto[]
  primaryPhoto?: string
}

// Photo component for playground images
const PlaygroundPhotoComponent: React.FC<{ 
  playground: EnhancedPlaygroundData
  className?: string 
}> = ({ playground, className = "" }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  // Get photo URL with fallback to placeholder
  const photoUrl = playground.primaryPhoto || getPlaygroundPhotoUrl(playground)
  
  if (!photoUrl || imageError) {
    // Fallback to gradient with emoji
    return (
      <div className={`bg-gradient-to-br from-blue-200 to-purple-200 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-4xl">🏰</span>
      </div>
    )
  }
  
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      )}
      <img
        src={photoUrl}
        alt={`${playground.name} playground`}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
      {imageLoaded && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white text-xs p-2">
          <div className="text-right opacity-80">📸</div>
        </div>
      )}
    </div>
  )
}

// Helper function to get photo URLs
function getPlaygroundPhotoUrl(playground: EnhancedPlaygroundData): string | null {
  // For testing, use Unsplash with playground-related keywords
  const keywords = ['playground', 'children-playing', 'park', 'slide', 'swing-set']
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)]
  const seed = playground.name.replace(/\s+/g, '').toLowerCase()
  return `https://source.unsplash.com/400x300/?${randomKeyword}&sig=${seed}`
}

// Enhanced Google Places search with photo fetching
async function fetchGooglePlacesWithPhotos(query: string): Promise<EnhancedPlaygroundData[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    if (!apiKey) {
      console.warn('Google API key not found, using fallback search')
      return []
    }

    // Search for places
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=playground+${encodeURIComponent(query)}&key=${apiKey}`
    const response = await fetch(searchUrl)
    const data = await response.json()
    
    if (!response.ok || !data.results) {
      throw new Error(data.error_message || 'Failed to fetch Google Places')
    }

    // Process results and add photos
    const playgrounds = await Promise.all(
      (data.results || []).slice(0, 10).map(async (place: any) => {
        let primaryPhoto = null
        let photos: PlaygroundPhoto[] = []
        
        // If place has photos, get the first one using Google Places Photo API
        if (place.photos && place.photos[0]) {
          const photoRef = place.photos[0].photo_reference
          primaryPhoto = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${apiKey}`
          
          photos = place.photos.slice(0, 3).map((photo: any) => ({
            url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`,
            source: 'google' as const,
            attribution: 'Google',
            width: photo.width,
            height: photo.height
          }))
        }
        
        return {
          id: `google-${place.place_id}`,
          name: place.name,
          lat: place.geometry.location.lat,
          lon: place.geometry.location.lng,
          address: place.formatted_address,
          city: place.formatted_address?.split(',')[1]?.trim(),
          amenities: place.types?.filter((type: string) => 
            ['playground', 'park', 'tourist_attraction', 'point_of_interest'].includes(type)
          ) || [],
          source: 'google' as const,
          googleRating: place.rating,
          primaryPhoto,
          photos
        } as EnhancedPlaygroundData
      })
    )
    
    return playgrounds
  } catch (error) {
    console.error('Error fetching Google Places with photos:', error)
    return []
  }
}

// Enhanced search function that combines sources with photos
async function searchPlaygroundsWithPhotos(query: string): Promise<EnhancedPlaygroundData[]> {
  try {
    const [googleResults, originalResults] = await Promise.all([
      fetchGooglePlacesWithPhotos(query),
      searchPlaygroundsByLocation(query)
    ])

    // Add photos to original results (OSM, etc.)
    const enhancedOriginalResults: EnhancedPlaygroundData[] = originalResults.map(playground => ({
      ...playground,
      primaryPhoto: getPlaygroundPhotoUrl(playground),
      photos: [{
        url: getPlaygroundPhotoUrl(playground)!,
        source: 'unsplash' as const,
        attribution: 'Unsplash'
      }]
    }))

    // Combine and deduplicate (prioritize Google results with real photos)
    const combinedResults = [...googleResults, ...enhancedOriginalResults]
    const deduplicatedResults = combinedResults.filter((playground, index, arr) => 
      index === arr.findIndex(p => 
        p.name.toLowerCase().trim() === playground.name.toLowerCase().trim() &&
        Math.abs(p.lat - playground.lat) < 0.001 &&
        Math.abs(p.lon - playground.lon) < 0.001
      )
    )

    return deduplicatedResults
  } catch (error) {
    console.error('Error in searchPlaygroundsWithPhotos:', error)
    // Fallback to original search
    const originalResults = await searchPlaygroundsByLocation(query)
    return originalResults.map(playground => ({
      ...playground,
      primaryPhoto: getPlaygroundPhotoUrl(playground),
      photos: [{
        url: getPlaygroundPhotoUrl(playground)!,
        source: 'unsplash' as const,
        attribution: 'Unsplash'
      }]
    }))
  }
}

export default function SearchPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [playgrounds, setPlaygrounds] = useState<EnhancedPlaygroundData[]>([])
  const [dbPlaygrounds, setDbPlaygrounds] = useState<DatabasePlayground[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.5074, -0.1278]) // Default to London
  const [selectedPlayground, setSelectedPlayground] = useState<EnhancedPlaygroundData | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(null)
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list')
  const [showDebug, setShowDebug] = useState(false)

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

  // Load database playgrounds on mount
  useEffect(() => {
    loadDatabasePlaygrounds()
  }, [])

  const loadDatabasePlaygrounds = async () => {
    try {
      console.log('🔍 Loading database playgrounds...')
      
      // Test basic database connection first
      const { data: testData, error: testError } = await supabase
        .from('playgrounds')
        .select('count(*)')
        .limit(1)
      
      console.log('📊 Database connection test:', { testData, testError })
      
      if (testError) {
        console.error('❌ Database connection failed:', testError)
        setError(`Database connection failed: ${testError.message}`)
        return
      }

      const { data, error } = await supabase
        .from('playgrounds')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100) // Add limit for performance

      console.log('📊 Database playgrounds loaded:', { 
        count: data?.length || 0, 
        error,
        sample: data?.[0]
      })

      if (error) {
        console.error('❌ Error loading database playgrounds:', error)
        setError(`Failed to load playgrounds: ${error.message}`)
        return
      }

      setDbPlaygrounds(data || [])
      console.log('✅ Database playgrounds loaded successfully')
    } catch (error) {
      console.error('💥 Unexpected error loading database playgrounds:', error)
      setError(`Unexpected error: ${error}`)
    }
  }

  const loadUserFavorites = async (userId: string) => {
    try {
      console.log('💖 Loading user favorites...')
      const { data, error } = await supabase
        .from('user_favorites')
        .select('playground_id')
        .eq('user_id', userId)

      if (error) {
        console.error('❌ Error loading favorites:', error)
        return
      }

      const favoriteIds = new Set(data?.map(f => f.playground_id) || [])
      setFavorites(favoriteIds)
      console.log('✅ Favorites loaded:', favoriteIds.size, 'items')
    } catch (error) {
      console.error('💥 Error loading favorites:', error)
    }
  }

  const toggleFavorite = async (playgroundId: string) => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    try {
      if (favorites.has(playgroundId)) {
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

  // Enhanced database search with debugging
  const searchDatabasePlaygrounds = async (query: string): Promise<EnhancedPlaygroundData[]> => {
    try {
      console.log('🔍 Starting database search for:', query)
      
      // Check current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('👤 Current user:', user?.email, userError)
      
      // Test basic database connection
      console.log('🧪 Testing database connection...')
      const { data: testData, error: testError } = await supabase
        .from('playgrounds')
        .select('count(*)')
        .limit(1)
      
      console.log('📊 Database test result:', { testData, testError })
      
      if (testError) {
        console.error('❌ Database connection failed:', testError)
        console.error('Error details:', {
          code: testError.code,
          message: testError.message,
          details: testError.details,
          hint: testError.hint
        })
        return []
      }
      
      // Perform the actual search
      console.log('🔍 Performing search query...')
      const { data, error } = await supabase
        .from('playgrounds')
        .select('*')
        .or(`name.ilike.%${query}%,location.ilike.%${query}%`)
        .limit(50) // Add limit to prevent huge results

      console.log('📊 Search result:', { 
        dataCount: data?.length || 0, 
        error,
        firstResult: data?.[0]
      })

      if (error) {
        console.error('❌ Search error:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        // If it's an RLS error, provide specific guidance
        if (error.code === '42501' || error.message?.includes('permission')) {
          console.error('🚨 This looks like a Row Level Security (RLS) issue!')
          console.error('💡 Solution: Run the RLS policies SQL in your Supabase dashboard')
        }
        
        return []
      }

      // Transform the data
      const transformedData = (data || []).map(pg => ({
        id: `db-${pg.id}`,
        name: pg.name,
        lat: pg.lat || 51.5074,
        lon: pg.lon || -0.1278,
        address: pg.location,
        city: pg.location,
        amenities: pg.equipment || [],
        surface: 'unknown',
        access: pg.accessibility,
        opening_hours: pg.opening_hours,
        source: 'database' as const,
        explorerRating: pg.explorerRating,
        googleRating: pg.googleRating,
        primaryPhoto: getPlaygroundPhotoUrl({ name: pg.name } as EnhancedPlaygroundData),
        photos: [{
          url: getPlaygroundPhotoUrl({ name: pg.name } as EnhancedPlaygroundData)!,
          source: 'unsplash' as const,
          attribution: 'Unsplash'
        }]
      }))

      console.log('✅ Database search completed:', transformedData.length, 'results')
      return transformedData

    } catch (error) {
      console.error('💥 Unexpected error in database search:', error)
      return []
    }
  }

  // Enhanced search with photos and proper distance sorting
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)
    setSelectedPlayground(null)
    setActiveTab('list')

    console.log('🚀 Starting enhanced search...')
    console.log('🔍 Search query:', searchQuery)
    
    try {
      // Check auth status
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🔐 Auth status:', session ? 'Authenticated' : 'Anonymous')
      
      // Geocode the search query first
      let searchLat: number | null = null
      let searchLon: number | null = null

      try {
        console.log('🌍 Geocoding location...')
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=gb&limit=1`
        const geocodeResponse = await fetch(geocodeUrl, {
          headers: { "User-Agent": "PlaygroundExplorer/1.0" }
        })

        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json()
          if (geocodeData && geocodeData.length > 0) {
            searchLat = parseFloat(geocodeData[0].lat)
            searchLon = parseFloat(geocodeData[0].lon)
            setSearchCenter([searchLat, searchLon])
            console.log('📍 Geocoded to:', searchLat, searchLon)
          }
        }
      } catch (geocodeError) {
        console.warn('⚠️ Geocoding failed:', geocodeError)
      }

      // Search with enhanced photo support and debugging
      console.log('🔍 Searching external APIs...')
      const externalResults = await searchPlaygroundsWithPhotos(searchQuery)
      console.log('📊 External results:', externalResults.length)

      console.log('🔍 Searching database...')
      const dbResults = await searchDatabasePlaygrounds(searchQuery)
      console.log('📊 Database results:', dbResults.length)

      // Combine and deduplicate results
      const combinedResults = [...externalResults, ...dbResults]
      console.log('📊 Combined results:', combinedResults.length)
      
      // Sort by distance from search center if we have coordinates
      let sortedResults = combinedResults
      if (searchLat && searchLon) {
        sortedResults = combinedResults.sort((a, b) => {
          const distA = calculateDistance(searchLat!, searchLon!, a.lat, a.lon)
          const distB = calculateDistance(searchLat!, searchLon!, b.lat, b.lon)
          return distA - distB
        })
        console.log('📍 Results sorted by distance')
      }

      setPlaygrounds(sortedResults)

      if (sortedResults.length > 0) {
        if (searchLat && searchLon) {
          setMapCenter([searchLat, searchLon])
        } else {
          setMapCenter([sortedResults[0].lat, sortedResults[0].lon])
        }
        console.log('✅ Search completed successfully')
      } else {
        setError(`No playgrounds found near "${searchQuery}". Try a different location.`)
        console.log('⚠️ No results found')
      }
    } catch (error) {
      console.error('💥 Search failed:', error)
      setError(`Search failed: ${error}`)
    } finally {
      setLoading(false)
      console.log('🏁 Search process completed')
    }
  }

  // Enhanced nearby search with photos
  const handleNearbySearch = async () => {
    setSelectedPlayground(null)
    setActiveTab('list')
    
    let searchLat = userLocation?.[0]
    let searchLon = userLocation?.[1]

    if (!searchLat || !searchLon) {
      setLocationLoading(true)
      try {
        const location = await getCurrentLocation()
        searchLat = location.lat
        searchLon = location.lon
        setUserLocation([searchLat, searchLon])
        setSearchCenter([searchLat, searchLon])
        setMapCenter([searchLat, searchLon])
      } catch (error) {
        setError("Could not access your location. Please search by city or postcode instead.")
        setLocationLoading(false)
        return
      } finally {
        setLocationLoading(false)
      }
    } else {
      setSearchCenter([searchLat, searchLon])
    }

    setLoading(true)
    setError(null)

    try {
      const [externalResults, dbResults] = await Promise.all([
        fetchPlaygroundsNearLocation(searchLat, searchLon, 10),
        getNearbyDatabasePlaygrounds(searchLat, searchLon)
      ])

      // Add photos to external results
      const enhancedExternalResults: EnhancedPlaygroundData[] = externalResults.map(playground => ({
        ...playground,
        primaryPhoto: getPlaygroundPhotoUrl(playground),
        photos: [{
          url: getPlaygroundPhotoUrl(playground)!,
          source: 'unsplash' as const,
          attribution: 'Unsplash'
        }]
      }))

      const combinedResults = [...enhancedExternalResults, ...dbResults]
      const sortedResults = combinedResults.sort((a, b) => {
        const distA = calculateDistance(searchLat!, searchLon!, a.lat, a.lon)
        const distB = calculateDistance(searchLat!, searchLon!, b.lat, b.lon)
        return distA - distB
      })

      setPlaygrounds(sortedResults)

      if (sortedResults.length === 0) {
        setError("No playgrounds found nearby. Try expanding your search area or search by city name.")
      }
    } catch (error) {
      setError(`Failed to find nearby playgrounds: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const getNearbyDatabasePlaygrounds = async (lat: number, lon: number): Promise<EnhancedPlaygroundData[]> => {
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
      opening_hours: pg.opening_hours,
      source: 'database' as const,
      explorerRating: pg.explorerRating,
      googleRating: pg.googleRating,
      primaryPhoto: getPlaygroundPhotoUrl({ name: pg.name } as EnhancedPlaygroundData),
      photos: [{
        url: getPlaygroundPhotoUrl({ name: pg.name } as EnhancedPlaygroundData)!,
        source: 'unsplash' as const,
        attribution: 'Unsplash'
      }]
    }))
  }

  const handleLocationSearch = async (location: string) => {
    setLoading(true)
    setError(null)
    setSearchQuery(location)
    setSelectedPlayground(null)
    setActiveTab('list')

    try {
      let searchLat: number | null = null
      let searchLon: number | null = null

      try {
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&countrycodes=gb&limit=1`
        const geocodeResponse = await fetch(geocodeUrl, {
          headers: { "User-Agent": "PlaygroundExplorer/1.0" }
        })

        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json()
          if (geocodeData && geocodeData.length > 0) {
            searchLat = parseFloat(geocodeData[0].lat)
            searchLon = parseFloat(geocodeData[0].lon)
            setSearchCenter([searchLat, searchLon])
          }
        }
      } catch (geocodeError) {
        console.warn('Geocoding failed:', geocodeError)
      }

      const [externalResults, dbResults] = await Promise.all([
        searchPlaygroundsWithPhotos(location),
        searchDatabasePlaygrounds(location)
      ])

      const combinedResults = [...externalResults, ...dbResults]
      let sortedResults = combinedResults
      if (searchLat && searchLon) {
        sortedResults = combinedResults.sort((a, b) => {
          const distA = calculateDistance(searchLat!, searchLon!, a.lat, a.lon)
          const distB = calculateDistance(searchLat!, searchLon!, b.lat, b.lon)
          return distA - distB
        })
      }

      setPlaygrounds(sortedResults)

      if (sortedResults.length > 0) {
        if (searchLat && searchLon) {
          setMapCenter([searchLat, searchLon])
        } else {
          setMapCenter([sortedResults[0].lat, sortedResults[0].lon])
        }
      } else {
        setError(`No playgrounds found in ${location}.`)
      }
    } catch (error) {
      setError(`Location search failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePlaygroundClick = (playground: EnhancedPlaygroundData) => {
    console.log('🗺️ Switching to map view for:', playground.name)
    console.log('🎯 Playground coordinates:', playground.lat, playground.lon)
    
    setSelectedPlayground(playground)
    setMapCenter([playground.lat, playground.lon])
    setActiveTab('map')
    
    setTimeout(() => {
      console.log('🗺️ Map should now be centered on:', playground.lat, playground.lon)
    }, 200)
  }

  const handleViewDetails = (playground: EnhancedPlaygroundData) => {
    let playgroundId = playground.id
    if (playgroundId.startsWith('google-')) {
      playgroundId = playgroundId.replace('google-', '')
    } else if (playgroundId.startsWith('db-')) {
      playgroundId = playgroundId.replace('db-', '')
    } else if (playgroundId.startsWith('osm-')) {
      playgroundId = playgroundId.replace('osm-', '')
    } else if (playgroundId.startsWith('mock-')) {
      alert('This is test data. Real playground details page would show here.')
      return
    }
    router.push(`/playground/${playgroundId}`)
  }

  const handleAddRating = (playground: EnhancedPlaygroundData) => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
    let playgroundId = playground.id
    if (playgroundId.startsWith('google-')) {
      playgroundId = playgroundId.replace('google-', '')
    } else if (playgroundId.startsWith('db-')) {
      playgroundId = playgroundId.replace('db-', '')
    } else if (playgroundId.startsWith('osm-')) {
      playgroundId = playgroundId.replace('osm-', '')
    } else if (playgroundId.startsWith('mock-')) {
      alert('This is test data. Real rating page would show here.')
      return
    }
    router.push(`/playground/${playgroundId}?tab=rating`)
  }

  // Test database connectivity function
  const testDatabaseConnection = async () => {
    console.log('🧪 Testing database connection...')
    
    try {
      // Test 1: Basic connection
      const { data: basicTest, error: basicError } = await supabase
        .from('playgrounds')
        .select('count(*)')
      
      console.log('Test 1 - Basic connection:', { basicTest, basicError })
      
      // Test 2: Read permissions
      const { data: readTest, error: readError } = await supabase
        .from('playgrounds')
        .select('id, name')
        .limit(1)
      
      console.log('Test 2 - Read permissions:', { readTest, readError })
      
      // Test 3: User table access
      const { data: userTest, error: userError } = await supabase
        .from('users')
        .select('id')
        .limit(1)
      
      console.log('Test 3 - User table access:', { userTest, userError })
      
      // Test 4: Current user info
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log('Test 4 - Current user:', { user: user?.email, authError })
      
    } catch (error) {
      console.error('💥 Database test failed:', error)
    }
  }

  const getDistanceFromSearchCenter = (playground: EnhancedPlaygroundData): number | null => {
    if (!searchCenter) return null
    return calculateDistance(searchCenter[0], searchCenter[1], playground.lat, playground.lon)
  }

  const sortedPlaygrounds = [...playgrounds].sort((a, b) => {
    const referencePoint = searchCenter || userLocation
    if (!referencePoint) return 0
    const distA = calculateDistance(referencePoint[0], referencePoint[1], a.lat, a.lon)
    const distB = calculateDistance(referencePoint[0], referencePoint[1], b.lat, b.lon)
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
            Discover real playgrounds across the UK with photos from Google Places and our community
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
                  {/* Debug button */}
                  <Button
                    onClick={() => setShowDebug(!showDebug)}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <TestTube className="w-4 h-4 mr-1" />
                    Debug
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

              {/* Debug panel */}
              {showDebug && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Database className="w-4 h-4 text-blue-600" />
                      <h3 className="font-medium text-blue-800">Debug Panel</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-blue-700">Database Status:</p>
                        <p>Playgrounds loaded: {dbPlaygrounds.length}</p>
                        <p>User: {user ? '✅ Authenticated' : '❌ Anonymous'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-blue-700">Search Status:</p>
                        <p>Results: {playgrounds.length}</p>
                        <p>Search center: {searchCenter ? '✅ Set' : '❌ None'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-blue-700">Actions:</p>
                        <Button
                          onClick={testDatabaseConnection}
                          size="sm"
                          variant="outline"
                          className="border-blue-300 text-blue-600 mr-2"
                        >
                          Test DB
                        </Button>
                        <Button
                          onClick={loadDatabasePlaygrounds}
                          size="sm"
                          variant="outline"
                          className="border-blue-300 text-blue-600"
                        >
                          Reload DB
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
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
        <Tabs value={activeTab} onValueChange={(value) => {
          console.log('🔄 Tab changing to:', value)
          try {
            setActiveTab(value as 'list' | 'map')
          } catch (error) {
            console.error('❌ Error changing tab:', error)
          }
        }} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 border border-orange-200">
            <TabsTrigger 
              value="list" 
              data-value="list"
              onClick={() => {
                console.log('📋 List tab clicked')
                setSelectedPlayground(null)
              }}
            >
              List View ({playgrounds.length})
            </TabsTrigger>
            <TabsTrigger 
              value="map" 
              data-value="map"
              onClick={() => {
                console.log('🗺️ Map tab clicked')
              }}
            >
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {loading && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
                <p className="text-gray-600">Searching for playgrounds with photos...</p>
                <p className="text-sm text-gray-500 mt-2">Checking Google Places and our database</p>
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

            {sortedPlaygrounds.map((playground) => {
              const distanceFromSearch = getDistanceFromSearchCenter(playground)
              const distanceFromUser = userLocation 
                ? calculateDistance(userLocation[0], userLocation[1], playground.lat, playground.lon)
                : null

              return (
                <Card
                  key={playground.id}
                  className="bg-white/80 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <PlaygroundPhotoComponent 
                        playground={playground}
                        className="md:w-48 h-32"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{playground.name}</h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="text-sm">
                                {playground.address && `${playground.address}, `}
                                {playground.city || "UK"}
                                {distanceFromSearch && (
                                  <span className="ml-2 text-orange-600 font-medium">
                                    • {distanceFromSearch.toFixed(1)}km from search
                                  </span>
                                )}
                                {!distanceFromSearch && distanceFromUser && (
                                  <span className="ml-2 text-blue-600 font-medium">
                                    • {distanceFromUser.toFixed(1)}km from you
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
                               playground.source === 'osm' ? 'OpenStreetMap' : 'Test Data'}
                            </Badge>
                            {playground.googleRating && (
                              <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                                ⭐ Google: {playground.googleRating.toFixed(1)}
                              </Badge>
                            )}
                            {playground.explorerRating && (
                              <Badge variant="outline" className="border-pink-300 text-pink-700">
                                ⭐ Explorer: {playground.explorerRating.toFixed(1)}
                              </Badge>
                            )}
                            {playground.photos && playground.photos.length > 0 && (
                              <Badge variant="outline" className="border-green-300 text-green-700">
                                📸 {playground.photos[0].source === 'google' ? 'Real Photos' : 'Stock Photos'}
                              </Badge>
                            )}
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
                            onClick={() => {
                              console.log('🗺️ View on Map clicked for:', playground.name)
                              handlePlaygroundClick(playground)
                            }}
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
              )
            })}
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {playgrounds.length} playground{playgrounds.length !== 1 ? "s" : ""} found
                    {searchCenter && (
                      <span className="text-sm font-normal text-gray-600 ml-2">
                        (sorted by distance from search location)
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-600 text-sm">Click on playground markers to see details</p>
                </div>
                <SimpleMap
                  center={mapCenter}
                  zoom={selectedPlayground ? 16 : 12}
                  height="500px"
                  playgrounds={playgrounds.map(p => ({
                    id: p.id,
                    name: p.name,
                    lat: p.lat,
                    lon: p.lon,
                    address: p.address,
                    city: p.city,
                    amenities: p.amenities || [],
                    surface: p.surface || 'unknown',
                    access: p.access,
                    opening_hours: p.opening_hours,
                    source: p.source,
                    googleRating: p.googleRating,
                    explorerRating: p.explorerRating
                  }))}
                  onPlaygroundClick={(playground) => {
                    console.log('🎯 Map marker clicked:', playground.name)
                    const enhancedPlayground = playgrounds.find(p => p.id === playground.id)
                    if (enhancedPlayground) {
                      setSelectedPlayground(enhancedPlayground)
                      setMapCenter([enhancedPlayground.lat, enhancedPlayground.lon])
                    }
                  }}
                  key={`${mapCenter[0]}-${mapCenter[1]}-${selectedPlayground?.id || 'none'}`}
                />
              </CardContent>
            </Card>

            {selectedPlayground && (
              <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
                <CardContent className="p-6">
                  <div className="flex gap-4 mb-4">
                    <PlaygroundPhotoComponent 
                      playground={selectedPlayground}
                      className="w-32 h-24 flex-shrink-0"
                    />
                    <div className="flex-1">
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
                              {selectedPlayground.googleRating && (
                                <p className="text-yellow-600 font-medium mb-2">
                                  ⭐ Google Rating: {selectedPlayground.googleRating.toFixed(1)} / 5.0
                                </p>
                              )}
                              {selectedPlayground.explorerRating && (
                                <p className="text-pink-600 font-medium mb-2">
                                  ⭐ Playground Explorer: {selectedPlayground.explorerRating.toFixed(1)} / 5.0
                                </p>
                              )}
                              {searchCenter && (
                                <p className="text-orange-600 font-medium mb-2">
                                  Distance from search: {calculateDistance(
                                    searchCenter[0], searchCenter[1],
                                    selectedPlayground.lat, selectedPlayground.lon
                                  ).toFixed(1)}km
                                </p>
                              )}
                              {userLocation && (
                                <p className="text-blue-600 font-medium mb-2">
                                  Distance from you: {calculateDistance(
                                    userLocation[0], userLocation[1],
                                    selectedPlayground.lat, selectedPlayground.lon
                                  ).toFixed(1)}km
                                </p>
                              )}
                            </div>
                            <div>
                              {selectedPlayground.amenities && selectedPlayground.amenities.length > 0 && (
                                <div>
                                  <p className="font-medium mb-2">Equipment & Features:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {selectedPlayground.amenities.map((amenity, index) => (
                                      <Badge key={index} variant="outline" className="border-blue-300 text-blue-700">
                                        {amenity}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div className="mt-3 space-y-2">
                                <Badge
                                  variant="secondary"
                                  className={
                                    selectedPlayground.source === 'google'
                                      ? "bg-blue-100 text-blue-700"
                                      : selectedPlayground.source === 'database'
                                      ? "bg-green-100 text-green-700"
                                      : selectedPlayground.source === 'osm'
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-gray-100 text-gray-700"
                                  }
                                >
                                  Source: {selectedPlayground.source === 'google' ? 'Google Places' :
                                          selectedPlayground.source === 'database' ? 'User Added' :
                                          selectedPlayground.source === 'osm' ? 'OpenStreetMap' : 'Test Data'}
                                </Badge>
                                {selectedPlayground.photos && selectedPlayground.photos.length > 0 && (
                                  <Badge variant="outline" className="border-green-300 text-green-700 block w-fit">
                                    📸 {selectedPlayground.photos.length} photo{selectedPlayground.photos.length !== 1 ? 's' : ''} available
                                  </Badge>
                                )}
                              </div>
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
                    </div>
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