from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.dev_service import DevService

router = APIRouter(prefix="/dev", tags=["development"])


@router.post("/reset-progress")
def reset_progress(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    DEVELOPMENT-ONLY: Resets learner-generated state back to the exact pristine seeded baseline.
    Protected by ENABLE_DEV_RESET environment flag.
    """
    return DevService.reset_progress(db)
