"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

import type { SiteAnalytics } from "@/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface SiteAnalyticsChartProps {
  data: SiteAnalytics[];
}

export function SiteAnalyticsChart({ data }: SiteAnalyticsChartProps) {
  const labels = data.map((item) => item.observed_on);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h2 className="mb-4 text-xl font-semibold">Performance over time</h2>

      <Line
        data={{
          labels,
          datasets: [
            {
              label: "Carbon score",
              data: data.map((item) => item.carbon_score),
            },
            {
              label: "Biodiversity score",
              data: data.map((item) => item.biodiversity_score),
            },
            {
              label: "Vegetation index",
              data: data.map((item) => item.vegetation_index),
            },
            {
              label: "Soil health index",
              data: data.map((item) => item.soil_health_index),
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: {
              labels: {
                color: "#e2e8f0",
              },
            },
          },
          scales: {
            x: {
              ticks: {
                color: "#94a3b8",
              },
              grid: {
                color: "rgba(148, 163, 184, 0.12)",
              },
            },
            y: {
              ticks: {
                color: "#94a3b8",
              },
              grid: {
                color: "rgba(148, 163, 184, 0.12)",
              },
            },
          },
        }}
      />
    </div>
  );
}