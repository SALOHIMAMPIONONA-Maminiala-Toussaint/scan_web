import type { Finding, Job, TargetInput, ToolName } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

export async function listJobs(): Promise<Job[]> {
  const res = await fetch(`${API_BASE}/api/v1/jobs`);
  if (!res.ok) throw new Error("Failed to load jobs");
  return res.json();
}

export async function createJob(payload: {
  name: string;
  tools: ToolName[];
  targets: TargetInput[];
}): Promise<Job> {
  const res = await fetch(`${API_BASE}/api/v1/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to create job");
  return res.json();
}

export async function getFindings(jobId: number): Promise<Finding[]> {
  const res = await fetch(`${API_BASE}/api/v1/jobs/${jobId}/findings`);
  if (!res.ok) throw new Error("Failed to load findings");
  return res.json();
}

export async function retryJob(jobId: number): Promise<Job> {
  const res = await fetch(`${API_BASE}/api/v1/jobs/${jobId}/retry`, {
    method: "POST"
  });
  if (!res.ok) throw new Error("Failed to retry job");
  return res.json();
}

export async function deleteJob(jobId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/jobs/${jobId}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete job");
}

export async function deleteAllJobs(): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/jobs`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete all jobs");
}
