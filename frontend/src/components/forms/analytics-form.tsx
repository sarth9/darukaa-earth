"use client";

import { FormEvent, useState } from "react";

import { api } from "@/lib/api";

interface AnalyticsFormProps {
  siteId: string | null;
  onCreated: () => Promise<void>;
}

export function AnalyticsForm({ siteId, onCreated }: AnalyticsFormProps) {
  const [observedOn, setObservedOn] = useState("2026-01-01");
  const [carbonScore, setCarbonScore] = useState("72.5");
  const [biodiversityScore, setBiodiversityScore] = useState("64.2");
  const [vegetationIndex, setVegetationIndex] = useState("78.9");
  const [soilHealthIndex, setSoilHealthIndex] = useState("69.4");
  const [notes, setNotes] = useState("Initial baseline measurement");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!siteId) {
      setError("Select a site first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/analytics/site", {
        site_id: siteId,
        observed_on: observedOn,
        carbon_score: Number(carbonScore),
        biodiversity_score: Number(biodiversityScore),
        vegetation_index: Number(vegetationIndex),
        soil_health_index: Number(soilHealthIndex),
        notes: notes || null,
      });

      setSuccess("Analytics record created successfully.");
      await onCreated();
    } catch (err: unknown) {
  console.error(err);

  let message = "Failed to create analytics record.";

  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err
  ) {
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
        <h2 className="text-xl font-semibold">Add analytics</h2>
        <p className="mt-1 text-sm text-slate-400">
          Create a time-series record for the selected site.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Selected site ID: {siteId ?? "None"}
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300">Observed on</label>
        <input
          type="date"
          value={observedOn}
          onChange={(event) => setObservedOn(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Carbon score</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={carbonScore}
            onChange={(event) => setCarbonScore(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-300">Biodiversity score</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={biodiversityScore}
            onChange={(event) => setBiodiversityScore(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Vegetation index</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={vegetationIndex}
            onChange={(event) => setVegetationIndex(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-300">Soil health index</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={soilHealthIndex}
            onChange={(event) => setSoilHealthIndex(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300">Notes</label>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="min-h-28 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
          placeholder="Optional notes"
        />
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-400">{success}</p> : null}

      <button
        type="submit"
        disabled={loading || !siteId}
        className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60"
      >
        {loading ? "Creating analytics..." : "Create analytics record"}
      </button>
    </form>
  );
}