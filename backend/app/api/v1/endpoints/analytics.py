from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.analytics import SiteAnalytics
from app.models.site import Site
from app.models.user import User
from app.schemas.analytics import SiteAnalyticsCreate, SiteAnalyticsResponse

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post("/site", response_model=SiteAnalyticsResponse, status_code=status.HTTP_201_CREATED)
def create_site_analytics(
    payload: SiteAnalyticsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SiteAnalyticsResponse:
    _ = current_user

    site = db.get(Site, payload.site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    analytics = SiteAnalytics(
        site_id=payload.site_id,
        observed_on=payload.observed_on,
        carbon_score=payload.carbon_score,
        biodiversity_score=payload.biodiversity_score,
        vegetation_index=payload.vegetation_index,
        soil_health_index=payload.soil_health_index,
        notes=payload.notes,
    )

    db.add(analytics)
    db.commit()
    db.refresh(analytics)
    return analytics


@router.get("/site/{site_id}", response_model=list[SiteAnalyticsResponse])
def get_site_analytics(
    site_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[SiteAnalyticsResponse]:
    _ = current_user

    site = db.get(Site, site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    records = db.scalars(
        select(SiteAnalytics)
        .where(SiteAnalytics.site_id == site_id)
        .order_by(SiteAnalytics.observed_on.asc())
    ).all()

    return list(records)
