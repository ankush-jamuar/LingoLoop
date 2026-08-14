"use client";

import React from "react";
import { UnitMapSection, SkillMapNode } from "@/lib/api/course";
import { SkillNode } from "./SkillNode";
import { RibbonPath } from "./RibbonPath";
import { BookOpen } from "lucide-react";

interface UnitSectionProps {
  unit: UnitMapSection;
  activeSkillId?: number;
  onSkillClick: (skill: SkillMapNode) => void;
}

export function UnitSection({
  unit,
  activeSkillId,
  onSkillClick,
}: UnitSectionProps) {
  // Compute horizontal alternating pattern for nodes
  const getOffset = (idx: number): "left" | "center" | "right" => {
    const pattern: Array<"center" | "right" | "center" | "left"> = [
      "center",
      "right",
      "left",
    ];
    return pattern[idx % pattern.length];
  };

  const getPathDirection = (
    idx: number
  ): "center-to-right" | "right-to-center" | "center-to-left" | "left-to-center" | "vertical" => {
    if (idx === 0) return "center-to-right";
    if (idx === 1) return "right-to-center";
    return "left-to-center";
  };

  return (
    <section className="w-full max-w-2xl mx-auto space-y-6 select-none my-8">
      {/* Thematic Unit Header Banner */}
      <div className="surface-card rounded-3xl p-5 sm:p-6 bg-cream-muted/80 border-2 border-ink/15 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-ink/10 text-[11px] font-extrabold font-display uppercase tracking-wider text-ink">
            <BookOpen className="w-3 h-3 text-violet" />
            <span>Unit {unit.order_index + 1}</span>
          </div>

          <span className="text-[11px] font-bold font-display text-ink-subtle">
            {unit.skills.length} Loop Islands
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-extrabold text-ink font-display tracking-tight">
          {unit.title}
        </h3>

        {unit.description && (
          <p className="text-xs sm:text-sm text-ink-muted font-body leading-relaxed">
            {unit.description}
          </p>
        )}
      </div>

      {/* Connected Skill Nodes Flow */}
      <div className="flex flex-col items-center py-4">
        {unit.skills.map((skill, idx) => {
          const isCompleted = skill.status === "completed" || skill.completed;
          const isCurrentLoop = skill.id === activeSkillId;
          return (
            <React.Fragment key={skill.id}>
              {/* Skill Node */}
              <SkillNode
                skill={skill}
                horizontalOffset={getOffset(idx)}
                isCurrentLoop={isCurrentLoop}
                onClick={onSkillClick}
              />

              {/* Connecting Ribbon Track (if not last skill in unit) */}
              {idx < unit.skills.length - 1 && (
                <RibbonPath
                  direction={getPathDirection(idx)}
                  isCompleted={isCompleted}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
