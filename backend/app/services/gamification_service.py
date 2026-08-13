from datetime import datetime, time, timedelta, timezone
from typing import List, Optional, Set
from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import (
    Achievement,
    DailyActivity,
    LearnerStats,
    LessonAttempt,
    User,
    UserAchievement,
    UserSkillProgress,
)
from app.schemas.gamification import (
    AchievementItem,
    AchievementsResponse,
    BuyStreakFreezeResponse,
    HeartStatusResponse,
    LeaderboardEntry,
    LeaderboardResponse,
    RefillHeartsResponse,
)


class GamificationService:
    HEART_REGEN_INTERVAL_SECONDS = 14400  # 4 hours per heart
    REFILL_HEARTS_COST_SPARKS = 50
    STREAK_FREEZE_COST_SPARKS = 100
    MAX_STREAK_FREEZES = 2

    @classmethod
    def evaluate_heart_regen(
        cls, db: Session, user_id: int
    ) -> HeartStatusResponse:
        """
        Authoritatively evaluates time-based heart regeneration.
        Preserves partial elapsed progress towards next heart.
        Capped strictly at max_hearts (5).
        """
        now_utc = datetime.now(timezone.utc)
        stats = db.scalars(
            select(LearnerStats).where(LearnerStats.user_id == user_id)
        ).first()
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Learner stats for user {user_id} not found.",
            )

        # If hearts_updated_at is missing, initialize it
        if not stats.hearts_updated_at:
            stats.hearts_updated_at = now_utc

        seconds_until_next: Optional[int] = None

        if stats.hearts >= stats.max_hearts:
            stats.hearts = stats.max_hearts
            stats.hearts_updated_at = now_utc
            seconds_until_next = None
        else:
            last_updated = stats.hearts_updated_at
            if last_updated.tzinfo is None:
                last_updated = last_updated.replace(tzinfo=timezone.utc)

            elapsed_seconds = max(0, (now_utc - last_updated).total_seconds())
            hearts_to_add = int(elapsed_seconds // cls.HEART_REGEN_INTERVAL_SECONDS)
            remainder_seconds = elapsed_seconds % cls.HEART_REGEN_INTERVAL_SECONDS

            if hearts_to_add > 0:
                new_hearts = min(stats.max_hearts, stats.hearts + hearts_to_add)
                stats.hearts = new_hearts

                if new_hearts >= stats.max_hearts:
                    stats.hearts_updated_at = now_utc
                    seconds_until_next = None
                else:
                    # Preserve remainder towards next heart
                    stats.hearts_updated_at = now_utc - timedelta(seconds=remainder_seconds)
                    seconds_until_next = int(cls.HEART_REGEN_INTERVAL_SECONDS - remainder_seconds)
            else:
                seconds_until_next = int(cls.HEART_REGEN_INTERVAL_SECONDS - remainder_seconds)

        db.commit()
        db.refresh(stats)

        return HeartStatusResponse(
            hearts=stats.hearts,
            max_hearts=stats.max_hearts,
            hearts_updated_at=stats.hearts_updated_at,
            seconds_until_next_heart=seconds_until_next,
            can_refill_with_sparks=(stats.gems >= cls.REFILL_HEARTS_COST_SPARKS and stats.hearts < stats.max_hearts),
            sparks_refill_cost=cls.REFILL_HEARTS_COST_SPARKS,
            sparks_balance=stats.gems,
            streak_freeze_count=stats.streak_freeze_count,
            max_streak_freezes=cls.MAX_STREAK_FREEZES,
        )

    @classmethod
    def refill_hearts(cls, db: Session, user_id: int) -> RefillHeartsResponse:
        """
        Deducts 50 Sparks from the learner's balance and refills hearts to 5/5.
        Validates balance and capacity.
        """
        now_utc = datetime.now(timezone.utc)
        stats = db.scalars(
            select(LearnerStats).where(LearnerStats.user_id == user_id)
        ).first()
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Learner stats not found.",
            )

        if stats.hearts >= stats.max_hearts:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Hearts are already at maximum capacity.",
            )

        if stats.gems < cls.REFILL_HEARTS_COST_SPARKS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient Sparks. Heart refill costs {cls.REFILL_HEARTS_COST_SPARKS} Sparks, but you only have {stats.gems}.",
            )

        stats.gems -= cls.REFILL_HEARTS_COST_SPARKS
        stats.hearts = stats.max_hearts
        stats.hearts_updated_at = now_utc

        db.commit()
        db.refresh(stats)

        return RefillHeartsResponse(
            success=True,
            hearts=stats.hearts,
            max_hearts=stats.max_hearts,
            sparks_spent=cls.REFILL_HEARTS_COST_SPARKS,
            sparks_remaining=stats.gems,
            message="Hearts successfully refilled to maximum!",
        )

    @classmethod
    def buy_streak_freeze(
        cls, db: Session, user_id: int
    ) -> BuyStreakFreezeResponse:
        """
        Deducts 100 Sparks and increments the learner's stored streak freeze count (max 2).
        """
        stats = db.scalars(
            select(LearnerStats).where(LearnerStats.user_id == user_id)
        ).first()
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Learner stats not found.",
            )

        if stats.streak_freeze_count >= cls.MAX_STREAK_FREEZES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Maximum streak freeze capacity ({cls.MAX_STREAK_FREEZES}) reached.",
            )

        if stats.gems < cls.STREAK_FREEZE_COST_SPARKS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient Sparks. Streak Freeze costs {cls.STREAK_FREEZE_COST_SPARKS} Sparks, but you only have {stats.gems}.",
            )

        stats.gems -= cls.STREAK_FREEZE_COST_SPARKS
        stats.streak_freeze_count += 1

        db.commit()
        db.refresh(stats)

        return BuyStreakFreezeResponse(
            success=True,
            streak_freeze_count=stats.streak_freeze_count,
            max_streak_freezes=cls.MAX_STREAK_FREEZES,
            sparks_spent=cls.STREAK_FREEZE_COST_SPARKS,
            sparks_remaining=stats.gems,
            message="Streak Freeze equipped! Your next missed day will be protected.",
        )

    @classmethod
    def get_leaderboard(
        cls, db: Session, user_id: int
    ) -> LeaderboardResponse:
        """
        Calculates the active weekly leaderboard for the Silver Loop League.
        Metric: sum of DailyActivity.xp_earned within the current ISO calendar week (Monday 00:00 UTC to Sunday 23:59 UTC).
        Tie-breaking: weekly_xp DESC, longest_streak DESC, user_id ASC.
        """
        now_utc = datetime.now(timezone.utc)
        today = now_utc.date()

        # Monday of current week
        week_start_date = today - timedelta(days=today.weekday())
        week_start_dt = datetime.combine(week_start_date, time.min, tzinfo=timezone.utc)
        week_end_dt = week_start_dt + timedelta(days=7)

        # 1. Fetch all users with their stats
        users_stmt = select(User).options()
        all_users = db.scalars(users_stmt).all()

        # 2. Fetch all daily activities in the current week window
        acts_stmt = (
            select(
                DailyActivity.user_id,
                func.coalesce(func.sum(DailyActivity.xp_earned), 0).label("week_xp"),
            )
            .where(
                DailyActivity.activity_date >= week_start_date,
                DailyActivity.activity_date < week_start_date + timedelta(days=7),
            )
            .group_by(DailyActivity.user_id)
        )
        act_rows = db.execute(acts_stmt).all()
        user_week_xp_map = {row[0]: int(row[1]) for row in act_rows}

        # 3. Build ranking list
        scored_users = []
        for u in all_users:
            stats = u.stats
            streak = stats.current_streak if stats else 0
            longest = stats.longest_streak if stats else 0
            weekly_xp = user_week_xp_map.get(u.id, 0)
            scored_users.append({
                "user_id": u.id,
                "name": u.name,
                "avatar_key": u.avatar_key,
                "weekly_xp": weekly_xp,
                "current_streak": streak,
                "longest_streak": longest,
            })

        # Sort: weekly_xp DESC, longest_streak DESC, user_id ASC
        scored_users.sort(
            key=lambda x: (-x["weekly_xp"], -x["longest_streak"], x["user_id"])
        )

        entries: List[LeaderboardEntry] = []
        user_rank = 1
        user_weekly_xp = 0

        for idx, item in enumerate(scored_users):
            rank = idx + 1
            if rank <= 3:
                zone = "podium"
            elif rank <= 4:
                zone = "promotion"
            elif rank <= 8:
                zone = "safe"
            else:
                zone = "demotion"

            is_current = (item["user_id"] == user_id)
            if is_current:
                user_rank = rank
                user_weekly_xp = item["weekly_xp"]

            entries.append(
                LeaderboardEntry(
                    rank=rank,
                    user_id=item["user_id"],
                    name=item["name"],
                    avatar_key=item["avatar_key"],
                    weekly_xp=item["weekly_xp"],
                    current_streak=item["current_streak"],
                    is_current_user=is_current,
                    zone=zone,
                )
            )

        return LeaderboardResponse(
            tier_name="Silver Loop",
            cycle_starts_at=week_start_dt,
            cycle_ends_at=week_end_dt,
            user_rank=user_rank,
            user_weekly_xp=user_weekly_xp,
            promotion_cutoff=4,
            demotion_cutoff=9,
            entries=entries,
        )

    @classmethod
    def get_achievements(
        cls, db: Session, user_id: int
    ) -> AchievementsResponse:
        """
        Lists all achievements with unlock status and progress for the learner.
        """
        stats = db.scalars(
            select(LearnerStats).where(LearnerStats.user_id == user_id)
        ).first()

        all_achievements = db.scalars(
            select(Achievement).order_by(Achievement.id.asc())
        ).all()

        unlocked_records = db.scalars(
            select(UserAchievement).where(UserAchievement.user_id == user_id)
        ).all()
        unlocked_map = {ua.achievement_id: ua.unlocked_at for ua in unlocked_records}

        # Query metrics for progress computation
        distinct_lessons_completed = db.scalar(
            select(func.count(func.distinct(LessonAttempt.lesson_id))).where(
                LessonAttempt.user_id == user_id,
                LessonAttempt.status == "completed",
            )
        ) or 0

        perfect_lessons_completed = db.scalar(
            select(func.count(LessonAttempt.id)).where(
                LessonAttempt.user_id == user_id,
                LessonAttempt.status == "completed",
                LessonAttempt.hearts_lost == 0,
            )
        ) or 0

        completed_skills = db.scalar(
            select(func.count(UserSkillProgress.id)).where(
                UserSkillProgress.user_id == user_id,
                UserSkillProgress.completed == True,
            )
        ) or 0

        items: List[AchievementItem] = []
        for ach in all_achievements:
            is_unlocked = ach.id in unlocked_map
            unlocked_at = unlocked_map.get(ach.id)

            progress = 100 if is_unlocked else 0
            if not is_unlocked:
                req_val = max(1, ach.requirement_value)
                if ach.requirement_type == "lessons_completed":
                    progress = min(99, int((distinct_lessons_completed / req_val) * 100))
                elif ach.requirement_type == "total_xp":
                    xp = stats.total_xp if stats else 0
                    progress = min(99, int((xp / req_val) * 100))
                elif ach.requirement_type == "streak":
                    streak = stats.current_streak if stats else 0
                    progress = min(99, int((streak / req_val) * 100))
                elif ach.requirement_type == "perfect_loop":
                    progress = min(99, int((perfect_lessons_completed / req_val) * 100))
                elif ach.requirement_type == "island_hopper":
                    progress = min(99, int((completed_skills / req_val) * 100))

            items.append(
                AchievementItem(
                    id=ach.id,
                    key=ach.key,
                    title=ach.title,
                    description=ach.description,
                    icon_key=ach.icon_key,
                    reward_sparks=ach.reward_gems,
                    is_unlocked=is_unlocked,
                    unlocked_at=unlocked_at,
                    progress=progress,
                )
            )

        return AchievementsResponse(
            total_achievements=len(items),
            unlocked_count=len(unlocked_map),
            achievements=items,
        )

    @classmethod
    def evaluate_achievements(
        cls, db: Session, user_id: int
    ) -> List[str]:
        """
        Evaluates milestone criteria and automatically unlocks newly satisfied achievements.
        Credits Sparks rewards to LearnerStats immediately.
        Guaranteed idempotent by uq_user_achievement unique constraint.
        """
        now_utc = datetime.now(timezone.utc)
        stats = db.scalars(
            select(LearnerStats).where(LearnerStats.user_id == user_id)
        ).first()
        if not stats:
            return []

        all_achievements = db.scalars(select(Achievement)).all()
        existing_unlocked = set(
            db.scalars(
                select(UserAchievement.achievement_id).where(
                    UserAchievement.user_id == user_id
                )
            ).all()
        )

        distinct_lessons_completed = db.scalar(
            select(func.count(func.distinct(LessonAttempt.lesson_id))).where(
                LessonAttempt.user_id == user_id,
                LessonAttempt.status == "completed",
            )
        ) or 0

        perfect_lessons_completed = db.scalar(
            select(func.count(LessonAttempt.id)).where(
                LessonAttempt.user_id == user_id,
                LessonAttempt.status == "completed",
                LessonAttempt.hearts_lost == 0,
            )
        ) or 0

        completed_skills = db.scalar(
            select(func.count(UserSkillProgress.id)).where(
                UserSkillProgress.user_id == user_id,
                UserSkillProgress.completed == True,
            )
        ) or 0

        newly_unlocked_titles: List[str] = []

        for ach in all_achievements:
            if ach.id in existing_unlocked:
                continue

            satisfied = False
            req_type = ach.requirement_type
            req_val = ach.requirement_value

            if req_type == "lessons_completed":
                satisfied = (distinct_lessons_completed >= req_val)
            elif req_type == "total_xp":
                satisfied = (stats.total_xp >= req_val)
            elif req_type == "streak":
                satisfied = (stats.current_streak >= req_val)
            elif req_type == "perfect_loop":
                satisfied = (perfect_lessons_completed >= req_val)
            elif req_type == "island_hopper":
                satisfied = (completed_skills >= req_val)

            if satisfied:
                user_ach = UserAchievement(
                    user_id=user_id,
                    achievement_id=ach.id,
                    unlocked_at=now_utc,
                )
                db.add(user_ach)
                stats.gems += ach.reward_gems
                newly_unlocked_titles.append(ach.title)

        if newly_unlocked_titles:
            db.commit()
            db.refresh(stats)

        return newly_unlocked_titles
