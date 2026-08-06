"use client";

import ReactECharts from "echarts-for-react";

interface AssessmentRadarChartProps {
  componentScores: {
    FLEXIBILITY?: number;
    SPEED?: number;
    POWER?: number;
    AGILITY?: number;
    MUSCULAR_ENDURANCE?: number;
    ANAEROBIC_ENDURANCE?: number;
    AEROBIC_ENDURANCE?: number;
  };
}

export function AssessmentRadarChart({ componentScores }: AssessmentRadarChartProps) {
  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
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
        fontFamily: "var(--font-sans)",
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
        name: "Hasil Assessment Fisik",
        type: "radar",
        data: [
          {
            value: [
              componentScores.FLEXIBILITY ?? 70,
              componentScores.SPEED ?? 70,
              componentScores.POWER ?? 70,
              componentScores.AGILITY ?? 70,
              componentScores.MUSCULAR_ENDURANCE ?? 70,
              componentScores.ANAEROBIC_ENDURANCE ?? 70,
              componentScores.AEROBIC_ENDURANCE ?? 70,
            ],
            name: "Nilai Performa",
            symbol: "circle",
            symbolSize: 6,
            itemStyle: {
              color: "#3b82f6",
            },
            areaStyle: {
              color: "rgba(59, 130, 246, 0.35)",
            },
            lineStyle: {
              color: "#3b82f6",
              width: 2,
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="w-full h-[320px]">
      <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
