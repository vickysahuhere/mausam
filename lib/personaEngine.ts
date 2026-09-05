import { Persona, SURVEY_WEIGHTS } from './surveyQuestions';

export function buildPersonaVector(selectedAnswerIds: string[]): Record<Persona, number> {
  const raw: Record<Persona, number> = {
    health: 0, fitness: 0, beach: 0, travel: 0,
    parent: 0, agriculture: 0, commuter: 0, event: 0,
  };
  
  for (const id of selectedAnswerIds) {
    const w = SURVEY_WEIGHTS[id] || {};
    for (const [p, val] of Object.entries(w)) {
      raw[p as Persona] += val;
    }
  }
  
  const total = Object.values(raw).reduce((a, b) => a + b, 0) || 1;
  const vector = {} as Record<Persona, number>;
  
  for (const p of Object.keys(raw) as Persona[]) {
    vector[p] = raw[p] / total;
  }
  
  return vector;
}
