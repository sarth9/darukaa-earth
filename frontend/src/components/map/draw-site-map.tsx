"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { LngLatLike } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface DrawSiteMapProps {
  onPolygonChange: (polygon: GeoJSON.Polygon | null, centroid: { lat: number; lng: number } | null) => void;
}

type Point = [number, number];

function closeRing(points: Point[]): Point[] {
  if (points.length === 0) return [];
  const first = points[0];
  const last = points[points.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return points;
  return [...points, first];
}

function getCentroid(points: Point[]): { lat: number; lng: number } | null {
  if (points.length < 3) return null;
  const ring = closeRing(points);
  const unique = ring.slice(0, -1);

  const lng = unique.reduce((sum, [x]) => sum + x, 0) / unique.length;
  const lat = unique.reduce((sum, [, y]) => sum + y, 0) / unique.length;

  return { lat, lng };
}

export function DrawSiteMap({ onPolygonChange }: DrawSiteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [points, setPoints] = useState<Point[]>([]);

  const pointFeatureCollection = useMemo<GeoJSON.FeatureCollection<GeoJSON.Point>>(
    () => ({
      type: "FeatureCollection",
      features: points.map((point, index) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: point,
        },
        properties: {
          index,
        },
      })),
    }),
    [points]
  );

  const polygonFeatureCollection = useMemo<GeoJSON.FeatureCollection<GeoJSON.Geometry>>(() => {
    if (points.length < 3) {
      return { type: "FeatureCollection", features: [] };
    }

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [closeRing(points)],
          },
          properties: {},
        },
      ],
    };
  }, [points]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },
      center: [77.1025, 28.7041] as LngLatLike,
      zoom: 4.5,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      map.addSource("draw-points", {
        type: "geojson",
        data: pointFeatureCollection,
      });

      map.addSource("draw-polygon", {
        type: "geojson",
        data: polygonFeatureCollection,
      });

      map.addLayer({
        id: "draw-polygon-fill",
        type: "fill",
        source: "draw-polygon",
        paint: {
          "fill-color": "#22c55e",
          "fill-opacity": 0.3,
        },
      });

      map.addLayer({
        id: "draw-polygon-outline",
        type: "line",
        source: "draw-polygon",
        paint: {
          "line-color": "#166534",
          "line-width": 3,
        },
      });

      map.addLayer({
        id: "draw-points-circle",
        type: "circle",
        source: "draw-points",
        paint: {
          "circle-radius": 6,
          "circle-color": "#ef4444",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.on("click", (event) => {
        const nextPoints: Point[] = [...points, [event.lngLat.lng, event.lngLat.lat]];
        setPoints(nextPoints);
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [pointFeatureCollection, polygonFeatureCollection, points]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const pointsSource = map.getSource("draw-points") as maplibregl.GeoJSONSource | undefined;
    const polygonSource = map.getSource("draw-polygon") as maplibregl.GeoJSONSource | undefined;

    if (pointsSource) {
      pointsSource.setData(pointFeatureCollection);
    }

    if (polygonSource) {
      polygonSource.setData(polygonFeatureCollection);
    }

    if (points.length >= 3) {
      const polygon: GeoJSON.Polygon = {
        type: "Polygon",
        coordinates: [closeRing(points)],
      };

      onPolygonChange(polygon, getCentroid(points));
    } else {
      onPolygonChange(null, null);
    }
  }, [pointFeatureCollection, polygonFeatureCollection, points, onPolygonChange]);

  function handleUndo() {
    setPoints((prev) => prev.slice(0, -1));
  }

  function handleClear() {
    setPoints([]);
    onPolygonChange(null, null);
  }

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Draw site polygon</h3>
          <p className="text-sm text-slate-400">
            Click on the map to add points. Minimum 3 points needed.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUndo}
            className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-900"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-900"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
        <div ref={containerRef} className="h-[380px] w-full" />
      </div>

      <p className="text-xs text-slate-500">
        Points added: {points.length}. A polygon preview appears after 3 points.
      </p>
    </div>
  );
}