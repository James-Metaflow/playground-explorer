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

  // Try multiple queries with different approaches
  const queries = [
    // Query 1: Standard playground amenity
    `
    [out:json][timeout:25];
    (
      node["amenity"="playground"](around:${radiusKm * 1000},${lat},${lon});
      way["amenity"="playground"](around:${radiusKm * 1000},${lat},${lon});
      relation["amenity"="playground"](around:${radiusKm * 1000},${lat},${lon});
    );
    out center meta;
    `,
    // Query 2: Leisure areas that might include playgrounds
    `
    [out:json][timeout:25];
    (
      node["leisure"="playground"](around:${radiusKm * 1000},${lat},${lon});
      way["leisure"="playground"](around:${radiusKm * 1000},${lat},${lon});
      relation["leisure"="playground"](around:${radiusKm * 1000},${lat},${lon});
    );
    out center meta;
    `,
    // Query 3: Parks that might contain playgrounds
    `
    [out:json][timeout:25];
    (
      node["leisure"="park"]["playground"](around:${radiusKm * 1000},${lat},${lon});
      way["leisure"="park"]["playground"](around:${radiusKm * 1000},${lat},${lon});
      node["leisure"="recreation_ground"](around:${radiusKm * 1000},${lat},${lon});
      way["leisure"="recreation_ground"](around:${radiusKm * 1000},${lat},${lon});
    );
    out center meta;
    `,
    // Query 4: Broader search for any playground-related tags
    `
    [out:json][timeout:25];
    (
      node[~"playground"~"."](around:${radiusKm * 1000},${lat},${lon});
      way[~"playground"~"."](around:${radiusKm * 1000},${lat},${lon});
      node["play_area"="yes"](around:${radiusKm * 1000},${lat},${lon});
      way["play_area"="yes"](around:${radiusKm * 1000},${lat},${lon});
    );
    out center meta;
    `,
  ]

  const allPlaygrounds: PlaygroundData[] = []

  for (let i = 0; i < queries.length; i++) {
    try {
      console.log(`📡 Trying query ${i + 1}/${queries.length}...`)

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `data=${encodeURIComponent(queries[i])}`,
      })

      console.log(`📡 Query ${i + 1} response status:`, response.status, response.statusText)

      if (!response.ok) {
        console.warn(`⚠️ Query ${i + 1} failed:`, response.status, response.statusText)
        continue
      }

      const data = await response.json()
      console.log(`📊 Query ${i + 1} raw response:`, data)

      if (data.elements && Array.isArray(data.elements) && data.elements.length > 0) {
        const playgrounds = data.elements.map(async (element: any) => {
          const name =
            element.tags?.name ||
            element.tags?.["name:en"] ||
            element.tags?.description ||
            `${getPlaygroundType(element.tags)} ${element.id}`

          // Try to get address from tags
          let address = element.tags?.["addr:street"] || element.tags?.["addr:full"]
          let city = element.tags?.["addr:city"] || element.tags?.["addr:town"]
          let postcode = element.tags?.["addr:postcode"]

          // If address is missing, try reverse geocoding
          if (!address && element.lat && element.lon) {
            try {
              const reverseGeocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${element.lat}&lon=${element.lon}`
              const reverseGeocodeResponse = await fetch(reverseGeocodeUrl, {
                headers: {
                  "User-Agent": "PlaygroundExplorer/1.0 (https://playground-explorer.vercel.app)",
                },
              })
              const reverseGeocodeData = await reverseGeocodeResponse.json()

              if (reverseGeocodeData?.address) {
                address = reverseGeocodeData.address.road || reverseGeocodeData.address.neighbourhood
                city = reverseGeocodeData.address.city || reverseGeocodeData.address.town
                postcode = reverseGeocodeData.address.postcode
                console.log(`✅ Reverse geocoding success for ${name}:`, reverseGeocodeData.address)
              }
            } catch (geocodeError) {
              console.warn(`⚠️ Reverse geocoding failed for ${name}:`, geocodeError)
            }
          }

          const playground = {
            id: `${element.type}-${element.id}`,
            name: name,
            lat: element.lat || element.center?.lat,
            lon: element.lon || element.center?.lon,
            address: address,
            city: city,
            postcode: postcode,
            amenities: extractAmenities(element.tags),
            surface: element.tags?.surface,
            access: element.tags?.access,
            opening_hours: element.tags?.opening_hours,
          }
          console.log(`🏰 Query ${i + 1} processed playground:`, playground)
          return playground
        })

        // Resolve all promises before filtering
        const resolvedPlaygrounds = await Promise.all(playgrounds)

        const validPlaygrounds = resolvedPlaygrounds.filter(
          (playground: PlaygroundData) => playground.lat && playground.lon,
        )

        console.log(`✅ Query ${i + 1} found ${validPlaygrounds.length} valid playgrounds`)
        allPlaygrounds.push(...validPlaygrounds)

        // If we found some results, we can stop here or continue to get more
        if (validPlaygrounds.length > 0) {
          console.log(`🎉 Found playgrounds with query ${i + 1}, continuing to search for more...`)
        }
      } else {
        console.log(`📭 Query ${i + 1} returned no elements`)
      }

      // Small delay between queries to be nice to the API
      if (i < queries.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error(`❌ Query ${i + 1} error:`, error)
      continue
    }
  }

  // Remove duplicates based on coordinates (same playground might be found by multiple queries)
  const uniquePlaygrounds = allPlaygrounds.filter((playground, index, self) => {
    const firstIndex = self.findIndex(
      (p) => Math.abs(p.lat - playground.lat) < 0.0001 && Math.abs(p.lon - playground.lon) < 0.0001,
    )
    return index === firstIndex
  })

  console.log(`🎯 Total unique playgrounds found: ${uniquePlaygrounds.length}`)

  // If still no results, try a much broader search
  if (uniquePlaygrounds.length === 0) {
    console.log("🔄 No playgrounds found, trying broader search...")
    return await tryBroaderSearch(lat, lon, radiusKm * 2)
  }

  return uniquePlaygrounds
}

// Try a much broader search with different terms
async function tryBroaderSearch(lat: number, lon: number, radiusKm: number): Promise<PlaygroundData[]> {
  console.log(`🔍 Trying broader search within ${radiusKm}km`)

  const broadQuery = `
    [out:json][timeout:30];
    (
      node["amenity"="playground"](around:${radiusKm * 1000},${lat},${lon});
      way["amenity"="playground"](around:${radiusKm * 1000},${lat},${lon});
      node["leisure"="playground"](around:${radiusKm * 1000},${lat},${lon});
      way["leisure"="playground"](around:${radiusKm * 1000},${lat},${lon});
      node["leisure"="park"](around:${radiusKm * 1000},${lat},${lon});
      way["leisure"="park"](around:${radiusKm * 1000},${lat},${lon});
      node["leisure"="recreation_ground"](around:${radiusKm * 1000},${lat},${lon});
      way["leisure"="recreation_ground"](around:${radiusKm * 1000},${lat},${lon});
    );
    out center meta;
  `

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `data=${encodeURIComponent(broadQuery)}`,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("📊 Broader search response:", data)

    if (data.elements && data.elements.length > 0) {
      const playgrounds = data.elements
        .map((element: any) => ({
          id: `broad-${element.type}-${element.id}`,
          name: element.tags?.name || element.tags?.["name:en"] || `${getPlaygroundType(element.tags)} ${element.id}`,
          lat: element.lat || element.center?.lat,
          lon: element.lon || element.center?.lon,
          address: element.tags?.["addr:street"],
          city: element.tags?.["addr:city"] || element.tags?.["addr:town"],
          postcode: element.tags?.["addr:postcode"],
          amenities: extractAmenities(element.tags),
          surface: element.tags?.surface,
          access: element.tags?.access,
          opening_hours: element.tags?.opening_hours,
        }))
        .filter((playground: PlaygroundData) => playground.lat && playground.lon)

      console.log(`✅ Broader search found ${playgrounds.length} results`)
      return playgrounds
    }
  } catch (error) {
    console.error("❌ Broader search failed:", error)
  }

  // If everything fails, return mock data so the UI works
  console.log("🔄 All searches failed, returning mock data for testing...")
  return getMockPlaygrounds(lat, lon)
}

// Determine playground type from tags
function getPlaygroundType(tags: any): string {
  if (!tags) return "Playground"

  if (tags.amenity === "playground") return "Playground"
  if (tags.leisure === "playground") return "Play Area"
  if (tags.leisure === "park") return "Park"
  if (tags.leisure === "recreation_ground") return "Recreation Ground"
  if (tags.play_area === "yes") return "Play Area"

  return "Playground"
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

    // Use a larger radius for location searches
    return fetchPlaygroundsNearLocation(numLat, numLon, 25)
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

  // Add general amenities based on leisure type
  if (tags.leisure === "park") {
    amenities.push("Park")
  }
  if (tags.leisure === "recreation_ground") {
    amenities.push("Recreation Ground")
  }
  if (tags.sport) {
    amenities.push(tags.sport)
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

// Mock data for testing when APIs fail or return no results
function getMockPlaygrounds(lat: number, lon: number): PlaygroundData[] {
  console.log("🎭 Generating mock playgrounds for testing...")

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
    {
      id: "mock-3",
      name: "Adventure Test Park",
      lat: lat + 0.005,
      lon: lon - 0.005,
      address: "Adventure Avenue",
      city: "Test City",
      amenities: ["zip line", "climbing wall", "basketball hoop"],
    },
  ]
}

function getMockPlaygroundsForLocation(location: string): PlaygroundData[] {
  console.log(`🎭 Generating mock playgrounds for ${location}...`)

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
    {
      id: `mock-${location}-3`,
      name: `${location} Family Play Area`,
      lat: mockCoords.lat + 0.005,
      lon: mockCoords.lon - 0.005,
      address: `Family Lane, ${location}`,
      city: location,
      amenities: ["toddler area", "picnic tables", "benches"],
    },
  ]
}



