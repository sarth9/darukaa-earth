"use client";

import { FormEvent, useState } from "react";

import { api } from "@/lib/api";
import { DrawSiteMap } from "@/components/map/draw-site-map";

interface SiteFormProps {
  projectId: string;
  onCreated: () => Promise<void>;
}

export function SiteForm({ projectId, onCreated }: SiteFormProps) {
  const [name, setName] = useState("Site Alpha");
  const [siteCode, setSiteCode] = useState("ALPHA-001");
  const [areaHectares, setAreaHectares] = useState("24.5");
  const [centroidLat, setCentroidLat] = useState("");
  const [centroidLng, setCentroidLng] = useState("");
  const [status, setStatus] = useState("active");
  const [polygonGeojson, setPolygonGeojson] = useState<GeoJSON.Polygon | null>(null);
  const [polygonText, setPolygonText] = useState(`{
  "type": "Polygon",
  "coordinates": [
    [
      [76.1, 30.7],
      [76.2, 30.7],
      [76.2, 30.8],
      [76.1, 30.8],
      [76.1, 30.7]
    ]
  ]
}`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const finalPolygon =
        polygonGeojson ??
        (JSON.parse(polygonText) as {
          type: "Polygon";
          coordinates: number[][][];
        });

      await api.post("/sites", {
        project_id: projectId,
        name,
        site_code: siteCode,
        area_hectares: Number(areaHectares),
        polygon_geojson: finalPolygon,
        centroid_lat: Number(centroidLat),
        centroid_lng: Number(centroidLng),
        status,
      });

      setSuccess("Site created successfully.");
      await onCreated();
    } catch (err: unknown) {
      console.error(err);

      let message = "Failed to create site. Check polygon and values.";

      if (typeof err === "object" && err !== null && "response" in err) {
        const response = (err as { response?: { data?: { detail?: unknown } } }).response;
        const detail = response?.data?.detail;

        if (typeof detail === "string") {
          message = detail;
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
    >
      <div>
        <h2 className="text-xl font-semibold">Add site</h2>
        <p className="mt-1 text-sm text-slate-400">
          Create a new site for this project by drawing a polygon or pasting GeoJSON.
        </p>
      </div>

      <DrawSiteMap
        onPolygonChange={(polygon, centroid) => {
          setPolygonGeojson(polygon);

          if (polygon) {
            setPolygonText(JSON.stringify(polygon, null, 2));
          }

          if (centroid) {
            setCentroidLat(String(Number(centroid.lat.toFixed(6))));
            setCentroidLng(String(Number(centroid.lng.toFixed(6))));
          }
        }}
      />

      <div className="space-y-2">
        <label className="text-sm text-slate-300">Site name</label>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300">Site code</label>
        <input
          type="text"
          value={siteCode}
          onChange={(event) => setSiteCode(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Area (hectares)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={areaHectares}
            onChange={(event) => setAreaHectares(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-300">Status</label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
          >
            <option value="active">active</option>
            <option value="planned">planned</option>
            <option value="inactive">inactive</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Centroid latitude</label>
          <input
            type="number"
            step="0.000001"
            value={centroidLat}
            onChange={(event) => setCentroidLat(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-300">Centroid longitude</label>
          <input
            type="number"
            step="0.000001"
            value={centroidLng}
            onChange={(event) => setCentroidLng(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300">Polygon GeoJSON</label>
        <textarea
          value={polygonText}
          onChange={(event) => setPolygonText(event.target.value)}
          className="min-h-52 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm outline-none"
          required
        />
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-400">{success}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60"
      >
        {loading ? "Creating site..." : "Create site"}
      </button>
    </form>
  );
}