"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ProjectForm } from "@/components/forms/project-form";
import { ProjectMap } from "@/components/map/project-map";
import { api } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import type { Project, Site } from "@/types";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboardData() {
    const token = getToken();

    if (!token) {
      setError("No auth token found. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const projectsResponse = await api.get<Project[]>("/projects");
      const sitesResponse = await api.get<Site[]>("/sites");

      setProjects(projectsResponse.data);
      setSites(sitesResponse.data);
    } catch (err) {
      console.error("Dashboard load failed:", err);
      setError("Failed to load dashboard data. Please refresh or log in again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadDashboardData();
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  function handleLogout() {
    clearToken();
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-8 text-[var(--foreground)]">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
              Dashboard
            </p>
            <h1 className="text-3xl font-bold md:text-4xl">
              Darukaa Earth Admin Dashboard
            </h1>
            <p className="max-w-2xl text-slate-400">
              Manage projects, sites, and geospatial analytics from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-slate-700 px-4 py-2 font-medium hover:bg-slate-900"
          >
            Logout
          </button>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-sm text-slate-400">Total projects</p>
            <p className="mt-2 text-3xl font-bold">{projects.length}</p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-sm text-slate-400">Total sites</p>
            <p className="mt-2 text-3xl font-bold">{sites.length}</p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-sm text-slate-400">Platform status</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">Live</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="space-y-6">
            <ProjectForm onCreated={loadDashboardData} />

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-xl font-semibold">Quick notes</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-400">
                <p>Projects are loaded from your FastAPI backend.</p>
                <p>Sites are loaded from Neon-backed storage.</p>
                <p>Map polygons render below using MapLibre.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <ProjectMap sites={sites} />

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Projects</h2>
                <button
                  type="button"
                  onClick={() => void loadDashboardData()}
                  className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-900"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <p className="text-slate-400">Loading dashboard...</p>
              ) : error ? (
                <p className="text-red-400">{error}</p>
              ) : projects.length === 0 ? (
                <p className="text-slate-400">
                  No projects yet. Create your first project from the form on the left.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="rounded-2xl border border-slate-800 bg-slate-950 p-5 transition hover:border-emerald-500"
                    >
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{project.name}</h3>
                        <p className="text-sm text-slate-400">
                          {project.region ?? "No region provided"}
                        </p>
                        <p className="line-clamp-3 text-sm text-slate-500">
                          {project.description ?? "No description provided"}
                        </p>
                        <p className="pt-2 text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
                          Open project
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}