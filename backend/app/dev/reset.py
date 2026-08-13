import sys
from app.database import SessionLocal
from app.services.dev_service import DevService


def main():
    print("=" * 60)
    print("LINGOLOOP: DEVELOPMENT PROGRESS RESET")
    print("=" * 60)
    db = SessionLocal()
    try:
        res = DevService.reset_progress(db)
        print(f"Status : {res['message']}")
        print(f"Learner: {res['learner']['name']} ({res['learner']['email']})")
        print(f"XP     : {res['learner']['total_xp']} Momentum XP")
        print(f"Hearts : {res['learner']['hearts']}/{res['learner']['max_hearts']}")
        print(f"Sparks : {res['learner']['gems']} Sparks")
        print(f"Streak : {res['learner']['streak']} days (Freezes: {res['learner']['streak_freezes']})")
        print(f"Skills : {res['learner']['skills_unlocked']} unlocked/in-progress")
        print("=" * 60)
        print("Reset completed successfully.")
    except Exception as exc:
        print(f"Error executing reset: {exc}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
