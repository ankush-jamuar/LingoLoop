"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoopMap } from "@/components/learning-path/LoopMap";
import { ContinueLearningCard } from "@/components/learning-path/ContinueLearningCard";
import {
  HeroCardSkeleton,
  LoopMapSkeleton,
} from "@/components/ui/SkeletonLoader";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  getCurrentLearner,
  getNextLesson,
  LearnerProfile,
  NextLesson,
} from "@/lib/api/learner";
import {
  getActiveCourse,
  getLoopMap,
  LoopMap as LoopMapType,
  SkillMapNode,
} from "@/lib/api/course";
import { Trophy } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [learner, setLearner] = useState<LearnerProfile | null>(null);
  const [loopMap, setLoopMap] = useState<LoopMapType | null>(null);
  const [nextLesson, setNextLesson] = useState<NextLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchExperience = useCallback(async () => {
    // 1. Fetch learner profile & stats
    const learnerData = await getCurrentLearner();
    // 2. Fetch active course summary
    const courseSummary = await getActiveCourse();
    // 3. Fetch full Loop Map & next lesson recommendation concurrently
    const [mapData, nextLessonData] = await Promise.all([
      getLoopMap(courseSummary.id),
      getNextLesson().catch(() => null),
    ]);

    return { learnerData, mapData, nextLessonData };
  }, []);

  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    setError(null);
    fetchExperience()
      .then(({ learnerData, mapData, nextLessonData }) => {
        setLearner(learnerData);
        setLoopMap(mapData);
        setNextLesson(nextLessonData);
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to connect to LingoLoop learning service."
        );
      })
      .finally(() => {
        setIsRetrying(false);
      });
  }, [fetchExperience]);

  useEffect(() => {
    let ignore = false;

    fetchExperience()
      .then(({ learnerData, mapData, nextLessonData }) => {
        if (!ignore) {
          setLearner(learnerData);
          setLoopMap(mapData);
          setNextLesson(nextLessonData);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to connect to LingoLoop learning service."
          );
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [fetchExperience]);

  const handleStartLesson = (
    skillOrNext: SkillMapNode | NextLesson,
    lessonId?: number
  ) => {
    let targetLessonId: number | undefined;
    if ("lesson_id" in skillOrNext) {
      targetLessonId = skillOrNext.lesson_id;
    } else {
      targetLessonId = lessonId || skillOrNext.lessons[0]?.id;
    }

    if (targetLessonId) {
      router.push(`/lesson/${targetLessonId}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream selection:bg-mint selection:text-ink font-body">
      {/* Top Bar with Live Stats */}
      <Navbar learner={learner} onStatsUpdated={handleRetry} />

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6">
        {/* Loading Skeleton State */}
        {isLoading && (
          <div className="w-full flex flex-col items-center">
            <HeroCardSkeleton />
            <LoopMapSkeleton />
          </div>
        )}

        {/* Error Fallback State */}
        {!isLoading && error && (
          <ErrorState
            title="Could not load your Loop Map"
            message={error}
            onRetry={handleRetry}
            isRetrying={isRetrying}
          />
        )}

        {/* Main Learning Path / Loop Map Experience */}
        {!isLoading && !error && loopMap && (
          <div className="w-full max-w-4xl flex flex-col items-center pt-2">
            {/* Contextual Continue Learning Hero Banner */}
            <ContinueLearningCard
              nextLesson={nextLesson}
              onStartLesson={handleStartLesson}
            />

            {/* Visual Course Header Subtitle */}
            <div className="text-center mt-4 mb-2 space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cream-muted border border-ink/10 text-xs font-extrabold font-display uppercase tracking-widest text-ink-subtle">
                <Trophy className="w-3.5 h-3.5 text-sun fill-sun" />
                <span>{loopMap.course_name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink font-display tracking-tight">
                Your <span className="text-coral">Loop</span> Map
              </h1>
            </div>

            {/* Connected Units & Skill Nodes */}
            <LoopMap mapData={loopMap} onStartLesson={handleStartLesson} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
