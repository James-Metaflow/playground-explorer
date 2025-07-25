import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    const countrycodes = searchParams.get('countrycodes')
    const limit = searchParams.get('limit') || '1'

    if (!q) {
      return NextResponse.json(
        { error: 'q (query) parameter is required' },
        { status: 400 }
      )
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      q
    )}&countrycodes=${countrycodes || ''}&limit=${limit}`

    // Nominatim requires a valid User-Agent
    const response = await fetch(url, {
      headers: { 'User-Agent': 'PlaygroundExplorer/1.0' }
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Nominatim error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Server: Geocode API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}