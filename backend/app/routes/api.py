from fastapi import APIRouter
from app.routes.health import router as health_router
from app.routes.courses import router as courses_router
from app.routes.learners import router as learners_router
from app.routes.lessons import router as lessons_router
from app.routes.gamification import router as gamification_router
from app.routes.dev import router as dev_router

api_router = APIRouter(prefix="/api")
api_router.include_router(health_router)
api_router.include_router(courses_router)
api_router.include_router(learners_router)
api_router.include_router(lessons_router)
api_router.include_router(gamification_router)
api_router.include_router(dev_router)

__all__ = ["api_router"]
