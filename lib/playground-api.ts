// Enhanced UK Playground data fetching with Google Places API via backend

export interface PlaygroundData {
  id: string
  name: string
  lat: number
  lon: number
  address?: string
  city?: string
  postcode?: string
  amenities?: string[]
  surface?: string
  access?: string
  opening_hours?: string
  rating?: number
  source?: 'google' | 'osm' | 'database' | 'mock'
}

// Google Places API integration via backend API
class GooglePlacesAPI {
  constructor() {
    console.log('🔑 DEBUG: Using server-side Google Places API calls')
  }

  // Search for playgrounds near coordinates
  async searchNearbyPlaygrounds(lat: number, lon: number, radiusMeters = 10000): Promise<PlaygroundData[]> {
    console.log(`🔍 Google Places: Searching near ${lat}, ${lon} within ${radiusMeters}m`)

    try {
      // Use multiple search terms to find different types of playgrounds
      const searchTerms = [
        'playground',
        'children playground', 
        'kids playground',
        'play area',
        'children play area',
        'park playground'
      ]

      const allResults: PlaygroundData[] = []

      for (const searchTerm of searchTerms) {
        try {
          console.log(`🔍 DEBUG: Trying nearby search with term: "${searchTerm}"`)
          
          const url = `/api/places/search?type=nearbySearch&location=${lat},${lon}&radius=${radiusMeters}&keyword=${encodeURIComponent(searchTerm)}`
          console.log(`📡 DEBUG: Calling backend API: ${url}`)
          
          const response = await fetch(url)
          console.log(`📡 DEBUG: Backend response status: ${response.status}`)

          if (!response.ok) {
            const errorText = await response.text()
            console.error(`❌ DEBUG: Backend error: ${errorText}`)
            continue
          }

          const data = await response.json()
          console.log(`📊 DEBUG: Backend response:`, data.status, `(${data.results?.length || 0} results)`)

          if (data.status === 'OK' && data.results) {
            const results = this.parseGoogleResults(data.results)
            console.log(`📊 DEBUG: "${searchTerm}" parsed to ${results.length} playgrounds`)
            allResults.push(...results)
          }
          
          // Small delay between searches
          await new Promise(resolve => setTimeout(resolve, 200))
        } catch (error) {
          console.warn(`⚠️ Nearby search failed for "${searchTerm}":`, error)
          continue
        }
      }

      // Remove duplicates
      const uniqueResults = this.removeDuplicates(allResults)
      console.log(`✅ Google Places found ${uniqueResults.length} unique playgrounds`)
      
      return uniqueResults

    } catch (error) {
      console.error('❌ Google Places nearby search error:', error)
      return []
    }
  }

  // Search for playgrounds by location name
  async searchByLocation(location: string): Promise<PlaygroundData[]> {
    console.log(`🔍 Google Places: Searching for playgrounds in "${location}"`)

    try {
      const searchQueries = [
        `playground in ${location}`,
        `children playground ${location}`,
        `play area ${location}`,
        `park playground ${location}`,
        `kids play area ${location} UK`
      ]

      const allResults: PlaygroundData[] = []

      for (const query of searchQueries) {
        try {
          console.log(`🔍 DEBUG: Trying text search with query: "${query}"`)
          
          const url = `/api/places/search?type=textSearch&query=${encodeURIComponent(query)}`
          console.log(`📡 DEBUG: Calling backend API: ${url}`)
          
          const response = await fetch(url)
          console.log(`📡 DEBUG: Backend response status: ${response.status}`)

          if (!response.ok) {
            const errorText = await response.text()
            console.error(`❌ DEBUG: Backend error: ${errorText}`)
            continue
          }

          const data = await response.json()
          console.log(`📊 DEBUG: Backend response:`, data.status, `(${data.results?.length || 0} results)`)

          if (data.status === 'OK' && data.results) {
            const results = this.parseGoogleResults(data.results)
            console.log(`📊 DEBUG: "${query}" parsed to ${results.length} playgrounds`)
            allResults.push(...results)
          }
          
          // Small delay between searches
          await new Promise(resolve => setTimeout(resolve, 300))
        } catch (error) {
          console.warn(`⚠️ Text search failed for "${query}":`, error)
          continue
        }
      }

      const uniqueResults = this.removeDuplicates(allResults)
      console.log(`✅ Google Places found ${uniqueResults.length} playgrounds for "${location}"`)
      
      return uniqueResults

    } catch (error) {
      console.error('❌ Google Places text search error:', error)
      return []
    }
  }

