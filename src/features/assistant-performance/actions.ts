"use server";

import {
  getAssistantPerformanceList,
  getAssistantDetailPerformance,
} from "./queries";
import type { TimeRangeFilter, AssistantPerformanceDetail } from "./types";

export async function fetchAssistantPerformanceListAction(
  timeRange: TimeRangeFilter
) {
  try {
    const data = await getAssistantPerformanceList({ timeRange });
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memuat data performa staf",
    };
  }
}

export async function fetchAssistantDetailAction(
  coachMemberId: string
): Promise<{ success: boolean; data?: AssistantPerformanceDetail | null; error?: string }> {
  try {
    const data = await getAssistantDetailPerformance(coachMemberId);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memuat detail asisten",
    };
  }
}
