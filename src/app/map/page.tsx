'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography } from '@vnedyalk0v/react19-simple-maps';
import { feature as topojsonFeature } from 'topojson-client';

import type {
  Feature,
  FeatureCollection,
  Geometry,
  LineString,
  MultiLineString,
  Polygon,
  MultiPolygon,
} from 'geojson';

import { lineString } from '@turf/helpers';

/* -------------------------------------------------------------------------- */
/* Config                                                                     */
/* -------------------------------------------------------------------------- */

const STATES_URL = 'https://unpkg.com/us-atlas@3/states-10m.json';
const DIVIDE_URL = '/continental-divide-us.geojson'; // must be in /public

// Add near the other config/constants
const WESTERN_STATE_NAMES = new Set([
  'Washington',
  'Oregon',
  'California',
  'Idaho',
  'Nevada',
  'Arizona',
  'Utah',
  'Montana',
  'Wyoming',
  'Colorado',
  'New Mexico',
]);


/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Heuristic: detect if coords look like [lat, lon] (swapped) and if so, swap them. */
function maybeFixLatLon<T extends Feature<LineString> | FeatureCollection>(geo: T): T {
  const coordsToTest: number[][] = [];
  const pushCoords = (c: number[][]) => {
    for (const p of c) {
      coordsToTest.push(p);
      if (coordsToTest.length > 500) break; // enough for a heuristic
    }
  };

  if ((geo as any).type === 'Feature' && (geo as any).geometry?.type === 'LineString') {
    pushCoords(((geo as any).geometry as LineString).coordinates);
  } else if ((geo as any).type === 'FeatureCollection') {
    for (const f of (geo as any).features as Feature<Geometry>[]) {
      if (!f?.geometry) continue;
      if (f.geometry.type === 'LineString') {
        pushCoords(f.geometry.coordinates as number[][]);
      } else if (f.geometry.type === 'MultiLineString') {
        for (const seg of (f.geometry as MultiLineString).coordinates) pushCoords(seg);
      }
      if (coordsToTest.length > 500) break;
    }
  }

  if (coordsToTest.length === 0) return geo;

  // Count how many points look like lat,lon (first value within [-90,90], second within [-180,180])
  let swappedLike = 0;
  let normalLike = 0;
  for (const [a, b] of coordsToTest) {
    const firstLooksLat = a >= -90 && a <= 90;
    const secondLooksLon = b >= -180 && b <= 180;
    const firstLooksLon = a >= -180 && a <= 180;
    const secondLooksLat = b >= -90 && b <= 90;
    if (firstLooksLat && secondLooksLon && !(firstLooksLon && secondLooksLat)) swappedLike++;
    if (firstLooksLon && secondLooksLat) normalLike++;
  }

  if (swappedLike > normalLike * 1.5) {
    // Swap everywhere
    const swapInPlace = (arr: number[][]) => {
      for (const p of arr) {
        const tmp = p[0];
        p[0] = p[1];
        p[1] = tmp;
      }
    };

    const clone: any = JSON.parse(JSON.stringify(geo));
    if (clone.type === 'Feature' && clone.geometry?.type === 'LineString') {
      swapInPlace(clone.geometry.coordinates);
    } else if (clone.type === 'FeatureCollection') {
      for (const f of clone.features as Feature<Geometry>[]) {
        if (!f?.geometry) continue;
        if (f.geometry.type === 'LineString') {
          swapInPlace((f.geometry as LineString).coordinates);
        } else if (f.geometry.type === 'MultiLineString') {
          for (const seg of (f.geometry as MultiLineString).coordinates) swapInPlace(seg);
        }
      }
    }
    // eslint-disable-next-line no-console
    console.warn(' continental-divide-us.geojson appeared to be [lat,lon]; auto-swapped to [lon,lat].');
    return clone as T;
  }

  return geo;
}