  // Parse Google Places results into our format
  private parseGoogleResults(results: any[]): PlaygroundData[] {
    console.log(`🔄 DEBUG: Parsing ${results.length} Google results`)
    
    const parsed = results
      .filter(place => {
        const relevant = this.isPlaygroundRelevant(place)
        console.log(`🔍 DEBUG: Place "${place.name}" relevant: ${relevant}`)
        return relevant
      })
      .map(place => {
        const parsed = {
          id: `google-${place.place_id}`,
          name: this.generatePlaygroundName(place),
          lat: place.geometry.location.lat,
          lon: place.geometry.location.lng,
          address: place.vicinity || place.formatted_address,
          city: this.extractCity(place),
          rating: place.rating,
          amenities: this.extractAmenities(place),
          opening_hours: this.formatOpeningHours(place.opening_hours),
          source: 'google' as const
        }
        console.log(`✅ DEBUG: Parsed playground:`, parsed)
        return parsed
      })

    console.log(`✅ DEBUG: Successfully parsed ${parsed.length} playgrounds`)
    return parsed
  }

  // Filter out non-playground results
  private isPlaygroundRelevant(place: any): boolean {
    const name = place.name.toLowerCase()
    const types = place.types || []
    
    console.log(`🔍 DEBUG: Checking relevance for "${place.name}", types:`, types)
    
    // Must contain playground-related keywords
    const playgroundKeywords = [
      'playground', 'play area', 'play ground', 'children', 'kids', 
      'recreation', 'park', 'garden', 'green', 'common'
    ]
    
    const hasPlaygroundKeyword = playgroundKeywords.some(keyword => 
      name.includes(keyword)
    )

    // Exclude irrelevant places
    const excludeKeywords = [
      'school', 'nursery', 'hotel', 'restaurant', 'shop', 'store',
      'gym', 'centre', 'hospital', 'church', 'mosque', 'temple'
    ]
    
    const hasExcludeKeyword = excludeKeywords.some(keyword => 
      name.includes(keyword)
    )

    const relevant = hasPlaygroundKeyword && !hasExcludeKeyword
    console.log(`🔍 DEBUG: Has playground keyword: ${hasPlaygroundKeyword}, Has exclude keyword: ${hasExcludeKeyword}, Relevant: ${relevant}`)
    
    return relevant
  }

  // Generate meaningful playground names
  private generatePlaygroundName(place: any): string {
    let name = place.name

    // If name is generic, try to make it more specific
    if (name.toLowerCase() === 'park' || name.toLowerCase() === 'playground') {
      const vicinity = place.vicinity || place.formatted_address || ''
      const addressParts = vicinity.split(',')
      if (addressParts.length > 0) {
        const locationName = addressParts[0].trim()
        name = `${locationName} ${name}`
      }
    }

    // Add "Playground" if not already included
    const nameLower = name.toLowerCase()
    if (!nameLower.includes('playground') && !nameLower.includes('play area') && !nameLower.includes('park')) {
      name += ' Playground'
    }

    return name
  }

