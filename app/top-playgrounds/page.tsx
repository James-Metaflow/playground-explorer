"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Star } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Playground {
  id: string
  name: string
  location: string
  average_rating: number
  total_ratings: number
}

export default function TopPlaygroundsPage() {
  const [playgrounds, setPlaygrounds] = useState<Playground[]>([])
  const [loading, setLoading] = useState(true)
  const [limit, setLimit] = useState(5)
  const [hasMore, setHasMore] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchPlaygrounds(limit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit])

  const fetchPlaygrounds = async (fetchLimit: number) => {
    setLoading(true)
    // Query playgrounds with at least one rating, sorted by average rating
    const { data, error } = await supabase
      .from('playgrounds')
      .select(`
        id,
        name,
        location,
        ratings:ratings(score)
      `)

    if (error) {
      setPlaygrounds([])
      setLoading(false)
      return
    }

    // Calculate average ratings and filter out playgrounds with no ratings
    const playgroundsWithRatings = (data as any[]).map(pg => {
      const ratings = pg.ratings as { score: number }[]
      const totalRatings = ratings.length
      const averageRating = totalRatings > 0
        ? ratings.reduce((sum, r) => sum + r.score, 0) / totalRatings
        : 0
      return {
        id: pg.id,
        name: pg.name,
        location: pg.location,
        average_rating: averageRating,
        total_ratings: totalRatings
      }
    }).filter(pg => pg.total_ratings > 0)

    // Sort and slice for pagination
    const sorted = playgroundsWithRatings
      .sort((a, b) => b.average_rating - a.average_rating || b.total_ratings - a.total_ratings)

    setPlaygrounds(sorted.slice(0, fetchLimit))
    setHasMore(sorted.length > fetchLimit)
    setLoading(false)
  }

  const handleSeeMore = () => {
    setLimit(l => l + 10)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-blue-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent text-center">
          Top Rated Playgrounds
        </h1>
        {loading ? (
          <div className="text-center text-lg text-orange-500">Loading...</div>
        ) : playgrounds.length === 0 ? (
          <div className="text-center text-gray-500">No rated playgrounds found yet.</div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {playgrounds.map((pg, idx) => (
                <Card
                  key={pg.id}
                  className="bg-white/80 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => router.push(`/playground/${pg.id}`)}
                >
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-pink-500">
                      <span className="text-white font-bold text-lg">#{idx + 1}</span>
                    </div>
                    <CardTitle className="text-lg">{pg.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-lg">{pg.average_rating.toFixed(1)}</span>
                      <span className="text-gray-500 text-sm">({pg.total_ratings} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                      <MapPin className="w-4 h-4" />
                      {pg.location}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {hasMore && (
              <div className="text-center">
                <Button
                  onClick={handleSeeMore}
                  className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
                >
                  See More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}