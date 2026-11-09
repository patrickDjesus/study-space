import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { generateHeuristicPlan, getWeekDatesMap, sanitizePlanItems } from './src/utils/plannerRules.ts';
import { AiWeeklyPlanRequest } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

/**
 * POST /api/ai/weekly-plan
 * Generates or refines a structured weekly study plan with Gemini
 */
app.post('/api/ai/weekly-plan', async (req, res) => {
  const planReq: AiWeeklyPlanRequest = req.body;
  const datesMap = getWeekDatesMap();

  if (!aiClient) {
    // Generate intelligent heuristic plan as fallback
    const fallbackPlan = generateHeuristicPlan(planReq, datesMap);
    return res.json({
      success: true,
      isFallback: true,
      message: 'Plano gerado com algoritmos inteligentes de distribuição de matérias (Gemini API sem chave ativa no servidor).',
      plan: fallbackPlan,
    });
  }

  try {
    const promptText = `
Você é o assistente pedagógico de IA do StudyFlow, um ambiente de estudos pessoal.
Sua missão é criar uma rotina de estudos semanal equilibrada e realista para o usuário.

CRITÉRIOS OBRIGATÓRIOS:
1. MATÉRIAS FIXAS (apenas 3):
   - 'english': Inglês. Alterne rigorosamente entre as habilidades: Listening, Reading, Speaking, Writing, Vocabulary e Grammar.
   - 'tech': Tecnologia da faculdade. Considere os pedidos do usuário (ex: provas, redes, algoritmos, banco de dados) e anotações recentes.
   - 'general': Conhecimentos Gerais (Ensino Fundamental e Médio). Escolha você mesmo tópicos escolares essenciais distribuídos entre as disciplinas: Matemática, Português, História, Geografia, Física, Química, Biologia, Filosofia.
     ATENÇÃO: EVITE REPETIR estes tópicos já estudados: ${(planReq.studiedTopics || []).join(', ') || 'Nenhum ainda'}.

2. PREFERÊNCIAS DO USUÁRIO:
   - Pedido livre: "${planReq.userPrompt || 'Montar rotina equilibrada da semana'}"
   ${planReq.refinementPrompt ? `- Ajuste específico solicitado: "${planReq.refinementPrompt}"` : ''}
   - Horas disponíveis por dia: ${planReq.hoursPerDay || 2} horas.
   - Dias da semana selecionados: ${(planReq.selectedDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']).join(', ')}.
   - Prioridades (escala 1 a 5): Inglês = ${planReq.priorities?.english || 3}, Tecnologia = ${planReq.priorities?.tech || 3}, Conhecimentos Gerais = ${planReq.priorities?.general || 3}.
   - Mapeamento de datas da semana atual (YYYY-MM-DD):
     ${JSON.stringify(datesMap, null, 2)}

3. FORMATO DE SAÍDA:
   Retorne um objeto JSON estrito contendo:
   - "reasoning": Breve explicação de como o plano atende aos pedidos e equilibra as matérias (em português).
   - "items": Array de sessões de estudo. Cada item deve ter:
     - "dayKey": "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
     - "date": string YYYY-MM-DD correspondente ao dia
     - "startTime": string HH:MM (ex: "09:00", "14:30", "19:00")
     - "subjectId": "english" | "tech" | "general"
     - "discipline": (obrigatório se subjectId='general') ex: "Matemática", "Física", "História", etc.
     - "topic": Título claro do tópico da sessão
     - "durationMinutes": Duração em minutos (ex: 45, 60, 90) respeitando o limite diário
     - "objective": Meta clara e acionável para a sessão (ex: "Resolver 5 exercícios de fixação", "Treinar escuta ativa de podcast")
`;

    const geminiPromise = aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reasoning: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayKey: { type: Type.STRING },
                  date: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  subjectId: { type: Type.STRING },
                  discipline: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  objective: { type: Type.STRING },
                },
                required: ['dayKey', 'date', 'startTime', 'subjectId', 'topic', 'durationMinutes', 'objective'],
              },
            },
          },
          required: ['items'],
        },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini call timeout')), 6000)
    );

    const response = await Promise.race([geminiPromise, timeoutPromise]);
    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);
    const sanitizedItems = sanitizePlanItems(parsed.items || [], datesMap);

    return res.json({
      success: true,
      isFallback: false,
      reasoning: parsed.reasoning,
      plan: sanitizedItems,
    });
  } catch (err: unknown) {
    console.error('Error in Gemini weekly plan generation:', err);
    const fallbackPlan = generateHeuristicPlan(planReq, datesMap);
    return res.json({
      success: true,
      isFallback: true,
      message: 'Plano gerado pelo assistente heurístico após instabilidade temporária no provedor.',
      plan: fallbackPlan,
    });
  }
});

/**
 * POST /api/ai/analyze-note
 * Analyzes a study note, extracts summary, key concepts, study gaps, flashcards, and an interactive quiz
 */
