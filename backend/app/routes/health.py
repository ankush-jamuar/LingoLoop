from fastapi import APIRouter
from app.schemas.health import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """Returns the operational status of the LingoLoop API service."""
    return HealthResponse(status="ok", service="lingoloop-api")
