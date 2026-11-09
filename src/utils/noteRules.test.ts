import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterNotes,
  getUniqueTags,
  calculateReadingTime,
  formatNoteDate,
} from './noteRules.ts';
import { Note } from '../types/index.ts';

const mockNotes: Note[] = [
  {
    id: 'n1',
    title: 'TCP 3-Way Handshake e Flags',
    content: 'O handshake TCP ocorre em três etapas: SYN, SYN-ACK, ACK. Importante para redes de computadores.',
    subjectId: 'tech',
    tags: ['Redes', 'Protocolos', 'Faculdade'],
    createdAt: '2026-11-08T10:00:00Z',
    updatedAt: '2026-11-09T08:00:00Z',
  },
  {
    id: 'n2',
    title: 'English Phrasal Verbs in Context',
    content: 'Common phrasal verbs: bring up, call off, come across, look forward to.',
    subjectId: 'english',
    tags: ['Vocabulary', 'Speaking'],
    createdAt: '2026-11-07T14:00:00Z',
    updatedAt: '2026-11-08T18:00:00Z',
  },
  {
    id: 'n3',
    title: 'Termodinâmica e Leis dos Gases',
    content: 'Equação de Clapeyron: PV = nRT. Transformações isotérmica, isobárica e isocórica.',
    subjectId: 'general',
    subdiscipline: 'Física',
    tags: ['Física', 'Vestibular'],
    createdAt: '2026-11-06T12:00:00Z',
    updatedAt: '2026-11-07T12:00:00Z',
  },
];

test('filterNotes filters properly by search query', () => {
  const result = filterNotes(mockNotes, 'Handshake', 'all', null);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'n1');

  const resultByContent = filterNotes(mockNotes, 'Clapeyron', 'all', null);
  assert.equal(resultByContent.length, 1);
  assert.equal(resultByContent[0].id, 'n3');

  const resultNotFound = filterNotes(mockNotes, 'NãoExiste', 'all', null);
  assert.equal(resultNotFound.length, 0);
});

test('filterNotes filters by subject', () => {
  const techNotes = filterNotes(mockNotes, '', 'tech', null);
  assert.equal(techNotes.length, 1);
  assert.equal(techNotes[0].id, 'n1');

  const englishNotes = filterNotes(mockNotes, '', 'english', null);
  assert.equal(englishNotes.length, 1);
  assert.equal(englishNotes[0].id, 'n2');
});

test('filterNotes filters by tag', () => {
  const tagNotes = filterNotes(mockNotes, '', 'all', 'Vocabulary');
  assert.equal(tagNotes.length, 1);
  assert.equal(tagNotes[0].id, 'n2');
});

test('getUniqueTags returns clean, deduplicated, sorted list of tags', () => {
  const tags = getUniqueTags(mockNotes);
  assert.ok(tags.includes('Redes'));
  assert.ok(tags.includes('Vocabulary'));
  assert.ok(tags.includes('Física'));
  assert.equal(new Set(tags).size, tags.length);
});

test('calculateReadingTime calculates correct word counts', () => {
  const shortText = 'Esta é uma frase de teste simples.';
  const res1 = calculateReadingTime(shortText);
  assert.equal(res1.wordCount, 7);
  assert.equal(res1.minutes, 1);

  const longText = Array(450).fill('palavra').join(' ');
  const res2 = calculateReadingTime(longText);
  assert.equal(res2.wordCount, 450);
  assert.equal(res2.minutes, 3);
});
