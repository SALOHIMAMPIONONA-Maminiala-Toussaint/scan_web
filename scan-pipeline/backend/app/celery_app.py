from celery import Celery

from app.config import settings


celery_app = Celery(
    "scan_pipeline",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks"],
)

celery_app.conf.task_track_started = True
celery_app.conf.result_expires = 3600
celery_app.conf.task_serializer = "json"
celery_app.conf.accept_content = ["json"]
celery_app.conf.result_serializer = "json"