/** Return ALL LineString features from the input (Feature or FeatureCollection). */
function explodeDivideToLineStrings(g: any): Feature<LineString>[] {
  const out: Feature<LineString>[] = [];

  if (!g) return out;
  if (g.type === 'Feature' && g.geometry?.type === 'LineString') {
    out.push(g as Feature<LineString>);
    return out;
  }

  if (g.type === 'FeatureCollection') {
    for (const f of g.features as Feature<Geometry>[]) {
      if (!f?.geometry) continue;
      if (f.geometry.type === 'LineString') {
        out.push(f as Feature<LineString>);
      } else if (f.geometry.type === 'MultiLineString') {
        for (const seg of (f.geometry as MultiLineString).coordinates) {
          out.push(lineString(seg));
        }
      }
    }
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function USWithDivideAllSegments() {
  const [statesTopo, setStatesTopo] = useState<any | null>(null);
  const [divideLines, setDivideLines] = useState<Feature<LineString>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [statesRes, divideRes] = await Promise.all([
          fetch(STATES_URL, { signal: ac.signal }),
          fetch(DIVIDE_URL, { signal: ac.signal }),
        ]);
        if (!statesRes.ok) throw new Error(`States TopoJSON HTTP ${statesRes.status}`);
        if (!divideRes.ok) throw new Error(`Divide GeoJSON HTTP ${divideRes.status}`);

        const [statesTopoJson, divideRaw0] = await Promise.all([
          statesRes.json(),
          divideRes.json(),
        ]);

        // maybe fix lat/lon, then explode all segments
        const divideRaw = maybeFixLatLon(divideRaw0);
        const lines = explodeDivideToLineStrings(divideRaw);

        // Basic diagnostics
        const allCoords = lines.flatMap((f) => f.geometry.coordinates);
        const lons = allCoords.map(([x]) => x);
        const lats = allCoords.map(([, y]) => y);
        const bbox = {
          minLon: Math.min(...lons),
          maxLon: Math.max(...lons),
          minLat: Math.min(...lats),
          maxLat: Math.max(...lats),
        };
        // eslint-disable-next-line no-console
        console.log(`Divide segments: ${lines.length}`, 'bbox:', bbox);

        setStatesTopo(statesTopoJson);
        setDivideLines(lines);
      } catch (e: any) {
        if (e?.name !== 'AbortError') setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

	const statesFC = useMemo<FeatureCollection<Polygon | MultiPolygon> | null>(() => {
		if (!statesTopo?.objects?.states) return null;

		const fc = topojsonFeature(
			statesTopo,
			statesTopo.objects.states
		) as unknown as FeatureCollection<Polygon | MultiPolygon>;

		// Keep only the target states
		const filtered = {
			type: 'FeatureCollection',
			features: fc.features.filter(
				(f: any) => f?.properties && WESTERN_STATE_NAMES.has(f.properties.name as string)
			),
		} as FeatureCollection<Polygon | MultiPolygon>;

		return filtered;
	}, [statesTopo]);


  // Build a FeatureCollection of ALL divide segments for Geographies
  const divideFC = useMemo<FeatureCollection | null>(() => {
    if (!divideLines) return null;
    return {
      type: 'FeatureCollection',
      features: divideLines,
    } as FeatureCollection;
  }, [divideLines]);

return (
  <main className="flex h-screen w-screen items-center justify-center bg-white">
    <ComposableMap
      projection="geoAlbersUsa"
      width={900}
      height={520}
      className="w-full max-w-5xl"
    >
      {/* Base states */}
      {statesFC && (
        <Geographies geography={statesFC as unknown as any}>
          {({ geographies }) =>
            geographies.map((geo, i) => (
              <Geography
                key={`state-${String(geo.id ?? 'x')}-${i}`}
                geography={geo}
                style={{
                  default: { fill: '#eef2f7', stroke: '#94a3b8', strokeWidth: 0.8 },
                }}
                tabIndex={-1}
              />
            ))
          }
        </Geographies>
      )}

      {/* Continental Divide */}
      {divideFC && (
        <Geographies geography={divideFC}>
          {({ geographies }) =>
            geographies.map((geo, i) => (
              <Geography
                key={`divide-${i}`}
                geography={geo}
                style={{
                  default: { fill: 'none', stroke: '#ef4444', strokeWidth: 2 },
                }}
                tabIndex={-1}
              />
            ))
          }
        </Geographies>
      )}
    </ComposableMap>
  </main>
);

}
