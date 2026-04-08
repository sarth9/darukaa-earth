from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.schemas.site import SiteCreate, SiteResponse

router = APIRouter(tags=["sites"])


@router.post("/sites", response_model=SiteResponse, status_code=status.HTTP_201_CREATED)
def create_site(
    payload: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SiteResponse:
    _ = current_user

    project = db.get(Project, payload.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    existing_site = db.scalar(select(Site).where(Site.site_code == payload.site_code))
    if existing_site:
        raise HTTPException(status_code=400, detail="Site code already exists")

    site = Site(
        project_id=payload.project_id,
        name=payload.name,
        site_code=payload.site_code,
        area_hectares=payload.area_hectares,
        polygon_geojson=payload.polygon_geojson,
        centroid_lat=payload.centroid_lat,
        centroid_lng=payload.centroid_lng,
        status=payload.status,
    )

    db.add(site)
    db.commit()
    db.refresh(site)
    return site


@router.get("/sites", response_model=list[SiteResponse])
def list_sites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[SiteResponse]:
    _ = current_user
    sites = db.scalars(select(Site).order_by(Site.created_at.desc())).all()
    return list(sites)


@router.get("/sites/{site_id}", response_model=SiteResponse)
def get_site(
    site_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SiteResponse:
    _ = current_user
    site = db.get(Site, site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site


@router.get("/projects/{project_id}/sites", response_model=list[SiteResponse])
def list_project_sites(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[SiteResponse]:
    _ = current_user

    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    sites = db.scalars(
        select(Site).where(Site.project_id == project_id).order_by(Site.created_at.desc())
    ).all()

    return list(sites)