  // Extract city from place data
  private extractCity(place: any): string | undefined {
    const vicinity = place.vicinity || place.formatted_address || ''
    const parts = vicinity.split(',')
    
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i].trim()
      // Skip postcodes (UK format)
      if (!/^[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}$/i.test(part)) {
        return part
      }
    }
    
    return parts[0]?.trim()
  }

  // Extract amenities from Google Places data
  private extractAmenities(place: any): string[] {
    const amenities: string[] = []
    const types = place.types || []
    
    if (types.includes('park')) amenities.push('Park Setting')
    if (types.includes('amusement_park')) amenities.push('Amusement Park')
    if (place.rating && place.rating >= 4.0) amenities.push('Highly Rated')
    
    const name = place.name.toLowerCase()
    if (name.includes('adventure')) amenities.push('Adventure Equipment')
    if (name.includes('water')) amenities.push('Water Play')
    if (name.includes('toddler')) amenities.push('Toddler Area')
    if (name.includes('climbing')) amenities.push('Climbing Equipment')
    
    return amenities
  }

  // Format opening hours
  private formatOpeningHours(openingHours: any): string | undefined {
    if (!openingHours || !openingHours.weekday_text) {
      return undefined
    }
    return openingHours.weekday_text[0]
  }

  // Remove duplicates
  private removeDuplicates(playgrounds: PlaygroundData[]): PlaygroundData[] {
    const unique: PlaygroundData[] = []
    
    for (const playground of playgrounds) {
      const isDuplicate = unique.some(existing => {
        const distance = this.calculateDistance(
          playground.lat, playground.lon,
          existing.lat, existing.lon
        )
        const nameSimilar = this.areNamesSimilar(playground.name, existing.name)
        return distance < 0.1 && nameSimilar
      })
      
      if (!isDuplicate) {
        unique.push(playground)
      }
    }
    
    return unique
  }

  private areNamesSimilar(name1: string, name2: string): boolean {
    const clean1 = name1.toLowerCase().replace(/[^\w\s]/g, '')
    const clean2 = name2.toLowerCase().replace(/[^\w\s]/g, '')
    return clean1.includes(clean2) || clean2.includes(clean1)
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }
}

// Create Google Places API instance
const googlePlacesAPI = new GooglePlacesAPI()

// Function to check if two playgrounds are duplicates
function areDuplicates(playground1: PlaygroundData, playground2: PlaygroundData): boolean {
  const nameSimilarity = playground1.name.toLowerCase() === playground2.name.toLowerCase()
  const locationProximity =
    Math.abs(playground1.lat - playground2.lat) < 0.0005 && Math.abs(playground1.lon - playground2.lon) < 0.0005
  return nameSimilarity && locationProximity
}

// Enhanced main search function
export async function fetchPlaygroundsNearLocation(lat: number, lon: number, radiusKm = 10): Promise<PlaygroundData[]> {
  console.log(`🎯 DEBUG: Searching playgrounds near ${lat}, ${lon} within ${radiusKm}km`)

  const allPlaygrounds: PlaygroundData[] = []

  // 1. Try Google Places first
  try {
    console.log('🔍 DEBUG: Step 1: Searching Google Places via backend...')
    const googleResults = await googlePlacesAPI.searchNearbyPlaygrounds(lat, lon, radiusKm * 1000)
    allPlaygrounds.push(...googleResults)
    console.log(`✅ DEBUG: Google Places found ${googleResults.length} playgrounds`)
  } catch (error) {
    console.warn('⚠️ DEBUG: Google Places search failed:', error)
  }

  // 2. If we have good results, we can skip other sources
  if (allPlaygrounds.length >= 5) {
    console.log('🎉 DEBUG: Found sufficient results from Google Places')
    return allPlaygrounds.slice(0, 20)
  }

  // 3. Supplement with OpenStreetMap
  try {
    console.log('🔍 DEBUG: Step 2: Supplementing with OpenStreetMap...')
    const osmResults = await fetchFromOpenStreetMap(lat, lon, radiusKm)
    
    for (const osmPlayground of osmResults) {
      const isDuplicate = allPlaygrounds.some(existing => areDuplicates(osmPlayground, existing))
      if (!isDuplicate) {
        allPlaygrounds.push({ ...osmPlayground, source: 'osm' })
      }
    }
    console.log(`✅ DEBUG: Added ${osmResults.length} unique OpenStreetMap results`)
  } catch (error) {
    console.warn('⚠️ DEBUG: OpenStreetMap search failed:', error)
  }

  // 4. Return results or mock data
  if (allPlaygrounds.length === 0) {
    console.log('🎭 DEBUG: No real playgrounds found, returning test data')
    return getMockPlaygrounds(lat, lon)
  }

  // Sort by rating, then distance
  const sortedPlaygrounds = allPlaygrounds.sort((a, b) => {
    if (a.rating && b.rating) return b.rating - a.rating
    if (a.rating && !b.rating) return -1
    if (!a.rating && b.rating) return 1
    
    const distA = calculateDistance(lat, lon, a.lat, a.lon)
    const distB = calculateDistance(lat, lon, b.lat, b.lon)
    return distA - distB
  })

  console.log(`🎯 DEBUG: Returning ${sortedPlaygrounds.length} total playgrounds`)
  return sortedPlaygrounds.slice(0, 20)
}

