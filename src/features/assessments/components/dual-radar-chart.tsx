"use client";

import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse rounded-lg bg-surface-2/40" />,
});

interface ComponentScoreMap {
  FLEXIBILITY?: number;
  SPEED?: number;
  POWER?: number;
  AGILITY?: number;
  MUSCULAR_ENDURANCE?: number;
  ANAEROBIC_ENDURANCE?: number;
  AEROBIC_ENDURANCE?: number;
}

interface DualRadarChartProps {
  nameA: string;
  scoresA: ComponentScoreMap;
  colorA?: string;
  nameB: string;
  scoresB: ComponentScoreMap;
  colorB?: string;
}

export function DualRadarChart({
  nameA,
  scoresA,
  colorA = "#3b82f6", // Default Accent Blue
  nameB,
  scoresB,
  colorB = "#f97316", // Default Vivid Orange
}: DualRadarChartProps) {
  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
    },
    legend: {
      data: [nameA, nameB],
      textStyle: {
        color: "#94a3b8",
        fontSize: 12,
      },
      bottom: 0,
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
        name: "Perbandingan Komponen Fisik",
        type: "radar",
        data: [
          {
            value: [
              scoresA.FLEXIBILITY ?? 0,
              scoresA.SPEED ?? 0,
              scoresA.POWER ?? 0,
              scoresA.AGILITY ?? 0,
              scoresA.MUSCULAR_ENDURANCE ?? 0,
              scoresA.ANAEROBIC_ENDURANCE ?? 0,
              scoresA.AEROBIC_ENDURANCE ?? 0,
            ],
            name: nameA,
            symbol: "circle",
            symbolSize: 5,
            itemStyle: { color: colorA },
            areaStyle: { color: `${colorA}33` },
            lineStyle: { color: colorA, width: 2 },
          },
          {
            value: [
              scoresB.FLEXIBILITY ?? 0,
              scoresB.SPEED ?? 0,
              scoresB.POWER ?? 0,
              scoresB.AGILITY ?? 0,
              scoresB.MUSCULAR_ENDURANCE ?? 0,
              scoresB.ANAEROBIC_ENDURANCE ?? 0,
              scoresB.AEROBIC_ENDURANCE ?? 0,
            ],
            name: nameB,
            symbol: "rect",
            symbolSize: 5,
            itemStyle: { color: colorB },
            areaStyle: { color: `${colorB}33` },
            lineStyle: { color: colorB, width: 2, type: "dashed" },
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full h-[360px]">
      <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