app.post('/api/ai/analyze-note', async (req, res) => {
  const { noteTitle, noteContent, subjectId, language = 'pt-BR' } = req.body;

  const isEn = language === 'en-US';

  if (!aiClient) {
    // Intelligent heuristic fallback
    return res.json({
      success: true,
      isFallback: true,
      summary: isEn
        ? `Summary of "${noteTitle}": Contains structured notes on ${subjectId} highlighting fundamental definitions, practical examples, and review points.`
        : `Resumo de "${noteTitle}": Contém apontamentos essenciais sobre ${subjectId}, destacando definições fundamentais, exemplos práticos e pontos de revisão para fixação.`,
      keyConcepts: [
        'Definição fundamental e princípios',
        'Aplicações práticas e resolução de problemas',
        'Padrões recorrentes e conexões conceituais',
        'Critérios de validação e verificação',
      ],
      studyGaps: [
        'Aprofundar a relação com conceitos interdisciplinares correlatos',
        'Praticar exercícios com maior grau de complexidade temporal e espacial',
        'Revisar exceções e casos de borda',
      ],
      suggestedFlashcards: [
        {
          front: `Qual é o conceito central abordado em "${noteTitle}"?`,
          back: `O conceito central engloba os fundamentos e a metodologia de resolução descritos nesta anotação.`,
          subjectId: subjectId || 'tech',
        },
        {
          front: `Quais são as principais vantagens ou aplicações práticas deste tópico?`,
          back: `Permite modelagem eficiente, melhor tomada de decisão e fixação de padrões consolidados.`,
          subjectId: subjectId || 'tech',
        },
        {
          front: `O que deve ser evitado ao aplicar as regras de "${noteTitle}"?`,
          back: `Evitar generalizações sem checar os pré-requisitos e condições de contorno.`,
          subjectId: subjectId || 'tech',
        },
      ],
      quiz: [
        {
          id: 'q1',
          question: `Qual a melhor abordagem ao estudar o conteúdo de "${noteTitle}"?`,
          type: 'multiple_choice',
          options: [
            'Apenas memorização passiva de fórmulas e termos',
            'Compreensão dos fundamentos seguida de prática ativa e resolução de problemas',
            'Ignorar pré-requisitos e pular para tópicos avançados',
            'Estudar sem registrar anotações ou flashcards',
          ],
          correctAnswer: 'Compreensão dos fundamentos seguida de prática ativa e resolução de problemas',
          explanation: 'O aprendizado ativo com resolução prática e revisão espaçada garante a retenção a longo prazo.',
        },
        {
          id: 'q2',
          question: `Como este tópico se conecta à sua rotina semanal de estudos?`,
          type: 'multiple_choice',
          options: [
            'Deve ser revisado em intervalos regulares de 1, 3 e 7 dias',
            'Deve ser estudado apenas uma vez antes da prova',
            'Não precisa de fixação prática',
            'Deve ser substituído por conteúdo aleatório',
          ],
          correctAnswer: 'Deve ser revisado em intervalos regulares de 1, 3 e 7 dias',
          explanation: 'A curva do esquecimento de Ebbinghaus demonstra que revisões espaçadas solidificam a memória.',
        },
      ],
    });
  }

  try {
    const prompt = `
Analise a seguinte anotação de estudos do StudyFlow e gere uma análise pedagógica completa.
Título: ${noteTitle}
Matéria: ${subjectId}
Idioma de saída desejado: ${isEn ? 'Inglês (English)' : 'Português do Brasil (pt-BR)'}
Conteúdo da anotação:
"""
${noteContent || '(sem conteúdo detalhado)'}
"""

Retorne um JSON com:
1. "summary": Resumo conciso de 2 a 4 frases.
2. "keyConcepts": Lista de 4 a 6 conceitos-chave e definições essenciais.
3. "studyGaps": Lista de 2 a 4 possíveis lacunas ou pontos que o estudante deve revisar / aprofundar.
4. "suggestedFlashcards": Lista de 3 a 6 flashcards (frente e verso) para memorização ativa.
5. "quiz": Lista de 4 a 6 questões de fixação (múltipla escolha com 4 alternativas, ou abertas), indicando a resposta correta e explicação didática.
`;

    const geminiPromise = aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            studyGaps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedFlashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                },
                required: ['front', 'back'],
              },
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  type: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ['id', 'question', 'type', 'correctAnswer', 'explanation'],
              },
            },
          },
          required: ['summary', 'keyConcepts', 'studyGaps', 'suggestedFlashcards', 'quiz'],
        },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini analyze timeout')), 6000)
    );

    const response = await Promise.race([geminiPromise, timeoutPromise]);

    const parsed = JSON.parse(response.text || '{}');
    const flashcards = (parsed.suggestedFlashcards || []).map((f: { front: string; back: string }) => ({
      front: f.front,
      back: f.back,
      subjectId: subjectId || 'tech',
    }));

    return res.json({
      success: true,
      isFallback: false,
      summary: parsed.summary,
      keyConcepts: parsed.keyConcepts || [],
      studyGaps: parsed.studyGaps || [],
      suggestedFlashcards: flashcards,
      quiz: parsed.quiz || [],
    });
  } catch (err: unknown) {
    console.error('Error analyzing note with Gemini:', err);
    return res.status(500).json({
      success: false,
      message: 'Não foi possível analisar a anotação no momento.',
    });
  }
});

// Setup Vite in Dev mode or Static serving in Prod mode
async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyFlow server ready on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start StudyFlow server:', err);
});
