"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  abandonLesson,
  completeLesson,
  ExerciseValidationResult,
  LessonCompletionResult,
  LessonSession,
  MatchedPairItem,
  startLesson,
  submitExerciseAnswer,
  SubmitAnswerPayload,
} from "@/lib/api/lesson";
import { LessonHeader } from "@/components/lesson/LessonHeader";
import { LessonFeedbackPanel } from "@/components/lesson/LessonFeedbackPanel";
import { MiloFeedbackModal } from "@/components/common/MiloFeedbackModal";
import { ExitConfirmationModal } from "@/components/lesson/ExitConfirmationModal";
import { LessonCompleteScreen } from "@/components/lesson/LessonCompleteScreen";
import { LessonFailedScreen } from "@/components/lesson/LessonFailedScreen";
import { MultipleChoiceExercise } from "@/components/lesson/exercises/MultipleChoiceExercise";
import { TranslateExercise } from "@/components/lesson/exercises/TranslateExercise";
import { MatchPairsExercise } from "@/components/lesson/exercises/MatchPairsExercise";
import { FillBlankExercise } from "@/components/lesson/exercises/FillBlankExercise";
import { TypeAnswerExercise } from "@/components/lesson/exercises/TypeAnswerExercise";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonItem } from "@/components/ui/SkeletonLoader";
import { Sparkles } from "lucide-react";

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const lessonIdStr = params?.lessonId as string;
  const lessonId = parseInt(lessonIdStr, 10);

  // Lesson Session State
  const [session, setSession] = useState<LessonSession | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Exercise Input State
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [assembledTokens, setAssembledTokens] = useState<string[]>([]);
  const [usedBankIndices, setUsedBankIndices] = useState<Set<number>>(new Set());
  const [matchedPairs, setMatchedPairs] = useState<MatchedPairItem[]>([]);
  const [typedAnswer, setTypedAnswer] = useState("");

  // Feedback & Progression State
  const [feedbackStatus, setFeedbackStatus] = useState<
    "idle" | "submitting" | "correct" | "wrong"
  >("idle");
  const [validationResult, setValidationResult] =
    useState<ExerciseValidationResult | null>(null);
  const [completionResult, setCompletionResult] =
    useState<LessonCompletionResult | null>(null);
  const [isLessonFailed, setIsLessonFailed] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isHeartLostAnim, setIsHeartLostAnim] = useState(false);

  // 1. Initialize Lesson Session
  const initLesson = useCallback(async () => {
    if (isNaN(lessonId)) {
      setError("Invalid lesson ID specified.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const sess = await startLesson(lessonId);
      setSession(sess);
      setCurrentExerciseIndex(0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initialize lesson session."
      );
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    let ignore = false;
    if (!isNaN(lessonId)) {
      startLesson(lessonId)
        .then((sess) => {
          if (!ignore) {
            setSession(sess);
            setCurrentExerciseIndex(0);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          if (!ignore) {
            setError(
              err instanceof Error
                ? err.message
                : "Failed to initialize lesson session."
            );
            setIsLoading(false);
          }
        });
    }

    return () => {
      ignore = true;
    };
  }, [lessonId]);

  // Current Active Exercise
  const currentExercise = useMemo(() => {
    if (!session || !session.exercises.length) return null;
    return session.exercises[currentExerciseIndex] || null;
  }, [session, currentExerciseIndex]);

  // Determine whether the user has provided an answer to check
  const canSubmit = useMemo(() => {
    if (!currentExercise || feedbackStatus !== "idle") return false;
    switch (currentExercise.type) {
      case "multiple_choice":
        return Boolean(selectedOptionId);
      case "translate":
        return assembledTokens.length > 0;
      case "match_pairs":
        return (
          matchedPairs.length ===
          (currentExercise.pair_left_tokens?.length || 0)
        );
      case "fill_blank":
      case "type_answer":
        return typedAnswer.trim().length > 0;
      default:
        return false;
    }
  }, [
    currentExercise,
    feedbackStatus,
    selectedOptionId,
    assembledTokens,
    matchedPairs,
    typedAnswer,
  ]);

  // Translate token handlers
  const handleTokenAdd = (token: string, bankIndex: number) => {
    if (feedbackStatus !== "idle") return;
    setAssembledTokens((prev) => [...prev, token]);
    setUsedBankIndices((prev) => new Set(prev).add(bankIndex));
  };

  const handleTokenRemove = (assembledIndex: number) => {
    if (feedbackStatus !== "idle") return;
    const tokenToRemove = assembledTokens[assembledIndex];
    // Find matching index in word bank to unmark
    const wordBank = currentExercise?.word_bank || [];
    let bankIdxToFree = -1;
    for (let i = 0; i < wordBank.length; i++) {
      if (wordBank[i] === tokenToRemove && usedBankIndices.has(i)) {
        bankIdxToFree = i;
        break;
      }
    }

    setAssembledTokens((prev) => prev.filter((_, idx) => idx !== assembledIndex));
    if (bankIdxToFree !== -1) {
      setUsedBankIndices((prev) => {
        const next = new Set(prev);
        next.delete(bankIdxToFree);
        return next;
      });
    }
  };

  // 2. Submit Answer for Authoritative Backend Validation
  const handleSubmitAnswer = async () => {
    if (!session || !currentExercise || !canSubmit) return;

    setFeedbackStatus("submitting");

    const payload: SubmitAnswerPayload = {
      exercise_id: currentExercise.id,
    };

    if (currentExercise.type === "multiple_choice") {
      payload.selected_option_id = selectedOptionId || undefined;
    } else if (currentExercise.type === "translate") {
      payload.translated_tokens = assembledTokens;
    } else if (currentExercise.type === "match_pairs") {
      payload.matched_pairs = matchedPairs;
    } else if (
      currentExercise.type === "fill_blank" ||
      currentExercise.type === "type_answer"
    ) {
      payload.typed_answer = typedAnswer.trim();
    }

    try {
      const res = await submitExerciseAnswer(session.attempt_id, payload);
      setValidationResult(res);

      // Update hearts remaining on session
      setSession((prev) =>
        prev ? { ...prev, hearts_remaining: res.hearts_remaining } : prev
      );

      if (!res.is_correct) {
        setIsHeartLostAnim(true);
        setTimeout(() => setIsHeartLostAnim(false), 500);
      }

      if (res.is_lesson_failed) {
        setIsLessonFailed(true);
      }

      setFeedbackStatus(res.is_correct ? "correct" : "wrong");
    } catch (err) {
      setFeedbackStatus("idle");
      setError(
        err instanceof Error ? err.message : "Error validating answer."
      );
    }
  };

  // 3. Continue to Next Exercise or Finalize Completion
  const handleContinue = async () => {
    if (!session) return;

    // If lesson failed due to zero hearts
    if (isLessonFailed) return;

    const totalExercises = session.exercises.length;
    if (currentExerciseIndex < totalExercises - 1) {
      // Advance to next exercise
      setCurrentExerciseIndex((prev) => prev + 1);
      // Reset exercise input buffers
      setSelectedOptionId(null);
      setAssembledTokens([]);
      setUsedBankIndices(new Set());
      setMatchedPairs([]);
      setTypedAnswer("");
      setFeedbackStatus("idle");
      setValidationResult(null);
    } else {
      // Final exercise finished -> Complete session!
      setFeedbackStatus("submitting");
      try {
        const comp = await completeLesson(session.attempt_id);
        setCompletionResult(comp);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to finalize lesson completion."
        );
      }
    }
  };

  // Exit handlers
  const handleConfirmExit = async () => {
    if (session && !completionResult) {
      try {
        await abandonLesson(session.attempt_id);
      } catch {
        // Ignore abandon error on navigation
      }
    }
    router.push("/learn");
  };

  const handleReturnHome = () => {
    router.push("/learn");
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col justify-between p-6 max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div className="flex items-center justify-between gap-4">
          <SkeletonItem className="h-8 w-8 rounded-full" />
          <SkeletonItem className="h-4 flex-1 rounded-full" />
          <SkeletonItem className="h-8 w-14 rounded-full" />
        </div>
        <div className="space-y-4">
          <SkeletonItem className="h-6 w-48 rounded-md" />
          <SkeletonItem className="h-8 w-3/4 rounded-lg" />
          <SkeletonItem className="h-32 w-full rounded-2xl" />
        </div>
        <SkeletonItem className="h-16 w-full rounded-2xl" />
      </div>
    );
  }

  // Error State
  if (error && !session) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <ErrorState
          title="Could not load lesson"
          message={error}
          onRetry={initLesson}
        />
      </div>
    );
  }

  // Failed State (Out of Hearts)
  if (isLessonFailed) {
    return (
      <div className="min-h-screen bg-cream flex flex-col justify-between">
        <LessonHeader
          progressPercentage={(currentExerciseIndex / (session?.total_exercises || 5)) * 100}
          heartsRemaining={0}
          maxHearts={session?.max_hearts || 5}
          onExitClick={handleReturnHome}
        />
        <LessonFailedScreen onReturnToMap={handleReturnHome} />
      </div>
    );
  }

  // Completed State (Full Celebration Screen)
  if (completionResult) {
    return (
      <div className="min-h-screen bg-cream flex flex-col justify-between">
        <LessonHeader
          progressPercentage={100}
          heartsRemaining={completionResult.hearts_remaining}
          maxHearts={session?.max_hearts || 5}
          onExitClick={handleReturnHome}
        />
        <LessonCompleteScreen
          result={completionResult}
          onContinue={handleReturnHome}
        />
      </div>
    );
  }

  const totalExercises = session?.total_exercises || 1;
  const progressPercent = (currentExerciseIndex / totalExercises) * 100;

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-between selection:bg-mint selection:text-ink font-body">
      {/* Lesson Header */}
      <LessonHeader
        progressPercentage={progressPercent}
        heartsRemaining={session?.hearts_remaining ?? 5}
        maxHearts={session?.max_hearts ?? 5}
        onExitClick={() => setIsExitModalOpen(true)}
        isHeartLostAnimation={isHeartLostAnim}
      />

      {/* Main Exercise Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 pb-28 sm:pb-32 w-full">
        {currentExercise && (
          <div className="w-full flex flex-col items-center justify-center animate-fade-in">
            {lessonId === 1 && currentExerciseIndex === 0 && (
              <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sun-subtle border-2 border-sun/60 text-ink text-xs font-extrabold font-display shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-sun fill-sun" />
                <span>First Loop: Select an answer and check to close your first loop!</span>
              </div>
            )}
            {currentExercise.type === "multiple_choice" && (
              <MultipleChoiceExercise
                exercise={currentExercise}
                selectedOptionId={selectedOptionId}
                onSelectOption={setSelectedOptionId}
                disabled={feedbackStatus !== "idle"}
              />
            )}

            {currentExercise.type === "translate" && (
              <TranslateExercise
                exercise={currentExercise}
                assembledTokens={assembledTokens}
                onTokenAdd={handleTokenAdd}
                onTokenRemove={handleTokenRemove}
                usedBankIndices={usedBankIndices}
                disabled={feedbackStatus !== "idle"}
              />
            )}

            {currentExercise.type === "match_pairs" && (
              <MatchPairsExercise
                exercise={currentExercise}
                matchedPairs={matchedPairs}
                onPairsChange={setMatchedPairs}
                disabled={feedbackStatus !== "idle"}
              />
            )}

            {currentExercise.type === "fill_blank" && (
              <FillBlankExercise
                exercise={currentExercise}
                typedAnswer={typedAnswer}
                onTypedAnswerChange={setTypedAnswer}
                disabled={feedbackStatus !== "idle"}
              />
            )}

            {currentExercise.type === "type_answer" && (
              <TypeAnswerExercise
                exercise={currentExercise}
                typedAnswer={typedAnswer}
                onTypedAnswerChange={setTypedAnswer}
                disabled={feedbackStatus !== "idle"}
              />
            )}
          </div>
        )}
      </main>

      {/* Bottom Sticky Action Bar */}
      <LessonFeedbackPanel
        status={feedbackStatus}
        canSubmit={canSubmit}
        onSubmit={handleSubmitAnswer}
      />

      {/* Centered Duolingo-Style Milo Feedback Modal */}
      <MiloFeedbackModal
        isOpen={feedbackStatus === "correct" || feedbackStatus === "wrong"}
        type={feedbackStatus === "correct" ? "success" : "error"}
        xpGained={validationResult?.xp_earned ?? currentExercise?.xp_reward ?? 2}
        correctAnswer={validationResult?.correct_answer_display}
        heartsRemaining={session?.hearts_remaining ?? 5}
        maxHearts={session?.max_hearts ?? 5}
        onPrimaryAction={handleContinue}
        primaryActionLabel={feedbackStatus === "correct" ? "Continue" : "Try again"}
      />

      {/* Exit Confirmation Dialog */}
      <ExitConfirmationModal
        isOpen={isExitModalOpen}
        onCancel={() => setIsExitModalOpen(false)}
        onConfirmExit={handleConfirmExit}
      />
    </div>
  );
}
