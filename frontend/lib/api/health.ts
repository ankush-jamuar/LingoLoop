import { apiFetch } from "./client";

export interface HealthResponse {
  status: string;
  service: string;
}

/**
 * Fetches the backend operational health status.
 * Target: GET /api/health
 */
export async function getHealthStatus(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/api/health", {
    method: "GET",
    cache: "no-store",
  });
}