// Enhanced location search
export async function searchPlaygroundsByLocation(location: string): Promise<PlaygroundData[]> {
  console.log(`🎯 DEBUG: Searching playgrounds for location: "${location}"`)

  const allPlaygrounds: PlaygroundData[] = []

  // 1. Try Google Places text search first
  try {
    console.log('🔍 DEBUG: Step 1: Google Places text search via backend...')
    const googleResults = await googlePlacesAPI.searchByLocation(location)
    allPlaygrounds.push(...googleResults)
    console.log(`✅ DEBUG: Google Places found ${googleResults.length} playgrounds`)
  } catch (error) {
    console.warn('⚠️ DEBUG: Google Places text search failed:', error)
  }

  // 2. If Google found good results, return them
  if (allPlaygrounds.length >= 3) {
    console.log('🎉 DEBUG: Found sufficient results from Google text search')
    return allPlaygrounds.slice(0, 20)
  }

  // 3. Fall back to geocoding + nearby search
  try {
    console.log('🔍 DEBUG: Step 2: Geocoding location for nearby search...')
    
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&countrycodes=gb&limit=1&addressdetails=1`
    console.log('📡 DEBUG: Geocoding URL:', geocodeUrl)
    
    const geocodeResponse = await fetch(geocodeUrl, {
      headers: { "User-Agent": "PlaygroundExplorer/1.0" }
    })

    console.log('📡 DEBUG: Geocoding response status:', geocodeResponse.status)

    if (geocodeResponse.ok) {
      const geocodeData = await geocodeResponse.json()
      console.log('🌍 DEBUG: Geocoding results:', geocodeData)
      
      if (geocodeData && geocodeData.length > 0) {
        const { lat, lon } = geocodeData[0]
        const numLat = parseFloat(lat)
        const numLon = parseFloat(lon)
        
        console.log(`✅ DEBUG: Geocoded "${location}" to ${numLat}, ${numLon}`)
        
        const nearbyResults = await fetchPlaygroundsNearLocation(numLat, numLon, 15)
        console.log(`📊 DEBUG: Nearby search returned ${nearbyResults.length} results`)
        
        for (const playground of nearbyResults) {
          const isDuplicate = allPlaygrounds.some(existing => areDuplicates(playground, existing))
          if (!isDuplicate) {
            allPlaygrounds.push(playground)
          }
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ DEBUG: Geocoding fallback failed:', error)
  }

  // 4. Return results or mock data
  if (allPlaygrounds.length === 0) {
    console.log('🎭 DEBUG: No real playgrounds found, returning test data')
    return getMockPlaygroundsForLocation(location)
  }

  console.log(`🎯 DEBUG: Returning ${allPlaygrounds.length} total playgrounds for "${location}"`)
  return allPlaygrounds.slice(0, 20)
}

// OpenStreetMap fallback
async function fetchFromOpenStreetMap(lat: number, lon: number, radiusKm: number): Promise<PlaygroundData[]> {
  console.log(`🔍 DEBUG: OpenStreetMap search near ${lat}, ${lon} within ${radiusKm}km`)
  
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="playground"](around:${radiusKm * 1000},${lat},${lon});
      way["amenity"="playground"](around:${radiusKm * 1000},${lat},${lon});
      node["leisure"="playground"](around:${radiusKm * 1000},${lat},${lon});
      way["leisure"="playground"](around:${radiusKm * 1000},${lat},${lon});
    );
    out center meta;
  `

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    })

    if (!response.ok) return []

    const data = await response.json()
    if (!data.elements) return []

    const results = data.elements
      .filter((element: any) => element.lat && element.lon)
      .map((element: any) => ({
        id: `osm-${element.type}-${element.id}`,
        name: element.tags?.name || `${getPlaygroundType(element.tags)} near ${lat.toFixed(3)}, ${lon.toFixed(3)}`,
        lat: element.lat || element.center?.lat,
        lon: element.lon || element.center?.lon,
        address: element.tags?.["addr:street"],
        city: element.tags?.["addr:city"] || element.tags?.["addr:town"],
        amenities: extractAmenities(element.tags),
        source: 'osm' as const
      }))

    console.log(`✅ DEBUG: OpenStreetMap processed ${results.length} playgrounds`)
    return results

  } catch (error) {
    console.error('❌ DEBUG: OpenStreetMap fallback failed:', error)
    return []
  }
}

