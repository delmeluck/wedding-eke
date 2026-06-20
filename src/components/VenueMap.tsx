'use client'

import { useState } from 'react'
import { MapPin, Navigation, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'

interface VenueMapProps {
  name: string
  address: string
  city?: string
  mapLink?: string
  coordinates?: string  // "lat,lng"
  type?: string
}

/**
 * VenueMap — shows an embedded Google Maps iframe for the venue
 * and provides "Get Directions" links.
 * No API key required for iframe embeds or directions links.
 */
export function VenueMap({ name, address, city, mapLink, coordinates, type }: VenueMapProps) {
  const [expanded, setExpanded] = useState(false)

  // Build Google Maps embed URL
  const buildEmbedUrl = () => {
    const fullAddress = [name, address, city, 'Ghana'].filter(Boolean).join(', ')
    if (coordinates) {
      const [lat, lng] = coordinates.split(',').map(s => s.trim())
      if (lat && lng) {
        return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`
      }
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`
  }

  // Build Google Maps directions URL (opens in new tab)
  const buildDirectionsUrl = () => {
    if (mapLink) return mapLink
    if (coordinates) {
      const [lat, lng] = coordinates.split(',').map(s => s.trim())
      if (lat && lng) return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    }
    const fullAddress = [name, address, city, 'Ghana'].filter(Boolean).join(', ')
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
  }

  // Build Apple Maps URL (alternative for iOS users)
  const buildAppleMapsUrl = () => {
    if (coordinates) {
      const [lat, lng] = coordinates.split(',').map(s => s.trim())
      if (lat && lng) return `maps://maps.apple.com/?daddr=${lat},${lng}`
    }
    const fullAddress = [name, address, city, 'Ghana'].filter(Boolean).join(', ')
    return `maps://maps.apple.com/?q=${encodeURIComponent(fullAddress)}`
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-purple-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-purple-50 border-b border-purple-100">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-purple-600 flex-shrink-0" />
          <span className="text-sm font-medium text-purple-800 truncate">{name}</span>
          {type && (
            <span className="text-xs text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full capitalize">
              {type}
            </span>
          )}
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-purple-500 hover:text-purple-700 p-1 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1 text-xs font-medium"
        >
          {expanded ? (
            <><ChevronUp size={14} /> Hide Map</>
          ) : (
            <><ChevronDown size={14} /> Show Map</>
          )}
        </button>
      </div>

      {/* Address */}
      <div className="px-4 py-3 flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm text-gray-700 font-medium">{address}</p>
          {city && <p className="text-xs text-gray-500 mt-0.5">{city}, Ghana</p>}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <a
            href={buildDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Navigation size={12} /> Get Directions
          </a>
          <a
            href={`https://maps.google.com/maps?q=${encodeURIComponent([name, address, city, 'Ghana'].filter(Boolean).join(', '))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 text-xs rounded-lg transition-colors"
            title="Open in Google Maps"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Expandable Map Iframe */}
      {expanded && (
        <div className="relative">
          <iframe
            src={buildEmbedUrl()}
            width="100%"
            height="280"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map of ${name}`}
            className="block"
          />
          <div className="absolute bottom-2 right-2">
            <a
              href={buildAppleMapsUrl()}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs rounded-lg shadow border border-gray-200 hover:bg-white transition-colors"
            >
              🍎 Apple Maps
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── VenueMapCard — dark variant for program page ──────── */
export function VenueMapCard({
  name, address, city, mapLink, coordinates, type,
}: VenueMapProps) {
  const buildDirectionsUrl = () => {
    if (mapLink) return mapLink
    if (coordinates) {
      const [lat, lng] = coordinates.split(',').map(s => s.trim())
      if (lat && lng) return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    }
    const fullAddress = [name, address, city, 'Ghana'].filter(Boolean).join(', ')
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
  }

  const buildEmbedUrl = () => {
    const fullAddress = [name, address, city, 'Ghana'].filter(Boolean).join(', ')
    if (coordinates) {
      const [lat, lng] = coordinates.split(',').map(s => s.trim())
      if (lat && lng) return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
      {/* Map */}
      <div className="relative h-48">
        <iframe
          src={buildEmbedUrl()}
          width="100%"
          height="100%"
          style={{ border: 0, filter: 'brightness(0.85) saturate(0.8)' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map of ${name}`}
          className="block w-full h-full"
        />
        {/* Type badge */}
        {type && (
          <div className="absolute top-2 left-2">
            <span className="text-xs text-white bg-purple-800/80 backdrop-blur-sm px-2 py-0.5 rounded-full capitalize">
              {type}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-serif text-lg text-white mb-1">{name}</h3>
        <p className="text-lavender-300/80 text-sm mb-3">{address}{city ? `, ${city}` : ''}</p>
        <div className="flex gap-2">
          <a
            href={buildDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold text-purple-950 text-xs font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
          >
            <Navigation size={12} /> Get Directions
          </a>
          <a
            href={`https://maps.google.com/maps?q=${encodeURIComponent([name, address, city, 'Ghana'].filter(Boolean).join(', '))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors"
          >
            <ExternalLink size={12} /> View Map
          </a>
        </div>
      </div>
    </div>
  )
}
