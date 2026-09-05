// Extensible Location Search Provider interface.
// Allows plugging in Open-Meteo Geocoding, Nominatim, or IMD geocoding in Phase 4
// without modifying UI components.

export interface GeocodedLocation {
  id: string;
  name: string; // Locality / Suburb / Town (e.g. "Mundka", "Rohini")
  locality?: string; // Area / District (e.g. "North West Delhi")
  city: string; // Major City (e.g. "Delhi")
  state: string; // State (e.g. "Delhi", "Maharashtra")
  country: string; // Country (e.g. "India")
  displayName: string; // Formatted hierarchy: "Mundka, North West Delhi, Delhi"
  lat: number;
  lon: number;
}

export interface LocationSearchProvider {
  search(query: string): Promise<GeocodedLocation[]>;
  reverseGeocode?(lat: number, lon: number): Promise<GeocodedLocation | null>;
}

// Curated Locality-Level Database supporting local neighborhood searches
const LOCALITY_DATABASE: GeocodedLocation[] = [
  // Delhi Localities
  {
    id: 'loc-del-mundka',
    name: 'Mundka',
    locality: 'West Delhi',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    displayName: 'Mundka, West Delhi, Delhi',
    lat: 28.6836,
    lon: 77.0315,
  },
  {
    id: 'loc-del-rohini',
    name: 'Rohini',
    locality: 'North West Delhi',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    displayName: 'Rohini, North West Delhi, Delhi',
    lat: 28.7495,
    lon: 77.0565,
  },
  {
    id: 'loc-del-dwarka',
    name: 'Dwarka',
    locality: 'South West Delhi',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    displayName: 'Dwarka, South West Delhi, Delhi',
    lat: 28.5921,
    lon: 77.046,
  },
  {
    id: 'loc-del-saket',
    name: 'Saket',
    locality: 'South Delhi',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    displayName: 'Saket, South Delhi, Delhi',
    lat: 28.5244,
    lon: 77.2167,
  },
  {
    id: 'loc-del-janakpuri',
    name: 'Janakpuri',
    locality: 'West Delhi',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    displayName: 'Janakpuri, West Delhi, Delhi',
    lat: 28.6219,
    lon: 77.0878,
  },
  {
    id: 'loc-del-lajpat',
    name: 'Lajpat Nagar',
    locality: 'South East Delhi',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    displayName: 'Lajpat Nagar, South East Delhi, Delhi',
    lat: 28.5677,
    lon: 77.2433,
  },
  {
    id: 'loc-del-cp',
    name: 'Connaught Place',
    locality: 'Central Delhi',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    displayName: 'Connaught Place, Central Delhi, Delhi',
    lat: 28.6315,
    lon: 77.2167,
  },
  {
    id: 'loc-del-karolbagh',
    name: 'Karol Bagh',
    locality: 'Central Delhi',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    displayName: 'Karol Bagh, Central Delhi, Delhi',
    lat: 28.6514,
    lon: 77.1907,
  },
  {
    id: 'loc-del-hauzkhas',
    name: 'Hauz Khas',
    locality: 'South Delhi',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    displayName: 'Hauz Khas, South Delhi, Delhi',
    lat: 28.5494,
    lon: 77.2001,
  },
  {
    id: 'loc-del-pitampura',
    name: 'Pitampura',
    locality: 'North West Delhi',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    displayName: 'Pitampura, North West Delhi, Delhi',
    lat: 28.7037,
    lon: 77.1323,
  },
  {
    id: 'loc-del-paschim',
    name: 'Paschim Vihar',
    locality: 'West Delhi',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    displayName: 'Paschim Vihar, West Delhi, Delhi',
    lat: 28.6692,
    lon: 77.0949,
  },
  {
    id: 'loc-del-vasantkunj',
    name: 'Vasant Kunj',
    locality: 'South West Delhi',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    displayName: 'Vasant Kunj, South West Delhi, Delhi',
    lat: 28.5204,
    lon: 77.1565,
  },
  {
    id: 'loc-del-newdelhi',
    name: 'New Delhi',
    locality: 'New Delhi District',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    displayName: 'New Delhi, Delhi',
    lat: 28.6139,
    lon: 77.209,
  },

  // Mumbai Localities
  {
    id: 'loc-bom-bandra',
    name: 'Bandra',
    locality: 'Mumbai Suburban',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    displayName: 'Bandra, Mumbai Suburban, Maharashtra',
    lat: 19.0596,
    lon: 72.8295,
  },
  {
    id: 'loc-bom-andheri',
    name: 'Andheri',
    locality: 'Western Suburbs',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    displayName: 'Andheri, Western Suburbs, Mumbai',
    lat: 19.1136,
    lon: 72.8697,
  },
  {
    id: 'loc-bom-powai',
    name: 'Powai',
    locality: 'Eastern Suburbs',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    displayName: 'Powai, Mumbai Suburban, Maharashtra',
    lat: 19.1176,
    lon: 72.906,
  },
  {
    id: 'loc-bom-juhu',
    name: 'Juhu',
    locality: 'Western Suburbs',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    displayName: 'Juhu, Western Suburbs, Mumbai',
    lat: 19.0988,
    lon: 72.8264,
  },
  {
    id: 'loc-bom-colaba',
    name: 'Colaba',
    locality: 'South Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    displayName: 'Colaba, South Mumbai, Maharashtra',
    lat: 18.9067,
    lon: 72.8147,
  },

  // Bengaluru Localities
  {
    id: 'loc-blr-koramangala',
    name: 'Koramangala',
    locality: 'South Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    displayName: 'Koramangala, South Bengaluru, Karnataka',
    lat: 12.9352,
    lon: 77.6245,
  },
  {
    id: 'loc-blr-indiranagar',
    name: 'Indiranagar',
    locality: 'East Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    displayName: 'Indiranagar, East Bengaluru, Karnataka',
    lat: 12.9784,
    lon: 77.6408,
  },
  {
    id: 'loc-blr-whitefield',
    name: 'Whitefield',
    locality: 'East Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    displayName: 'Whitefield, East Bengaluru, Karnataka',
    lat: 12.9698,
    lon: 77.75,
  },
  {
    id: 'loc-blr-hsr',
    name: 'HSR Layout',
    locality: 'South East Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    displayName: 'HSR Layout, South East Bengaluru, Karnataka',
    lat: 12.9121,
    lon: 77.6446,
  },

  // Major Metros & Cities
  {
    id: 'loc-chn-chennai',
    name: 'Chennai',
    locality: 'Chennai District',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    displayName: 'Chennai, Tamil Nadu',
    lat: 13.0827,
    lon: 80.2707,
  },
  {
    id: 'loc-ccu-kolkata',
    name: 'Kolkata',
    locality: 'Kolkata District',
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    displayName: 'Kolkata, West Bengal',
    lat: 22.5726,
    lon: 88.3639,
  },
  {
    id: 'loc-hyd-hyderabad',
    name: 'Hyderabad',
    locality: 'Hyderabad District',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    displayName: 'Hyderabad, Telangana',
    lat: 17.385,
    lon: 78.4867,
  },
  {
    id: 'loc-pnq-pune',
    name: 'Pune',
    locality: 'Pune District',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    displayName: 'Pune, Maharashtra',
    lat: 18.5204,
    lon: 73.8567,
  },
  {
    id: 'loc-amd-ahmedabad',
    name: 'Ahmedabad',
    locality: 'Ahmedabad District',
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    displayName: 'Ahmedabad, Gujarat',
    lat: 23.0225,
    lon: 72.5714,
  },
  {
    id: 'loc-jpr-jaipur',
    name: 'Jaipur',
    locality: 'Jaipur District',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    displayName: 'Jaipur, Rajasthan',
    lat: 26.9124,
    lon: 75.7873,
  },
  {
    id: 'loc-lko-lucknow',
    name: 'Lucknow',
    locality: 'Lucknow District',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    country: 'India',
    displayName: 'Lucknow, Uttar Pradesh',
    lat: 26.8467,
    lon: 80.9462,
  },
  {
    id: 'loc-ixc-chandigarh',
    name: 'Chandigarh',
    locality: 'Chandigarh Capital',
    city: 'Chandigarh',
    state: 'Chandigarh',
    country: 'India',
    displayName: 'Chandigarh, India',
    lat: 30.7333,
    lon: 76.7794,
  },
];

