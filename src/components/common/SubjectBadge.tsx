import React from 'react';
import { SubjectId } from '../../types/index.ts';
import { useStudy } from '../../context/StudyContext.tsx';
import { SubjectIcon } from './SubjectIcon.tsx';

interface SubjectBadgeProps {
  subjectId: SubjectId;
  subdiscipline?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const SubjectBadge: React.FC<SubjectBadgeProps> = ({
  subjectId,
  subdiscipline,
  showIcon = true,
  size = 'md',
}) => {
  const { subjects, t } = useStudy();
  const subject = subjects.find((s) => s.id === subjectId);
  const color = subject?.currentColor || '#3B82F6';

  const label =
    subjectId === 'english'
      ? t.subjects.english
      : subjectId === 'tech'
      ? t.subjects.tech
      : subdiscipline
      ? `${t.subjects.general} • ${subdiscipline}`
      : t.subjects.general;

  const sizeClasses =
    size === 'sm'
      ? 'text-[11px] px-2 py-0.5 gap-1'
      : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium transition-colors ${sizeClasses}`}
      style={{
        backgroundColor: `${color}18`, // ~10% opacity
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {showIcon && (
        <SubjectIcon
          subjectId={subjectId}
          subdiscipline={subdiscipline}
          size={size === 'sm' ? 12 : 14}
        />
      )}
      <span>{label}</span>
    </span>
  );
};
