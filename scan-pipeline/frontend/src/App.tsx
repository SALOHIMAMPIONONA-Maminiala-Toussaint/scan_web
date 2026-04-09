import { useEffect, useMemo, useState } from "react";
import { createJob, deleteAllJobs, deleteJob, getFindings, listJobs, retryJob } from "./api";
import type { Finding, Job, TargetInput, TargetType, ToolName } from "./types";
import { Icons } from "./components/Icons";

const ALL_TOOLS: ToolName[] = ["nmap", "nikto", "sqlmap", "trivy"];
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

const severityRank: Record<string, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1
};

function isCompatible(tool: ToolName, targetType: TargetType): boolean {
  if (tool === "nmap") return targetType === "host";
  if (tool === "nikto") return targetType === "url";
  if (tool === "sqlmap") return targetType === "url";
  if (tool === "trivy") return targetType === "filesystem" || targetType === "image";
  return false;
}

function App() {
  const [name, setName] = useState("Localhost baseline scan");
  const [tools, setTools] = useState<ToolName[]>(["nmap", "nikto"]);
  const [targets, setTargets] = useState<TargetInput[]>([
    { type: "host", value: "127.0.0.1" },
    { type: "url", value: "http://localhost:8000" }
  ]);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [busy, setBusy] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState<number | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [retryingJobId, setRetryingJobId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [toolFilter, setToolFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [sortMode, setSortMode] = useState("severity");
  const [groupMode, setGroupMode] = useState("tool");
  const [expandedEvidence, setExpandedEvidence] = useState<number[]>([]);

  async function refreshJobs() {
    try {
      const data = await listJobs();
      setJobs(data);

      if (data.length === 0) {
        setSelectedJobId(null);
        setFindings([]);
        return;
      }

      if (!selectedJobId) {
        setSelectedJobId(data[0].id);
        return;
      }

      const stillExists = data.some((job) => job.id === selectedJobId);
      if (!stillExists) {
        setSelectedJobId(data[0].id);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function refreshFindings(jobId: number) {
    try {
      const data = await getFindings(jobId);
      setFindings(data);
    } catch (e) {
      setFindings([]);
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void refreshJobs();
    const id = setInterval(() => {
      void refreshJobs();
      if (selectedJobId) {
        void refreshFindings(selectedJobId);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [selectedJobId]);

  useEffect(() => {
    if (!selectedJobId) {
      setFindings([]);
      return;
    }

    void refreshFindings(selectedJobId);
  }, [selectedJobId]);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) ?? null,
    [jobs, selectedJobId]
  );

  const severityStats = useMemo(() => {
    const base = { total: findings.length, critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    for (const finding of findings) {
      const key = finding.severity.toLowerCase();
      if (key in base) {
        (base as Record<string, number>)[key] += 1;
      }
    }
    return base;
  }, [findings]);

  const availableTools = useMemo(() => {
    return Array.from(new Set(findings.map((finding) => finding.tool.toLowerCase()))).sort();
  }, [findings]);

  const filteredFindings = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return findings.filter((finding) => {
      const sev = finding.severity.toLowerCase();
      const tool = finding.tool.toLowerCase();
      const matchesSeverity = severityFilter === "all" || sev === severityFilter;
      const matchesTool = toolFilter === "all" || tool === toolFilter;
      const matchesSearch =
        q.length === 0 ||
        finding.title.toLowerCase().includes(q) ||
        finding.target.toLowerCase().includes(q) ||
        finding.evidence.toLowerCase().includes(q);
      return matchesSeverity && matchesTool && matchesSearch;
    });
  }, [findings, searchText, severityFilter, toolFilter]);

  const sortedFindings = useMemo(() => {
    const next = [...filteredFindings];
    next.sort((a, b) => {
      if (sortMode === "recent") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      const bySeverity = (severityRank[b.severity.toLowerCase()] ?? 0) - (severityRank[a.severity.toLowerCase()] ?? 0);
      if (bySeverity !== 0) return bySeverity;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return next;
  }, [filteredFindings, sortMode]);

  const groupedFindings = useMemo(() => {
    const groups = new Map<string, Finding[]>();
    for (const finding of sortedFindings) {
      const groupKey =
        groupMode === "target"
          ? `Cible: ${finding.target}`
          : groupMode === "none"
            ? "Tous les résultats"
            : `Outil: ${finding.tool.toUpperCase()}`;
      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey)?.push(finding);
    }
    return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
  }, [groupMode, sortedFindings]);

  function getSeverityLabel(severity: string): string {
    if (severity === "critical") return "Critique";
    if (severity === "high") return "Élevé";
    if (severity === "medium") return "Moyen";
    if (severity === "low") return "Faible";
    return "Info";
  }

  function toggleEvidence(findingId: number) {
    setExpandedEvidence((prev) =>
      prev.includes(findingId) ? prev.filter((id) => id !== findingId) : [...prev, findingId]
    );
  }

  function downloadTextFile(filename: string, content: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function onExportJson() {
    const payload = sortedFindings.map((finding) => ({
      id: finding.id,
      tool: finding.tool,
      target: finding.target,
      severity: finding.severity,
      title: finding.title,
      evidence: finding.evidence,
      artifact_path: finding.artifact_path,
      created_at: finding.created_at
    }));
    const filename = `findings-job-${selectedJob?.id ?? "na"}.json`;
    downloadTextFile(filename, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
  }

  function onExportCsv() {
    const escapeCsv = (value: string | number | null) => {
      const raw = value == null ? "" : String(value);
      const escaped = raw.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const header = ["id", "tool", "target", "severity", "title", "evidence", "artifact_path", "created_at"];
    const rows = sortedFindings.map((finding) =>
      [
        finding.id,
        finding.tool,
        finding.target,
        finding.severity,
        finding.title,
        finding.evidence,
        finding.artifact_path ?? "",
        finding.created_at
      ]
        .map((cell) => escapeCsv(cell))
        .join(",")
    );

    const csv = [header.join(","), ...rows].join("\n");
    const filename = `findings-job-${selectedJob?.id ?? "na"}.csv`;
    downloadTextFile(filename, csv, "text/csv;charset=utf-8");
  }

  function toggleTool(tool: ToolName) {
    setTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  }

  function updateTarget(index: number, patch: Partial<TargetInput>) {
    setTargets((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  function addTarget() {
    setTargets((prev) => [...prev, { type: "url", value: "" }]);
  }

  function removeTarget(index: number) {
    setTargets((prev) => prev.filter((_, i) => i !== index));
  }

  async function onCreateJob() {
    setError(null);
    if (!name.trim()) return setError("Le nom est requis");
    if (tools.length === 0) return setError("Sélectionnez au moins un outil");
    if (targets.some((t) => !t.value.trim())) return setError("Remplissez toutes les valeurs de cible");
    const hasCompatiblePair = tools.some((tool) =>
      targets.some((target) => isCompatible(tool, target.type))
    );
    if (!hasCompatiblePair) {
      return setError("Aucune combinaison outil/cible compatible");
    }

    setBusy(true);
    try {
      const job = await createJob({ name, tools, targets });
      await refreshJobs();
      setSelectedJobId(job.id);
      await refreshFindings(job.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteJob(jobId: number) {
    setError(null);
    setDeletingJobId(jobId);
    try {
      await deleteJob(jobId);
      await refreshJobs();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeletingJobId(null);
    }
  }

  async function onDeleteAllJobs() {
    setError(null);
    setDeletingAll(true);
    try {
      await deleteAllJobs();
      await refreshJobs();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeletingAll(false);
    }
  }

  async function onRetryJob(jobId: number) {
    setError(null);
    setRetryingJobId(jobId);
    try {
      const updated = await retryJob(jobId);
      setSelectedJobId(updated.id);
      await refreshJobs();
      await refreshFindings(updated.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRetryingJobId(null);
    }
  }

  return (
    <div className="app">
      <header>
        <h1>
          <Icons.Shield />
          Pipeline de Scan
        </h1>
        <p>Scan automatisé des vulnérabilités avec file d'attente, worker et tableau de bord</p>
      </header>

      <section className="card">
        <h2>
          <Icons.Zap />
          Créer un Scan
        </h2>
        
        <label>
          Nom du scan
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: Scan de base localhost"
          />
        </label>

        <div className="tools">
          <span>Sélectionner les outils de scan</span>
          {ALL_TOOLS.map((tool) => (
            <label key={tool} className="inline">
              <input
                type="checkbox"
                checked={tools.includes(tool)}
                onChange={() => toggleTool(tool)}
              />
              <span style={{ textTransform: "uppercase", fontWeight: 500 }}>
                {tool}
              </span>
            </label>
          ))}
        </div>

        <div className="targets">
          <span>Configuration des cibles</span>
          {targets.map((target, index) => (
            <div className="target-row" key={`target-${index}`}>
              <select
                value={target.type}
                onChange={(e) =>
                  updateTarget(index, { type: e.target.value as TargetType })
                }
              >
                <option value="host">Hôte</option>
                <option value="url">URL</option>
                <option value="filesystem">Système de fichiers</option>
                <option value="image">Image</option>
              </select>
              <input
                placeholder="ex: 127.0.0.1 ou http://localhost:8000"
                value={target.value}
                onChange={(e) => updateTarget(index, { value: e.target.value })}
              />
              <button 
                type="button" 
                className="danger"
                onClick={() => removeTarget(index)}
                title="Supprimer la cible"
              >
                <Icons.Trash />
              </button>
            </div>
          ))}
          <button type="button" className="secondary" onClick={addTarget}>
            <Icons.Plus />
            Ajouter une cible
          </button>
        </div>

        <button 
          disabled={busy} 
          onClick={onCreateJob}
          style={{ width: "100%", marginTop: "var(--spacing-md)" }}
        >
          {busy ? (
            <>
              <Icons.Clock />
              Lancement en cours...
            </>
          ) : (
            <>
              <Icons.Play />
              Lancer le scan
            </>
          )}
        </button>
        
        {error && (
          <div className="error">
            <Icons.AlertCircle />
            {error}
          </div>
        )}
      </section>

      <section className="grid">
        <article className="card">
          <h2>
            <Icons.Eye />
            Tâches de scan
          </h2>
          <div className="jobs-actions">
            <button
              type="button"
              className="danger"
              onClick={onDeleteAllJobs}
              disabled={deletingAll || jobs.length === 0}
            >
              <Icons.Trash />
              {deletingAll ? "Suppression..." : "Supprimer tout"}
            </button>
          </div>
          {jobs.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2a10 10 0 1 0 20 0 10 10 0 0 0-20 0" />
              </svg>
              <p>Aucune tâche de scan pour le moment</p>
            </div>
          ) : (
            <ul className="jobs">
              {jobs.map((job) => (
                <li
                  key={job.id}
                  className={job.id === selectedJobId ? "active" : ""}
                  onClick={() => setSelectedJobId(job.id)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)", flex: 1 }}>
                    <strong>#{job.id}</strong>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>
                        {job.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>
                        {new Date(job.created_at).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <div className={`status-badge ${job.status}`}>
                    {job.status === "running" && <Icons.Clock />}
                    {job.status === "done" && <Icons.CheckCircle />}
                    {job.status === "failed" && <Icons.AlertTriangle />}
                    {job.status === "queued" && "⏳"}
                    {job.status === "queued" ? "En file" : job.status === "running" ? "En cours" : job.status === "done" ? "Terminé" : "Erreur"}
                  </div>
                  <button
                    type="button"
                    className="secondary job-retry-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      void onRetryJob(job.id);
                    }}
                    disabled={
                      retryingJobId === job.id ||
                      deletingAll ||
                      deletingJobId === job.id ||
                      job.status === "queued" ||
                      job.status === "running"
                    }
                    title="Relancer cette tâche"
                  >
                    {retryingJobId === job.id ? "..." : <Icons.RefreshCw />}
                  </button>
                  <button
                    type="button"
                    className="danger job-delete-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      void onDeleteJob(job.id);
                    }}
                    disabled={deletingJobId === job.id || deletingAll}
                    title="Supprimer cette tâche"
                  >
                    {deletingJobId === job.id ? "..." : <Icons.Trash />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="card">
          <h2>
            <Icons.AlertCircle />
            Résultats {selectedJob ? `pour #${selectedJob.id}` : ""}
          </h2>

          {selectedJob && findings.length > 0 && (
            <div className="results-summary">
              <div className="summary-tile">
                <span>Total</span>
                <strong>{severityStats.total}</strong>
              </div>
              <div className="summary-tile critical">
                <span>Critique</span>
                <strong>{severityStats.critical}</strong>
              </div>
              <div className="summary-tile high">
                <span>Élevé</span>
                <strong>{severityStats.high}</strong>
              </div>
              <div className="summary-tile medium">
                <span>Moyen</span>
                <strong>{severityStats.medium}</strong>
              </div>
              <div className="summary-tile low">
                <span>Faible</span>
                <strong>{severityStats.low}</strong>
              </div>
              <div className="summary-tile info">
                <span>Info</span>
                <strong>{severityStats.info}</strong>
              </div>
            </div>
          )}

          {selectedJob && findings.length > 0 && (
            <div className="findings-controls">
              <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
                <option value="all">Toutes sévérités</option>
                <option value="critical">Critique</option>
                <option value="high">Élevé</option>
                <option value="medium">Moyen</option>
                <option value="low">Faible</option>
                <option value="info">Info</option>
              </select>

              <select value={toolFilter} onChange={(e) => setToolFilter(e.target.value)}>
                <option value="all">Tous les outils</option>
                {availableTools.map((tool) => (
                  <option key={tool} value={tool}>
                    {tool.toUpperCase()}
                  </option>
                ))}
              </select>

              <select value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
                <option value="severity">Tri: Sévérité</option>
                <option value="recent">Tri: Plus récent</option>
              </select>

              <select value={groupMode} onChange={(e) => setGroupMode(e.target.value)}>
                <option value="tool">Grouper: Outil</option>
                <option value="target">Grouper: Cible</option>
                <option value="none">Sans groupe</option>
              </select>

              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Rechercher titre, cible, evidence..."
              />

              <div className="export-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={onExportJson}
                  disabled={sortedFindings.length === 0}
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={onExportCsv}
                  disabled={sortedFindings.length === 0}
                >
                  Export CSV
                </button>
              </div>
            </div>
          )}

          {findings.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>
                {selectedJob 
                  ? selectedJob.status === "queued"
                    ? "Scan en file d'attente, en attente de démarrage..."
                    : selectedJob.status === "running"
                    ? "Scan en cours, les résultats apparaîtront ici..."
                    : "Aucune vulnérabilité trouvée"
                  : "Sélectionnez une tâche de scan pour voir les résultats"
                }
              </p>
            </div>
          ) : sortedFindings.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="8" x2="16" y2="16" />
              </svg>
              <p>Aucun résultat ne correspond aux filtres sélectionnés</p>
            </div>
          ) : (
            <div className="findings-groups">
              {groupedFindings.map((group) => (
                <section className="finding-group" key={group.label}>
                  <h3>{group.label}</h3>
                  <ul className="findings">
                    {group.items.map((f) => {
                      const isExpanded = expandedEvidence.includes(f.id);
                      const isLongEvidence = f.evidence.length > 220;
                      const evidenceText =
                        isLongEvidence && !isExpanded ? `${f.evidence.slice(0, 220)}...` : f.evidence;
                      const artifactName = f.artifact_path?.split("/").pop() ?? null;
                      const artifactUrl =
                        selectedJob && artifactName
                          ? `${API_BASE}/api/v1/jobs/${selectedJob.id}/artifacts/${encodeURIComponent(artifactName)}`
                          : null;

                      return (
                        <li key={f.id} className="finding-card">
                          <div className="finding-top">
                            <div className="finding-heading">
                              <strong>{f.title}</strong>
                              <span className="finding-meta">
                                {f.tool.toUpperCase()} sur {f.target}
                              </span>
                            </div>
                            <div className={`sev ${f.severity.toLowerCase()}`}>
                              {getSeverityLabel(f.severity.toLowerCase())}
                            </div>
                          </div>

                          <code>{evidenceText}</code>

                          <div className="finding-actions">
                            {isLongEvidence && (
                              <button
                                type="button"
                                className="secondary"
                                onClick={() => toggleEvidence(f.id)}
                              >
                                {isExpanded ? "Réduire" : "Voir plus"}
                              </button>
                            )}
                            {artifactUrl && (
                              <a href={artifactUrl} target="_blank" rel="noreferrer" className="artifact-link">
                                Ouvrir artifact
                              </a>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

export default App;
