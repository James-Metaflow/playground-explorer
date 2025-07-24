"use client"

import { useEffect, useRef } from "react"

interface SimpleMapProps {
  center: [number, number]
  zoom?: number
  height?: string
  onLocationSelect?: (lat: number, lon: number) => void
}

export default function SimpleMap({ center, zoom = 13, height = "400px", onLocationSelect }: SimpleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    // Dynamically import Leaflet only on client side
    import("leaflet").then((L) => {
      // Clean up existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }

      // Create new map
      const map = L.map(mapRef.current!).setView(center, zoom)

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Add click handler
      if (onLocationSelect) {
        map.on("click", (e: any) => {
          onLocationSelect(e.latlng.lat, e.latlng.lng)
        })
      }

      mapInstanceRef.current = map
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
    }
  }, [center, zoom, onLocationSelect])

  return (
    <div
      ref={mapRef}
      style={{ height, width: "100%" }}
      className="rounded-lg overflow-hidden border border-orange-200"
    />
  )
}
