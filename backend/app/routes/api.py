from fastapi import APIRouter
from app.routes.health import router as health_router
from app.routes.courses import router as courses_router
from app.routes.learners import router as learners_router

api_router = APIRouter(prefix="/api")
api_router.include_router(health_router)
api_router.include_router(courses_router)
api_router.include_router(learners_router)

__all__ = ["api_router"]
