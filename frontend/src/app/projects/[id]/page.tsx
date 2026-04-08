"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AnalyticsForm } from "@/components/forms/analytics-form";
import { SiteForm } from "@/components/forms/site-form";
import { ProjectMap } from "@/components/map/project-map";
import { SiteAnalyticsChart } from "@/components/charts/site-analytics-chart";
import { api } from "@/lib/api";
import type { Project, Site, SiteAnalytics } from "@/types";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [analytics, setAnalytics] = useState<SiteAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProjectData() {
    if (!params?.id) return;

    setLoading(true);
    setError("");

    try {
      const [projectResponse, sitesResponse] = await Promise.all([
        api.get<Project>(`/projects/${params.id}`),
        api.get<Site[]>(`/projects/${params.id}/sites`),
      ]);

      setProject(projectResponse.data);
      setSites(sitesResponse.data);

      if (sitesResponse.data.length > 0) {
        setSelectedSite((previousSelectedSite) => {
          if (!previousSelectedSite) return sitesResponse.data[0];

          const updatedSelection =
            sitesResponse.data.find((site) => site.id === previousSelectedSite.id) ??
            sitesResponse.data[0];

          return updatedSelection;
        });
      } else {
        setSelectedSite(null);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load project details.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAnalytics(siteId: string) {
    try {
      const response = await api.get<SiteAnalytics[]>(`/analytics/site/${siteId}`);
      setAnalytics(response.data);
    } catch (err) {
      console.error(err);
      setAnalytics([]);
    }
  }

  async function refreshSelectedSiteAnalytics() {
    if (!selectedSite) {
      setAnalytics([]);
      return;
    }

    await loadAnalytics(selectedSite.id);
  }

  useEffect(() => {
    void loadProjectData();
  }, [params?.id]);

  useEffect(() => {
    if (!selectedSite) {
      setAnalytics([]);
      return;
    }

    void loadAnalytics(selectedSite.id);
  }, [selectedSite]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-6 py-8 text-[var(--foreground)]">
        <div className="mx-auto max-w-7xl">
          <p className="text-slate-400">Loading project...</p>
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-6 py-8 text-[var(--foreground)]">
        <div className="mx-auto max-w-7xl space-y-4">
          <Link href="/dashboard" className="text-emerald-400 hover:underline">
            ← Back to dashboard
          </Link>
          <p className="text-red-400">{error || "Project not found."}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-8 text-[var(--foreground)]">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-3">
          <Link href="/dashboard" className="text-emerald-400 hover:underline">
            ← Back to dashboard
          </Link>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
              Project detail
            </p>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-slate-400">{project.region ?? "No region"}</p>
            <p className="mt-2 max-w-3xl text-slate-300">
              {project.description ?? "No description provided."}
            </p>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-sm text-slate-400">Sites in this project</p>
            <p className="mt-2 text-3xl font-bold">{sites.length}</p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-sm text-slate-400">Selected site</p>
            <p className="mt-2 text-xl font-bold">
              {selectedSite?.name ?? "None"}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-sm text-slate-400">Analytics records</p>
            <p className="mt-2 text-3xl font-bold">{analytics.length}</p>
          </div>
        </section>

        <ProjectMap
          sites={sites}
          selectedSiteId={selectedSite?.id ?? null}
          onSiteClick={(siteId) => {
            const foundSite = sites.find((site) => site.id === siteId) ?? null;
            setSelectedSite(foundSite);
          }}
        />

        <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <div className="space-y-6">
            <SiteForm projectId={project.id} onCreated={loadProjectData} />

            <AnalyticsForm
              siteId={selectedSite?.id ?? null}
              onCreated={refreshSelectedSiteAnalytics}
            />

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-xl font-semibold">Sites</h2>

              {sites.length === 0 ? (
                <p className="mt-4 text-slate-400">No sites found for this project.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {sites.map((site) => (
                    <button
                      key={site.id}
                      type="button"
                      onClick={() => setSelectedSite(site)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        selectedSite?.id === site.id
                          ? "border-emerald-500 bg-slate-900"
                          : "border-slate-800 bg-slate-950"
                      }`}
                    >
                      <div className="font-semibold">{site.name}</div>
                      <div className="text-sm text-slate-400">{site.site_code}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                        {site.status}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-xl font-semibold">Selected site details</h2>

              {selectedSite ? (
                <div className="mt-4 space-y-2 text-slate-300">
                  <p>
                    <span className="font-semibold text-white">Name:</span>{" "}
                    {selectedSite.name}
                  </p>
                  <p>
                    <span className="font-semibold text-white">Code:</span>{" "}
                    {selectedSite.site_code}
                  </p>
                  <p>
                    <span className="font-semibold text-white">Area:</span>{" "}
                    {selectedSite.area_hectares} hectares
                  </p>
                  <p>
                    <span className="font-semibold text-white">Centroid:</span>{" "}
                    {selectedSite.centroid_lat}, {selectedSite.centroid_lng}
                  </p>
                  <p>
                    <span className="font-semibold text-white">Status:</span>{" "}
                    {selectedSite.status}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-slate-400">Select a site to view details.</p>
              )}
            </div>

            {analytics.length === 0 ? (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                <h2 className="text-xl font-semibold">Performance over time</h2>
                <p className="mt-4 text-slate-400">
                  No analytics records found for the selected site.
                </p>
              </div>
            ) : (
              <SiteAnalyticsChart data={analytics} />
            )}

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-xl font-semibold">Analytics timeline</h2>

              {analytics.length === 0 ? (
                <p className="mt-4 text-slate-400">
                  No analytics records found for the selected site.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-left text-slate-400">
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Carbon</th>
                        <th className="px-3 py-2">Biodiversity</th>
                        <th className="px-3 py-2">Vegetation</th>
                        <th className="px-3 py-2">Soil</th>
                        <th className="px-3 py-2">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.map((item) => (
                        <tr key={item.id} className="border-b border-slate-900">
                          <td className="px-3 py-2">{item.observed_on}</td>
                          <td className="px-3 py-2">{item.carbon_score}</td>
                          <td className="px-3 py-2">{item.biodiversity_score}</td>
                          <td className="px-3 py-2">{item.vegetation_index}</td>
                          <td className="px-3 py-2">{item.soil_health_index}</td>
                          <td className="px-3 py-2">{item.notes ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}