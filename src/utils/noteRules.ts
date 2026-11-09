import { Note, SubjectId, Language } from '../types/index.ts';

/**
 * Filters and searches notes by query, subject, and tag.
 * Returns notes sorted by updatedAt descending.
 */
export function filterNotes(
  notes: Note[],
  query: string,
  subjectFilter: SubjectId | 'all',
  tagFilter: string | null
): Note[] {
  const normalizedQuery = query.trim().toLowerCase();

  return notes
    .filter((note) => {
      // Subject filter
      if (subjectFilter !== 'all' && note.subjectId !== subjectFilter) {
        return false;
      }

      // Tag filter
      if (tagFilter && !note.tags.map((t) => t.toLowerCase()).includes(tagFilter.toLowerCase())) {
        return false;
      }

      // Search query filter (matches title, content, subdiscipline, or tags)
      if (normalizedQuery) {
        const titleMatch = note.title.toLowerCase().includes(normalizedQuery);
        const contentMatch = note.content.toLowerCase().includes(normalizedQuery);
        const subdisciplineMatch = note.subdiscipline
          ? note.subdiscipline.toLowerCase().includes(normalizedQuery)
          : false;
        const tagMatch = note.tags.some((t) => t.toLowerCase().includes(normalizedQuery));

        return titleMatch || contentMatch || subdisciplineMatch || tagMatch;
      }

      return true;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Extracts a deduplicated and sorted list of all tags present in the notes list.
 */
export function getUniqueTags(notes: Note[]): string[] {
  const tagSet = new Set<string>();
  notes.forEach((note) => {
    note.tags.forEach((tag) => {
      const clean = tag.trim();
      if (clean) tagSet.add(clean);
    });
  });
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
}

/**
 * Calculates word count and reading time in minutes (assuming ~200 words/min).
 */
export function calculateReadingTime(text: string): { wordCount: number; minutes: number } {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const wordCount = words.length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return { wordCount, minutes };
}

/**
 * Formats an ISO date into a localized friendly format.
 */
export function formatNoteDate(isoString: string, lang: Language = 'pt-BR'): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      const hours = String(date.getHours()).padStart(2, '0');
      const mins = String(date.getMinutes()).padStart(2, '0');
      return lang === 'pt-BR' ? `Hoje às ${hours}:${mins}` : `Today at ${hours}:${mins}`;
    }

    return date.toLocaleDateString(lang === 'pt-BR' ? 'pt-BR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return isoString;
  }
}
