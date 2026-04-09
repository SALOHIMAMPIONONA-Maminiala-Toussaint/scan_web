export type ToolName = "nmap" | "nikto" | "sqlmap" | "trivy";
export type TargetType = "host" | "url" | "filesystem" | "image";

export interface TargetInput {
  type: TargetType;
  value: string;
}

export interface Job {
  id: number;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  error_message: string | null;
}

export interface Finding {
  id: number;
  tool: string;
  target: string;
  severity: string;
  title: string;
  evidence: string;
  artifact_path: string | null;
  created_at: string;
}