// Helper functions
function getPlaygroundType(tags: any): string {
  if (!tags) return "Playground"
  if (tags.amenity === "playground") return "Playground"
  if (tags.leisure === "playground") return "Play Area"
  return "Playground"
}

function extractAmenities(tags: any): string[] {
  if (!tags) return []
  const amenities: string[] = []
  
  if (tags.swing === "yes") amenities.push("Swings")
  if (tags.slide === "yes") amenities.push("Slides")
  if (tags.climbing_frame === "yes") amenities.push("Climbing Frame")
  if (tags.sandpit === "yes") amenities.push("Sand Pit")
  
  return amenities
}

export function getCurrentLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      }),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      }
    )
  })
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Mock data functions
function getMockPlaygrounds(lat: number, lon: number): PlaygroundData[] {
  console.log('🎭 DEBUG: Generating mock playgrounds for nearby search')
  return [
    {
      id: "mock-1",
      name: "Community Park Playground",
      lat: lat + 0.01,
      lon: lon + 0.01,
      address: "Park Road",
      city: "Local Area",
      amenities: ["Swings", "Slides", "Climbing Frame"],
      source: 'mock'
    },
    {
      id: "mock-2",
      name: "Recreation Ground Play Area", 
      lat: lat - 0.01,
      lon: lon - 0.01,
      address: "Recreation Ground",
      city: "Local Area",
      amenities: ["See-saw", "Spring Riders"],
      source: 'mock'
    }
  ]
}

function getMockPlaygroundsForLocation(location: string): PlaygroundData[] {
  console.log(`🎭 DEBUG: Generating mock playgrounds for location: ${location}`)
  
  const coords = location.toLowerCase().includes('m20') 
    ? { lat: 53.4351, lon: -2.2899 } // Didsbury area
    : { lat: 51.5074, lon: -0.1278 } // London default

  return [
    {
      id: `mock-${location}-1`,
      name: `${location} Community Playground`,
      lat: coords.lat + 0.008,
      lon: coords.lon + 0.012,
      address: `High Street, ${location}`,
      city: location,
      amenities: ["Swings", "Slides", "Climbing Frame"],
      source: 'mock'
    }
  ]
}