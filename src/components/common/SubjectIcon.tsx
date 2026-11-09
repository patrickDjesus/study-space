import React from 'react';
import { SubjectId } from '../../types/index.ts';
import { Languages, Laptop, BookOpen, Atom } from 'lucide-react';

interface SubjectIconProps {
  subjectId: SubjectId;
  subdiscipline?: string;
  className?: string;
  size?: number;
}

export const SubjectIcon: React.FC<SubjectIconProps> = ({
  subjectId,
  subdiscipline,
  className = '',
  size = 18,
}) => {
  if (subjectId === 'english') {
    return <Languages size={size} className={className} />;
  }

  if (subjectId === 'tech') {
    return <Laptop size={size} className={className} />;
  }

  if (subdiscipline === 'Física' || subdiscipline === 'Química' || subdiscipline === 'Biologia') {
    return <Atom size={size} className={className} />;
  }

  return <BookOpen size={size} className={className} />;
};
