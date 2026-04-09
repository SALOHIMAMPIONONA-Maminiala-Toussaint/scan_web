# Scan Pipeline (Robust)

Automated vulnerability scanning platform with:
- FastAPI API
- Celery worker + Redis queue
- PostgreSQL storage
- React TypeScript dashboard
- Docker Compose orchestration

## Stack

- Backend: FastAPI, SQLAlchemy, Celery
- Queue: Redis
- DB: PostgreSQL
- Frontend: React + TypeScript + Vite
- Scanners: nmap, nikto, sqlmap, trivy

## Quick start

1. Run the stack:

```bash
docker compose up --build
```

2. Open:
- Frontend: http://localhost:5173
- Backend health: http://localhost:8000/health

## API

- `POST /api/v1/jobs` create job
- `GET /api/v1/jobs` list jobs
- `GET /api/v1/jobs/{id}` get job details
- `GET /api/v1/jobs/{id}/findings` list findings
- `POST /api/v1/jobs/{id}/retry` retry job

## Example payload

```json
{
  "name": "Local scan",
  "tools": ["nmap", "nikto", "sqlmap", "trivy"],
  "targets": [
    {"type": "host", "value": "127.0.0.1"},
    {"type": "url", "value": "http://localhost:8000"},
    {"type": "filesystem", "value": "/app"},
    {"type": "image", "value": "postgres:15-alpine"}
  ]
}
```

## Notes

- Only scan assets you are authorized to test.
- The parser is intentionally simple in this base version; you can add richer JSON parsing per tool later.
- Artifacts are written under `scan-pipeline/artifacts/<job_id>/`.
