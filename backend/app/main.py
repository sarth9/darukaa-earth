from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.db.init_db import check_database_connection, create_tables

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    check_database_connection()
    create_tables()


app.include_router(api_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Darukaa Earth API running"}


@app.get("/health")
def health() -> dict[str, str]:
    check_database_connection()
    return {"status": "ok", "database": "connected"}
