import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-blue-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center mb-4 mx-auto">
          <span className="text-white font-bold text-2xl">🏰</span>
        </div>
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
        <h2 className="text-xl font-semibold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-2">
          PlaygroundExplorer
        </h2>
        <p className="text-gray-600">Loading amazing playgrounds...</p>
      </div>
    </div>
  )
}