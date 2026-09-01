"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import type { ComparedAthleteDTO } from "../types";

interface MultiAthleteRadarChartProps {
  athletes: ComparedAthleteDTO[];
  className?: string;
}

const symbols = ["circle", "rect", "triangle", "diamond"] as const;

export function MultiAthleteRadarChart({
  athletes,
  className = "",
}: MultiAthleteRadarChartProps) {
  if (athletes.length === 0) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted">
        Pilih minimal 2 atlet untuk memuat radar perbandingan.
      </div>
    );
  }

  const seriesData = athletes.map((ath, idx) => {
    const scores = ath.componentScores;
    const color = ath.color;
    const symbol = symbols[idx % symbols.length];

    return {
      value: [
        scores.FLEXIBILITY ?? 0,
        scores.SPEED ?? 0,
        scores.POWER ?? 0,
        scores.AGILITY ?? 0,
        scores.MUSCULAR_ENDURANCE ?? 0,
        scores.ANAEROBIC_ENDURANCE ?? 0,
        scores.AEROBIC_ENDURANCE ?? 0,
      ],
      name: ath.fullName,
      symbol,
      symbolSize: 6,
      itemStyle: { color },
      areaStyle: { color: `${color}26` }, // 15% opacity fill
      lineStyle: { color, width: 2, type: idx === 1 ? "dashed" : "solid" },
    };
  });

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      borderColor: "rgba(148, 163, 184, 0.2)",
      textStyle: { color: "#f8fafc", fontSize: 12 },
    },
    legend: {
      data: athletes.map((a) => a.fullName),
      textStyle: {
        color: "#94a3b8",
        fontSize: 12,
      },
      bottom: 0,
      itemGap: 16,
    },
    radar: {
      indicator: [
        { name: "Fleksibilitas", max: 100 },
        { name: "Kecepatan", max: 100 },
        { name: "Power", max: 100 },
        { name: "Kelincahan", max: 100 },
        { name: "Daya Tahan Otot", max: 100 },
        { name: "Daya Tahan Anaerobik", max: 100 },
        { name: "Daya Tahan Aerobik", max: 100 },
      ],
      shape: "polygon",
      splitNumber: 4,
      axisName: {
        color: "#94a3b8",
        fontSize: 11,
        fontWeight: "bold",
      },
      splitLine: {
        lineStyle: {
          color: "rgba(148, 163, 184, 0.15)",
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ["rgba(15, 23, 42, 0.4)", "rgba(15, 23, 42, 0.2)"],
        },
      },
      axisLine: {
        lineStyle: {
          color: "rgba(148, 163, 184, 0.2)",
        },
      },
    },
    series: [
      {
        name: "Profil Komparasi Fisik",
        type: "radar",
        data: seriesData,
      },
    ],
  };

  return (
    <div
      className={`w-full h-[360px] sm:h-[400px] ${className}`}
      role="region"
      aria-label="Radar Overlay Perbandingan 7 Komponen Fisik Atlet"
    >
      <ReactECharts
        option={option}
        style={{ height: "100%", width: "100%" }}
        opts={{ renderer: "svg" }}
      />
    </div>
  );
}
