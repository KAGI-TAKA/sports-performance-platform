/**
 * Coach Zulfi Athletic Performance Design System
 * Unified Chart Styling Foundation (ECharts)
 *
 * Provides standardized palettes, typography, gridlines, and tooltip styles
 * to avoid hardcoded rainbow colors and ensure visual consistency across all chart types.
 */

export const CHART_PALETTE = {
  // Primary Athletic Accent
  amber: "#f97316",           // Signature Energetic Amber
  amberSubtle: "rgba(249, 115, 22, 0.2)",
  
  // Secondary Athletic Indigo
  indigo: "#4f46e5",
  indigoSubtle: "rgba(79, 70, 229, 0.2)",

  // Athletic Component Colors (Restrained)
  teal: "#0d9488",
  emerald: "#059669",
  rose: "#e11d48",
  blue: "#2563eb",
  violet: "#7c3aed",

  // Neutral Theme Lines & Backgrounds (Light mode base)
  light: {
    text: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#94a3b8",
    axisLine: "#cbd5e1",
    splitLine: "rgba(203, 213, 225, 0.4)",
    splitArea: ["rgba(248, 250, 252, 0.6)", "rgba(241, 245, 249, 0.3)"],
    tooltipBg: "#0f172a",
    tooltipBorder: "#334155",
    tooltipText: "#f8fafc",
  },

  // Neutral Theme Lines & Backgrounds (Dark mode base)
  dark: {
    text: "#f8fafc",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",
    axisLine: "#334155",
    splitLine: "rgba(51, 65, 85, 0.4)",
    splitArea: ["rgba(15, 23, 42, 0.5)", "rgba(15, 23, 42, 0.2)"],
    tooltipBg: "#0f172a",
    tooltipBorder: "#334155",
    tooltipText: "#f8fafc",
  },
};

/**
 * Standardized tooltip configuration for ECharts
 */
export function getStandardTooltipConfig() {
  return {
    trigger: "item" as const,
    backgroundColor: CHART_PALETTE.light.tooltipBg,
    borderColor: CHART_PALETTE.light.tooltipBorder,
    borderRadius: 8,
    padding: [8, 12],
    textStyle: {
      color: CHART_PALETTE.light.tooltipText,
      fontSize: 12,
      fontFamily: "var(--font-inter, system-ui, sans-serif)",
    },
    extraCssText: "box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);",
  };
}

/**
 * Standardized radar grid/indicator styling
 */
export function getStandardRadarIndicatorStyle() {
  return {
    axisName: {
      color: "#64748b",
      fontSize: 11,
      fontFamily: "var(--font-inter, system-ui, sans-serif)",
      fontWeight: "600" as const,
    },
    splitLine: {
      lineStyle: {
        color: "rgba(148, 163, 184, 0.2)",
        width: 1,
      },
    },
    splitArea: {
      show: true,
      areaStyle: {
        color: ["rgba(241, 245, 249, 0.4)", "rgba(248, 250, 252, 0.2)"],
      },
    },
    axisLine: {
      lineStyle: {
        color: "rgba(148, 163, 184, 0.25)",
      },
    },
  };
}
