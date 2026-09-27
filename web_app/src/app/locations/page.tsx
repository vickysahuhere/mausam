'use client';

import React, { useState } from 'react';
import { useLocationStore } from '../../store/useLocationStore';
import { useTheme } from '../../theme/ThemeProvider';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { searchCities, GeocodedLocation } from '../../lib/citySearch';

export default function LocationsPage() {
  const theme = useTheme();
  const locations = useLocationStore((s) => s.locations);
  const addLocation = useLocationStore((s) => s.addLocation);
  const removeLocation = useLocationStore((s) => s.removeLocation);
  const setDefaultLocation = useLocationStore((s) => s.setDefaultLocation);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodedLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const hits = await searchCities(query);
      setResults(hits);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddCity = (city: GeocodedLocation) => {
    addLocation({
      id: `loc-${Date.now()}-${city.id}`,
      label: city.displayName || city.name,
      lat: city.lat,
      lon: city.lon,
      isDefault: locations.length === 0,
    });
    setQuery('');
    setResults([]);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <Typography variant="h2" className="font-extrabold">
          Saved Cities & Locations
        </Typography>
        <Typography variant="caption" style={{ color: theme.colors.textSecondary }}>
          Manage your primary forecast station, commute paths, and saved travel destinations
        </Typography>
      </div>

      {/* City Search Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Icon
              name="search"
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Indian city, district, or pin (e.g. Pune, Jaipur, Rohini)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              style={{ borderColor: theme.colors.border }}
            />
          </div>
          <Button title="Search" loading={isSearching} />
        </form>

        {/* Search Results Dropdown */}
        {results.length > 0 && (
          <div className="mt-3 divide-y border-t pt-2" style={{ borderColor: theme.colors.border }}>
            <span className="text-xs font-semibold opacity-60 px-2 py-1 block">Search Results:</span>
            {results.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
              >
                <div>
                  <span className="text-sm font-bold block">{r.name}</span>
                  <span className="text-xs opacity-70 block">{r.displayName}</span>
                </div>
                <button
                  onClick={() => handleAddCity(r)}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                >
                  + Add City
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Saved Locations List */}
      <div>
        <Typography variant="h3" className="font-bold text-base mb-3">
          Your Saved Stations ({locations.length})
        </Typography>

        <div className="space-y-3">
          {locations.map((loc) => (
            <Card
              key={loc.id}
              className="p-4 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                  style={{
                    backgroundColor: loc.isDefault ? `${theme.colors.primary}25` : 'rgba(100,116,139,0.1)',
                    color: loc.isDefault ? theme.colors.primary : 'inherit',
                  }}
                >
                  <Icon name="map-pin" size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base">{loc.label}</span>
                    {loc.isDefault && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                        style={{
                          backgroundColor: `${theme.colors.primary}20`,
                          color: theme.colors.primary,
                        }}
                      >
                        Default Primary
                      </span>
                    )}
                  </div>
                  <span className="text-xs opacity-70 block">
                    {loc.lat.toFixed(3)}°N, {loc.lon.toFixed(3)}°E
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!loc.isDefault && (
                  <button
                    onClick={() => setDefaultLocation(loc.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    style={{ borderColor: theme.colors.border }}
                  >
                    Set as Primary
                  </button>
                )}

                {locations.length > 1 && (
                  <button
                    onClick={() => removeLocation(loc.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Delete location"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
