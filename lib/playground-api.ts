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
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return data.elements
      .map((element: any) => ({
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
      }))
      .filter((playground: PlaygroundData) => playground.lat && playground.lon)
  } catch (error) {
    console.error("Error fetching playgrounds:", error)
    return []
  }
}

// Search playgrounds by location name (city, postcode, etc.)
export async function searchPlaygroundsByLocation(location: string): Promise<PlaygroundData[]> {
  try {
    // First, get coordinates for the location using Nominatim
    const geocodeResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&countrycodes=gb&limit=1`,
    )

    if (!geocodeResponse.ok) {
      throw new Error(`Geocoding failed! status: ${geocodeResponse.status}`)
    }

    const geocodeData = await geocodeResponse.json()

    if (geocodeData.length === 0) {
      console.log("No location found for:", location)
      return []
    }

    const { lat, lon } = geocodeData[0]
    console.log(`Found coordinates for ${location}:`, lat, lon)

    return fetchPlaygroundsNearLocation(Number.parseFloat(lat), Number.parseFloat(lon), 15)
  } catch (error) {
    console.error("Error searching playgrounds by location:", error)
    return []
  }
}

// Get user's current location
export function getCurrentLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
      },
      (error) => {
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
