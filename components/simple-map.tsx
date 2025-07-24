"use client"

import { useEffect, useRef } from "react"
import type { PlaygroundData } from "@/lib/playground-api"

interface SimpleMapProps {
  center: [number, number]
  zoom?: number
  height?: string
  onLocationSelect?: (lat: number, lon: number) => void
  playgrounds?: PlaygroundData[]
  onPlaygroundClick?: (playground: PlaygroundData) => void
}

export default function SimpleMap({
  center,
  zoom = 13,
  height = "400px",
  onLocationSelect,
  playgrounds = [],
  onPlaygroundClick,
}: SimpleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

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

      // Create custom playground icon
      const playgroundIcon = L.divIcon({
        html: `<div style="
          background: linear-gradient(45deg, #f97316, #ec4899);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">🏰</div>`,
        className: "custom-playground-marker",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      // Add playground markers
      playgrounds.forEach((playground) => {
        const marker = L.marker([playground.lat, playground.lon], {
          icon: playgroundIcon,
        }).addTo(map)

        // Create popup content
        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${playground.name}</h3>
            ${playground.address ? `<p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${playground.address}</p>` : ""}
            ${playground.city ? `<p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${playground.city}</p>` : ""}
            ${
              playground.amenities && playground.amenities.length > 0
                ? `
              <div style="margin-bottom: 8px;">
                <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 500;">Equipment:</p>
                <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                  ${playground.amenities
                    .slice(0, 3)
                    .map(
                      (amenity) =>
                        `<span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${amenity}</span>`,
                    )
                    .join("")}
                </div>
              </div>
            `
                : ""
            }
            <button onclick="window.selectPlayground('${playground.id}')" style="
              width: 100%;
              background: linear-gradient(45deg, #f97316, #ec4899);
              color: white;
              border: none;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 12px;
              cursor: pointer;
              margin-top: 8px;
            ">View Details</button>
          </div>
        `

        marker.bindPopup(popupContent)

        // Add click handler
        marker.on("click", () => {
          if (onPlaygroundClick) {
            onPlaygroundClick(playground)
          }
        })

        markersRef.current.push(marker)
      })

      mapInstanceRef.current = map

      // Global function for popup button clicks
      ;(window as any).selectPlayground = (playgroundId: string) => {
        const playground = playgrounds.find((p) => p.id === playgroundId)
        if (playground && onPlaygroundClick) {
          onPlaygroundClick(playground)
        }
      }
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
      // Clean up global function
      delete (window as any).selectPlayground
    }
  }, [center, zoom, onLocationSelect, playgrounds, onPlaygroundClick])

  // Update map center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom)
    }
  }, [center, zoom])

  return (
    <div
      ref={mapRef}
      style={{ height, width: "100%" }}
      className="rounded-lg overflow-hidden border border-orange-200"
    />
  )
}

