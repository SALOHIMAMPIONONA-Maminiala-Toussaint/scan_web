import json
import shutil
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.celery_app import celery_app
from app.config import settings
from app.database import Base, engine, get_db
from app.models import Finding, ScanJob
from app.schemas import FindingResponse, JobResponse, ScanCreate


def queue_job(job_id: int) -> None:
    celery_app.send_task("scan.run_job", args=[job_id])


app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    Path(settings.artifacts_dir).mkdir(parents=True, exist_ok=True)


@app.api_route("/", methods=["GET", "HEAD"])
def root() -> RedirectResponse:
    return RedirectResponse(url="http://localhost:5173", status_code=307)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/v1/labs/sql-injection")
def sql_injection_lab(name: str = "demo", db: Session = Depends(get_db)) -> dict:
    """Intentionally vulnerable endpoint used to validate SQLMap in this lab project."""
    # WARNING: This endpoint deliberately uses string interpolation for SQLi demonstration.
    query = text(f"SELECT id, name, status FROM scan_jobs WHERE name = '{name}' LIMIT 10")
    rows = db.execute(query).mappings().all()
    return {
        "lab": "sql-injection",
        "query_name": name,
        "row_count": len(rows),
        "rows": rows,
    }


@app.post("/api/v1/labs/sql-injection")
def sql_injection_lab_post(username: str = "demo", db: Session = Depends(get_db)) -> dict:
    """SQL injection lab endpoint accepting POST parameters for SQLMap testing."""
    # WARNING: This endpoint deliberately uses string interpolation for SQLi demonstration.
    query = text(f"SELECT id, name FROM scan_jobs WHERE id > 0 AND name LIKE '%{username}%' LIMIT 10")
    rows = db.execute(query).mappings().all()
    return {
        "lab": "sql-injection-post",
        "username": username,
        "row_count": len(rows),
        "rows": rows,
    }


@app.post("/api/v1/jobs", response_model=JobResponse)
def create_job(payload: ScanCreate, db: Session = Depends(get_db)) -> ScanJob:
    job = ScanJob(
        name=payload.name,
        status="queued",
        requested_tools=json.dumps(payload.tools),
        requested_targets=json.dumps([target.model_dump() for target in payload.targets]),
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    queue_job(job.id)
    return job


@app.get("/api/v1/jobs", response_model=list[JobResponse])
def list_jobs(db: Session = Depends(get_db)) -> list[ScanJob]:
    return db.query(ScanJob).order_by(ScanJob.created_at.desc()).all()


@app.get("/api/v1/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)) -> ScanJob:
    job = db.get(ScanJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.get("/api/v1/jobs/{job_id}/findings", response_model=list[FindingResponse])
def get_findings(job_id: int, db: Session = Depends(get_db)) -> list[Finding]:
    job = db.get(ScanJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return (
        db.query(Finding)
        .filter(Finding.job_id == job_id)
        .order_by(Finding.created_at.desc())
        .all()
    )


@app.post("/api/v1/jobs/{job_id}/retry", response_model=JobResponse)
def retry_job(job_id: int, db: Session = Depends(get_db)) -> ScanJob:
    job = db.get(ScanJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job.status = "queued"
    job.error_message = None
    db.query(Finding).filter(Finding.job_id == job_id).delete()
    db.commit()
    db.refresh(job)

    queue_job(job.id)
    return job


@app.delete("/api/v1/jobs/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)) -> dict:
    job = db.get(ScanJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    db.delete(job)
    db.commit()

    artifact_dir = Path(settings.artifacts_dir) / str(job_id)
    if artifact_dir.exists():
        shutil.rmtree(artifact_dir, ignore_errors=True)

    return {"message": "Job deleted", "job_id": job_id}


@app.delete("/api/v1/jobs")
def delete_all_jobs(db: Session = Depends(get_db)) -> dict:
    jobs = db.query(ScanJob).all()
    deleted_count = len(jobs)

    for job in jobs:
        db.delete(job)
    db.commit()

    db.execute(text("SELECT setval(pg_get_serial_sequence('scan_jobs', 'id'), 1, false)"))
    db.execute(text("SELECT setval(pg_get_serial_sequence('findings', 'id'), 1, false)"))
    db.commit()

    artifacts_root = Path(settings.artifacts_dir)
    if artifacts_root.exists():
        for child in artifacts_root.iterdir():
            if child.is_dir():
                shutil.rmtree(child, ignore_errors=True)

    return {"message": "All jobs deleted", "deleted_count": deleted_count}


@app.get("/api/v1/jobs/{job_id}/artifacts/{artifact_name}")
def download_artifact(job_id: int, artifact_name: str) -> FileResponse:
    full_path = Path(settings.artifacts_dir) / str(job_id) / artifact_name
    if not full_path.exists():
        raise HTTPException(status_code=404, detail="Artifact not found")
    return FileResponse(path=full_path)