// Default Provider implementing the clean search interface with Open-Meteo Geocoding fallback
class HybridLocalityProvider implements LocationSearchProvider {
  async search(query: string): Promise<GeocodedLocation[]> {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();

    // 1. Search local curated database (instant response)
    const localMatches = LOCALITY_DATABASE.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        (loc.locality && loc.locality.toLowerCase().includes(q)) ||
        loc.city.toLowerCase().includes(q) ||
        loc.state.toLowerCase().includes(q)
    );

    if (localMatches.length >= 4) {
      return localMatches.slice(0, 10);
    }

    // 2. Fetch from Open-Meteo Geocoding API if online
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          const apiMatches: GeocodedLocation[] = data.results.map((r: any) => {
            const parts = [r.admin2 || r.name, r.admin1, r.country].filter(Boolean);
            const hierarchy = parts.join(', ');
            return {
              id: `om-${r.id}`,
              name: r.name,
              locality: r.admin2,
              city: r.admin1 || r.name,
              state: r.admin1 || '',
              country: r.country || 'India',
              displayName: hierarchy ? `${r.name}, ${hierarchy}` : r.name,
              lat: r.latitude,
              lon: r.longitude,
            };
          });

          // Merge local and API matches avoiding duplicate coordinates
          const combined = [...localMatches];
          for (const item of apiMatches) {
            const exists = combined.some(
              (c) => Math.abs(c.lat - item.lat) < 0.01 && Math.abs(c.lon - item.lon) < 0.01
            );
            if (!exists) {
              combined.push(item);
            }
          }
          return combined.slice(0, 10);
        }
      }
    } catch {
      // Fall back to local matches gracefully
    }

    return localMatches.slice(0, 10);
  }
}

// Active provider instance
let activeLocationProvider: LocationSearchProvider = new HybridLocalityProvider();

export function setLocationSearchProvider(provider: LocationSearchProvider) {
  activeLocationProvider = provider;
}

export async function searchCities(query: string): Promise<GeocodedLocation[]> {
  return activeLocationProvider.search(query);
}

