from app.celery_app import celery_app
from app.task_runner import execute_scan_job


@celery_app.task(name="scan.run_job")
def run_job(job_id: int) -> None:
    execute_scan_job(job_id)
