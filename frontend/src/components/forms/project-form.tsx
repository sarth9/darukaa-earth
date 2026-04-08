"use client";

import { FormEvent, useState } from "react";

import { api } from "@/lib/api";

interface ProjectFormProps {
  onCreated: () => Promise<void>;
}

export function ProjectForm({ onCreated }: ProjectFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/projects", {
        name,
        description: description || null,
        region: region || null,
      });

      setName("");
      setDescription("");
      setRegion("");
      await onCreated();
    } catch {
      setError("Failed to create project.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
    >
      <div className="space-y-2">
        <label className="text-sm text-slate-300">Project name</label>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
          placeholder="Punjab Restoration Project"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300">Region</label>
        <input
          type="text"
          value={region}
          onChange={(event) => setRegion(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
          placeholder="Punjab"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300">Description</label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-28 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
          placeholder="Short project description"
        />
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create project"}
      </button>
    </form>
  );
}