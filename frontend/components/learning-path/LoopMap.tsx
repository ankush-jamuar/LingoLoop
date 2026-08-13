"use client";

import React, { useState } from "react";
import { LoopMap as LoopMapType, SkillMapNode } from "@/lib/api/course";
import { UnitSection } from "./UnitSection";
import { SkillDetailModal } from "./SkillDetailModal";
import { RibbonPath } from "./RibbonPath";

interface LoopMapProps {
  mapData: LoopMapType;
  onStartLesson: (skill: SkillMapNode, lessonId?: number) => void;
}

export function LoopMap({ mapData, onStartLesson }: LoopMapProps) {
  const [selectedSkill, setSelectedSkill] = useState<SkillMapNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSkillClick = (skill: SkillMapNode) => {
    setSelectedSkill(skill);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleStartFromModal = (skill: SkillMapNode, lessonId?: number) => {
    setIsModalOpen(false);
    onStartLesson(skill, lessonId);
  };

  return (
    <div className="w-full flex flex-col items-center pb-16">
      {mapData.units.map((unit, uIdx) => (
        <React.Fragment key={unit.id}>
          <UnitSection unit={unit} onSkillClick={handleSkillClick} />

          {/* Inter-unit connecting ribbon track */}
          {uIdx < mapData.units.length - 1 && (
            <div className="py-2">
              <RibbonPath
                direction="vertical"
                isCompleted={
                  unit.skills.every((s) => s.completed || s.status === "completed")
                }
              />
            </div>
          )}
        </React.Fragment>
      ))}

      {/* Skill Detail Slide-Over / Modal */}
      <SkillDetailModal
        skill={selectedSkill}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStartLesson={handleStartFromModal}
      />
    </div>
  );
}
