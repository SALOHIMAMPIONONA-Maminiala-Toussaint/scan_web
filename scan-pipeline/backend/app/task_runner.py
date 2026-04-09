import json
import os
import subprocess
from pathlib import Path
from urllib.parse import urlparse, urlunparse

from app.config import settings
from app.database import SessionLocal
from app.models import Finding, ScanJob
from app.parser import parse_findings


def _build_command(tool: str, target_type: str, target_value: str) -> list[str] | None:
    if tool == "nmap" and target_type == "host":
        return ["nmap", "-sV", "-Pn", target_value]

    if tool == "nikto" and target_type == "url":
        return ["nikto", "-h", target_value]

    if tool == "sqlmap" and target_type == "url":
        return ["sqlmap", "-u", target_value, "--batch", "--level=1", "--risk=1"]

    if tool == "trivy":
        if target_type == "filesystem":
            return ["trivy", "fs", target_value, "--timeout", "10m"]
        if target_type == "image":
            return ["trivy", "image", target_value, "--timeout", "10m"]

    return None


def _normalize_target(tool: str, target_type: str, target_value: str) -> str:
    """Map localhost web targets to internal Docker service name for worker-side scans."""
    if target_type != "url" or tool not in {"nikto", "sqlmap"}:
        return target_value

    parsed = urlparse(target_value)
    if parsed.hostname not in {"localhost", "127.0.0.1"}:
        return target_value

    auth = ""
    if parsed.username:
        auth = parsed.username
        if parsed.password:
            auth += f":{parsed.password}"
        auth += "@"

    port = f":{parsed.port}" if parsed.port else ""
    new_netloc = f"{auth}{settings.internal_web_host}{port}"
    return urlunparse(parsed._replace(netloc=new_netloc))


def execute_scan_job(job_id: int) -> None:
    db = SessionLocal()
    try:
        job = db.get(ScanJob, job_id)
        if not job:
            return

        job.status = "running"
        db.commit()

        tools = json.loads(job.requested_tools)
        targets = json.loads(job.requested_targets)

        artifacts_root = Path(settings.artifacts_dir) / str(job_id)
        artifacts_root.mkdir(parents=True, exist_ok=True)

        for target in targets:
            target_type = target["type"]
            original_target_value = target["value"]

            for tool in tools:
                target_value = _normalize_target(tool, target_type, original_target_value)
                command = _build_command(tool, target_type, target_value)
                if not command:
                    # Ignore incompatible tool/target pairs to avoid noisy findings in UI.
                    continue

                process = subprocess.run(command, capture_output=True, text=True, timeout=900)
                output = (process.stdout or "") + "\n" + (process.stderr or "")

                safe_target = original_target_value.replace("/", "_").replace(":", "_")
                artifact_path = artifacts_root / f"{tool}_{target_type}_{safe_target}.txt"
                artifact_path.write_text(output, encoding="utf-8", errors="ignore")

                parsed = parse_findings(tool, original_target_value, output)
                for finding in parsed:
                    db.add(
                        Finding(
                            job_id=job.id,
                            tool=finding["tool"],
                            target=finding["target"],
                            severity=finding["severity"],
                            title=finding["title"],
                            evidence=finding["evidence"],
                            artifact_path=os.path.relpath(artifact_path, settings.artifacts_dir),
                        )
                    )
                db.commit()

        job.status = "done"
        job.error_message = None
        db.commit()

    except Exception as exc:
        job = db.get(ScanJob, job_id)
        if job:
            job.status = "failed"
            job.error_message = str(exc)
            db.commit()
    finally:
        db.close()
