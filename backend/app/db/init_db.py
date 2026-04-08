from sqlalchemy import inspect, text

from app.db.base import Base
from app.db.session import engine
from app.models import analytics, project, site, user  # noqa: F401


def check_database_connection() -> bool:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return True


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_site_analytics_created_at_column()


def ensure_site_analytics_created_at_column() -> None:
    inspector = inspect(engine)
    columns = [column["name"] for column in inspector.get_columns("site_analytics")]

    if "created_at" not in columns:
        with engine.begin() as connection:
            connection.execute(
                text(
                    """
                    ALTER TABLE site_analytics
                    ADD COLUMN created_at TIMESTAMP DEFAULT NOW() NOT NULL
                    """
                )
            )
