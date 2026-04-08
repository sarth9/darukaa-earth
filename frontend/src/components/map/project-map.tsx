"use client";

import { useEffect, useMemo, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type { Site } from "@/types";

interface ProjectMapProps {
  sites: Site[];
  selectedSiteId?: string | null;
  onSiteClick?: (siteId: string) => void;
}

type PolygonFeature = GeoJSON.Feature<GeoJSON.Polygon, { id: string; name: string }>;

export function ProjectMap({
  sites,
  selectedSiteId = null,
  onSiteClick,
}: ProjectMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const featureCollection = useMemo<GeoJSON.FeatureCollection<GeoJSON.Geometry>>(() => {
    const features: PolygonFeature[] = sites
      .filter((site) => site.polygon_geojson?.type === "Polygon")
      .map((site) => ({
        type: "Feature",
        geometry: site.polygon_geojson,
        properties: {
          id: site.id,
          name: site.name,
        },
      }));

    return {
      type: "FeatureCollection",
      features,
    };
  }, [sites]);

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
      center: [78.9629, 22.5937],
      zoom: 3.2,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    map.on("load", () => {
      map.addSource("sites", {
        type: "geojson",
        data: featureCollection,
      });

      map.addLayer({
        id: "sites-fill",
        type: "fill",
        source: "sites",
        paint: {
          "fill-color": "#22c55e",
          "fill-opacity": 0.35,
        },
      });

      map.addLayer({
        id: "sites-outline",
        type: "line",
        source: "sites",
        paint: {
          "line-color": "#14532d",
          "line-width": 2,
        },
      });

      map.addLayer({
        id: "sites-highlight",
        type: "line",
        source: "sites",
        paint: {
          "line-color": "#eab308",
          "line-width": 4,
        },
        filter: ["==", ["get", "id"], ""],
      });

      map.on("click", "sites-fill", (event) => {
        const feature = event.features?.[0];
        const siteId =
          feature && feature.properties && "id" in feature.properties
            ? String(feature.properties.id)
            : null;

        if (siteId && onSiteClick) {
          onSiteClick(siteId);
        }
      });

      map.on("mouseenter", "sites-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "sites-fill", () => {
        map.getCanvas().style.cursor = "";
      });

      if (featureCollection.features.length > 0) {
        const bounds = new maplibregl.LngLatBounds();

        featureCollection.features.forEach((feature) => {
          if (feature.geometry.type === "Polygon") {
            feature.geometry.coordinates[0].forEach(([lng, lat]) => {
              bounds.extend([lng, lat]);
            });
          }
        });

        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: 40, duration: 0 });
        }
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [featureCollection, onSiteClick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource("sites") as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(featureCollection);
    }

    if (map.getLayer("sites-highlight")) {
      map.setFilter("sites-highlight", ["==", ["get", "id"], selectedSiteId ?? ""]);
    }

    if (featureCollection.features.length > 0) {
      const bounds = new maplibregl.LngLatBounds();

      featureCollection.features.forEach((feature) => {
        if (feature.geometry.type === "Polygon") {
          feature.geometry.coordinates[0].forEach(([lng, lat]) => {
            bounds.extend([lng, lat]);
          });
        }
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 40, duration: 800 });
      }
    }
  }, [featureCollection, selectedSiteId]);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
      <div ref={containerRef} className="h-[420px] w-full" />
    </div>
  );
}