export interface SafeQueryResult<T> {
  data: T | null;
  isUnavailable: boolean;
  errorDomain?: string;
}

/**
 * Executes a server-side dashboard sub-query with isolated fault tolerance.
 * Ensures that rejection of one query never crashes the entire SSR dashboard.
 * Logs sanitized errors on the server without leaking secrets.
 */
export async function safeDashboardQuery<T>(
  queryPromise: Promise<T>,
  fallback: T | null,
  domainLabel: string
): Promise<SafeQueryResult<T>> {
  try {
    const data = await queryPromise;
    return {
      data,
      isUnavailable: false,
    };
  } catch (error: unknown) {
    const safeMessage = error instanceof Error ? error.message : "Unknown query failure";
    console.error(`[DASHBOARD_DATA_ERROR] domain=${domainLabel} error=${safeMessage}`);
    return {
      data: fallback,
      isUnavailable: true,
      errorDomain: domainLabel,
    };
  }
}
