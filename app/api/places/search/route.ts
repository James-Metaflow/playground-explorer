// app/api/places/search/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const location = searchParams.get('location')
    const radius = searchParams.get('radius')
    const keyword = searchParams.get('keyword')
    const type = searchParams.get('type') || 'textSearch'

    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      )
    }

    let googleUrl: string
    let params: URLSearchParams

    if (type === 'nearbySearch' && location && radius) {
      // Nearby search
      googleUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
      params = new URLSearchParams({
        location: location,
        radius: radius,
        keyword: keyword || 'playground',
        type: 'park',
        key: apiKey
      })
    } else if (type === 'textSearch' && query) {
      // Text search
      googleUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
      params = new URLSearchParams({
        query: query,
        region: 'uk',
        key: apiKey
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid search parameters' },
        { status: 400 }
      )
    }

    console.log(`📡 Server: Making Google Places request to: ${googleUrl}`)
    console.log(`📡 Server: Parameters:`, Object.fromEntries(params.entries()))

    const response = await fetch(`${googleUrl}?${params}`)
    
    if (!response.ok) {
      console.error(`❌ Server: Google API HTTP error: ${response.status}`)
      return NextResponse.json(
        { error: `Google API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    console.log(`📊 Server: Google API response status: ${data.status}`)
    console.log(`📊 Server: Results count: ${data.results?.length || 0}`)

    if (data.error_message) {
      console.error(`❌ Server: Google API error: ${data.error_message}`)
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ Server: API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}