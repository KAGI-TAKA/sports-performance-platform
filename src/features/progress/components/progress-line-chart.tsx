"use client";

import ReactECharts from "echarts-for-react";

interface AssessmentPoint {
  id: string;
  assessmentDate: Date | string;
  overallScore: number | string | null;
  overallGrade: string | null;
}

interface ProgressLineChartProps {
  assessments: AssessmentPoint[];
  athleteName: string;
}

export function ProgressLineChart({ assessments, athleteName }: ProgressLineChartProps) {
  const dates = assessments.map((a) =>
    new Date(a.assessmentDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  );

  const scores = assessments.map((a) => Number(a.overallScore ?? 0));

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      formatter: (params: { dataIndex: number; axisValue: string; value: number }[]) => {
        const p = params[0] as { dataIndex: number; axisValue: string; value: number };
        const assessment = assessments[p.dataIndex];
        const grade = assessment.overallGrade ?? "—";
        return `
          <div style="font-size: 12px; line-height: 1.6;">
            <span style="color: #94a3b8; font-size: 11px;">${p.axisValue}</span><br/>
            Skor: <strong style="color: #f1f5f9;">${p.value}%</strong>&nbsp;
            <span style="
              display: inline-block;
              padding: 1px 6px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 700;
              background: rgba(99,102,241,0.2);
              color: #818cf8;
            ">${grade}</span>
          </div>
        `;
      },
      backgroundColor: "#1e293b",
      borderColor: "#334155",
      textStyle: { color: "#f1f5f9" },
      extraCssText: "border-radius: 8px; padding: 10px 14px;",
    },
    grid: {
      left: "1%",
      right: "2%",
      top: "8%",
      bottom: "4%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: "#334155" } },
      axisLabel: {
        color: "#64748b",
        fontSize: 10,
        interval: "auto",
      },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      interval: 20,
      splitLine: {
        lineStyle: { color: "rgba(148, 163, 184, 0.08)" },
      },
      axisLabel: {
        color: "#64748b",
        fontSize: 10,
        formatter: "{value}%",
      },
    },
    series: [
      {
        name: athleteName,
        type: "line",
        data: scores,
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        itemStyle: { color: "#6366f1" },
        lineStyle: { color: "#6366f1", width: 2.5 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(99, 102, 241, 0.25)" },
              { offset: 1, color: "rgba(99, 102, 241, 0.02)" },
            ],
          },
        },
        // Garis acuan grade A dan B+
        markLine: {
          silent: true,
          symbol: "none",
          data: [
            {
              yAxis: 90,
              lineStyle: { color: "#22c55e", type: "dashed", opacity: 0.5, width: 1 },
              label: {
                formatter: "Grade A (90)",
                color: "#22c55e",
                fontSize: 9,
                position: "end",
              },
            },
            {
              yAxis: 80,
              lineStyle: { color: "#3b82f6", type: "dashed", opacity: 0.5, width: 1 },
              label: {
                formatter: "Grade B+ (80)",
                color: "#3b82f6",
                fontSize: 9,
                position: "end",
              },
            },
          ],
        },
      },
    ],
  };

  return (
    <div className="w-full h-[280px]">
      <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
