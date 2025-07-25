// app/api/places/details/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const placeId = searchParams.get('place_id')

    if (!placeId) {
      return NextResponse.json(
        { error: 'place_id parameter is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      )
    }

    const googleUrl = 'https://maps.googleapis.com/maps/api/place/details/json'
    const params = new URLSearchParams({
      place_id: placeId,
      fields: 'place_id,name,formatted_address,vicinity,geometry,rating,user_ratings_total,opening_hours,types,wheelchair_accessible_entrance,editorial_summary',
      key: apiKey
    })

    console.log(`📡 Server: Making Google Places Details request for: ${placeId}`)

    const response = await fetch(`${googleUrl}?${params}`)
    
    if (!response.ok) {
      console.error(`❌ Server: Google API HTTP error: ${response.status}`)
      return NextResponse.json(
        { error: `Google API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    console.log(`📊 Server: Google Places Details response status: ${data.status}`)

    if (data.error_message) {
      console.error(`❌ Server: Google API error: ${data.error_message}`)
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('❌ Server: Places details API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}