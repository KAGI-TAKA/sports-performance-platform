"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => <div className="h-[360px] w-full animate-pulse rounded-lg bg-surface-2/40" />,
});

export interface TestItemRadarEntry {
  name: string;
  score: number;
  rawValue?: number | string | null;
  unit?: string;
  component?: string | null;
}

interface PhysicalTestRadarChartProps {
  items: TestItemRadarEntry[];
  componentScores?: Record<string, number>;
}

export function PhysicalTestRadarChart({
  items,
  componentScores,
}: PhysicalTestRadarChartProps) {
  // Valid items strictly tested for this athlete
  const validItems = items.filter((i) => i.name && typeof i.score === "number");

  const componentEntries = componentScores
    ? [
        { name: "Fleksibilitas", score: componentScores.FLEXIBILITY ?? 70 },
        { name: "Kecepatan", score: componentScores.SPEED ?? 70 },
        { name: "Power", score: componentScores.POWER ?? 70 },
        { name: "Kelincahan", score: componentScores.AGILITY ?? 70 },
        { name: "Daya Tahan Otot", score: componentScores.MUSCULAR_ENDURANCE ?? 70 },
        { name: "Daya Tahan Anaerobik", score: componentScores.ANAEROBIC_ENDURANCE ?? 70 },
        { name: "Daya Tahan Aerobik", score: componentScores.AEROBIC_ENDURANCE ?? 70 },
      ]
    : [];

  const hasEnoughItems = validItems.length >= 3;
  const [viewMode, setViewMode] = useState<"items" | "components">(hasEnoughItems ? "items" : "components");
  const activeData = viewMode === "items" && hasEnoughItems ? validItems : componentEntries;

  const indicators = activeData.map((d) => ({
    name: d.name,
    max: 100,
  }));

  const values = activeData.map((d) => Math.max(0, Math.min(100, Math.round(d.score))));

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      borderColor: "#334155",
      textStyle: {
        color: "#f8fafc",
        fontSize: 12,
      },
      formatter: () => {
        let lines = `<div style="font-weight:bold;margin-bottom:4px;border-bottom:1px solid #475569;padding-bottom:2px;">HASIL TES FISIK</div>`;
        activeData.forEach((d) => {
          const entry = d as Partial<TestItemRadarEntry>;
          const rawInfo =
            entry.rawValue != null
              ? ` (${entry.rawValue} ${(entry.unit ?? "").toLowerCase()})`
              : "";
          lines += `<div style="display:flex;justify-content:space-between;gap:12px;font-size:11px;">
            <span style="color:#cbd5e1;">${d.name}${rawInfo}:</span>
            <span style="font-weight:bold;color:#60a5fa;">${Math.round(d.score)}%</span>
          </div>`;
        });
        return lines;
      },
    },
    radar: {
      radius: "62%",
      center: ["50%", "52%"],
      indicator: indicators,
      shape: "polygon",
      splitNumber: 5,
      axisName: {
        color: "#94a3b8",
        fontSize: 11,
        fontWeight: 600,
        fontFamily: "var(--font-sans)",
        padding: [3, 5],
      },
      splitLine: {
        lineStyle: {
          color: "rgba(148, 163, 184, 0.22)",
          width: 1,
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: [
            "rgba(255, 255, 255, 0.02)",
            "rgba(148, 163, 184, 0.04)",
            "rgba(255, 255, 255, 0.02)",
            "rgba(148, 163, 184, 0.04)",
            "rgba(255, 255, 255, 0.02)",
          ],
        },
      },
      axisLine: {
        lineStyle: {
          color: "rgba(148, 163, 184, 0.25)",
        },
      },
    },
    series: [
      {
        name: "Hasil Tes Fisik",
        type: "radar",
        data: [
          {
            value: values,
            name: "Skor Fisik",
            symbol: "circle",
            symbolSize: 6,
            itemStyle: {
              color: "#2563eb",
              borderColor: "#60a5fa",
              borderWidth: 1.5,
            },
            areaStyle: {
              color: "rgba(37, 99, 235, 0.22)",
            },
            lineStyle: {
              color: "#2563eb",
              width: 2.5,
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full rounded-xl border border-border/80 bg-surface-1 p-4 shadow-sm">
      {/* Box Header matching Client Reference Image */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold tracking-wider uppercase text-foreground">
            HASIL TES FISIK
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold tracking-wider uppercase text-muted">
            % KONDISI FISIK
          </span>
          {componentScores && validItems.length >= 3 && (
            <div className="flex items-center rounded-lg border border-border/80 bg-surface-2 p-0.5 text-xs">
              <Button
                type="button"
                variant={viewMode === "items" ? "secondary" : "ghost"}
                size="xs"
                className={`h-6 text-[11px] px-2 font-medium ${
                  viewMode === "items" ? "bg-background text-foreground shadow-2xs" : "text-muted"
                }`}
                onClick={() => setViewMode("items")}
              >
                Item Tes ({validItems.length})
              </Button>
              <Button
                type="button"
                variant={viewMode === "components" ? "secondary" : "ghost"}
                size="xs"
                className={`h-6 text-[11px] px-2 font-medium ${
                  viewMode === "components" ? "bg-background text-foreground shadow-2xs" : "text-muted"
                }`}
                onClick={() => setViewMode("components")}
              >
                7 Komponen
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[360px]">
        <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
      </div>

      {/* Footer Legend */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-[11px] text-muted">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-600 border border-blue-400" />
          <span>Grafik Radar Capaian Normalisasi (Skala 0–100%)</span>
        </div>
        <span>{activeData.length} Variabel Diuji</span>
      </div>
    </div>
  );
}
