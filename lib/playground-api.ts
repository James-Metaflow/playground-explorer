// UK Playground data fetching utilities

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
}

// Fetch playgrounds from OpenStreetMap using Overpass API
export async function fetchPlaygroundsNearLocation(lat: number, lon: number, radiusKm = 10): Promise<PlaygroundData[]> {
  console.log(`🔍 Fetching playgrounds near ${lat}, ${lon} within ${radiusKm}km`)

  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["amenity"="playground"](around:${radiusKm * 1000},${lat},${lon});
      way["amenity"="playground"](around:${radiusKm * 1000},${lat},${lon});
      relation["amenity"="playground"](around:${radiusKm * 1000},${lat},${lon});
    );
    out center meta;
  `

  try {
    console.log("📡 Making request to Overpass API...")

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    })

    console.log("📡 Response status:", response.status, response.statusText)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()
    console.log("📊 Raw API response:", data)

    if (!data.elements || !Array.isArray(data.elements)) {
      console.warn("⚠️ No elements in response or invalid format")
      return []
    }

    const playgrounds = data.elements
      .map((element: any) => {
        const playground = {
          id: element.id.toString(),
          name: element.tags?.name || `Playground ${element.id}`,
          lat: element.lat || element.center?.lat,
          lon: element.lon || element.center?.lon,
          address: element.tags?.["addr:street"],
          city: element.tags?.["addr:city"],
          postcode: element.tags?.["addr:postcode"],
          amenities: extractAmenities(element.tags),
          surface: element.tags?.surface,
          access: element.tags?.access,
          opening_hours: element.tags?.opening_hours,
        }
        console.log("🏰 Processed playground:", playground)
        return playground
      })
      .filter((playground: PlaygroundData) => playground.lat && playground.lon)

    console.log(`✅ Found ${playgrounds.length} valid playgrounds`)
    return playgrounds
  } catch (error) {
    console.error("❌ Error fetching playgrounds:", error)

    // Return some mock data for testing if API fails
    console.log("🔄 Returning mock data for testing...")
    return getMockPlaygrounds(lat, lon)
  }
}

// Search playgrounds by location name (city, postcode, etc.)
export async function searchPlaygroundsByLocation(location: string): Promise<PlaygroundData[]> {
  console.log(`🔍 Searching playgrounds by location: "${location}"`)

  try {
    // First, get coordinates for the location using Nominatim
    console.log("📍 Geocoding location...")

    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&countrycodes=gb&limit=1`
    console.log("📡 Geocoding URL:", geocodeUrl)

    const geocodeResponse = await fetch(geocodeUrl, {
      headers: {
        "User-Agent": "PlaygroundExplorer/1.0 (https://playground-explorer.vercel.app)",
      },
    })

    console.log("📡 Geocoding response status:", geocodeResponse.status, geocodeResponse.statusText)

    if (!geocodeResponse.ok) {
      throw new Error(`Geocoding failed! status: ${geocodeResponse.status} - ${geocodeResponse.statusText}`)
    }

    const geocodeData = await geocodeResponse.json()
    console.log("📍 Geocoding result:", geocodeData)

    if (!geocodeData || geocodeData.length === 0) {
      console.log("❌ No location found for:", location)
      return []
    }

    const { lat, lon } = geocodeData[0]
    const numLat = Number.parseFloat(lat)
    const numLon = Number.parseFloat(lon)

    console.log(`✅ Found coordinates for ${location}:`, numLat, numLon)

    return fetchPlaygroundsNearLocation(numLat, numLon, 15)
  } catch (error) {
    console.error("❌ Error searching playgrounds by location:", error)

    // Return mock data for testing
    console.log("🔄 Returning mock data for testing...")
    return getMockPlaygroundsForLocation(location)
  }
}

// Get user's current location
export function getCurrentLocation(): Promise<{ lat: number; lon: number }> {
  console.log("📍 Getting user's current location...")

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.error("❌ Geolocation is not supported")
      reject(new Error("Geolocation is not supported"))
      return
    }

    console.log("📍 Requesting geolocation permission...")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        }
        console.log("✅ Got user location:", location)
        resolve(location)
      },
      (error) => {
        console.error("❌ Geolocation error:", error)
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    )
  })
}

// Extract amenities from OSM tags
function extractAmenities(tags: any): string[] {
  if (!tags) return []

  const amenities: string[] = []

  // Check for playground-specific equipment
  const equipmentTags = [
    "swing",
    "slide",
    "climbing_frame",
    "sandpit",
    "seesaw",
    "roundabout",
    "springy",
    "basketball_hoop",
    "table_tennis",
  ]

  equipmentTags.forEach((tag) => {
    if (tags[tag] === "yes") {
      amenities.push(tag.replace("_", " "))
    }
  })

  // Check playground tag for multiple equipment
  if (tags.playground) {
    const playgroundTypes = tags.playground.split(";")
    amenities.push(...playgroundTypes)
  }

  return amenities
}

// Calculate distance between two points
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Mock data for testing when APIs fail
function getMockPlaygrounds(lat: number, lon: number): PlaygroundData[] {
  return [
    {
      id: "mock-1",
      name: "Test Playground Near You",
      lat: lat + 0.01,
      lon: lon + 0.01,
      address: "Test Street",
      city: "Test City",
      amenities: ["swings", "slides", "climbing frame"],
    },
    {
      id: "mock-2",
      name: "Another Test Playground",
      lat: lat - 0.01,
      lon: lon - 0.01,
      address: "Another Test Street",
      city: "Test City",
      amenities: ["sandpit", "seesaw"],
    },
  ]
}

function getMockPlaygroundsForLocation(location: string): PlaygroundData[] {
  const mockCoords = location.toLowerCase().includes("london")
    ? { lat: 51.5074, lon: -0.1278 }
    : location.toLowerCase().includes("manchester")
      ? { lat: 53.4808, lon: -2.2426 }
      : { lat: 52.4862, lon: -1.8904 } // Birmingham default

  return [
    {
      id: `mock-${location}-1`,
      name: `${location} Test Playground`,
      lat: mockCoords.lat + 0.01,
      lon: mockCoords.lon + 0.01,
      address: `Test Street, ${location}`,
      city: location,
      amenities: ["swings", "slides", "climbing frame"],
    },
    {
      id: `mock-${location}-2`,
      name: `${location} Adventure Park`,
      lat: mockCoords.lat - 0.01,
      lon: mockCoords.lon - 0.01,
      address: `Adventure Road, ${location}`,
      city: location,
      amenities: ["zip line", "climbing wall", "sandpit"],
    },
  ]
}

