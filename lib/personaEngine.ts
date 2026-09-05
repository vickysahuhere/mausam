import { Persona, SURVEY_WEIGHTS } from './surveyQuestions';
import { WIDGET_REGISTRY } from './widgetRegistry';

export function buildPersonaVector(selectedAnswerIds: string[]): Record<Persona, number> {
  const raw: Record<Persona, number> = {
    health: 0,
    fitness: 0,
    beach: 0,
    travel: 0,
    parent: 0,
    agriculture: 0,
    commuter: 0,
    event: 0,
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

export function generateInitialLayout(vector: Record<Persona, number> | null): Array<{ id: string; type: string }> {
  const layout = [{ id: 'widget-base-summary', type: 'current_summary' }];

  // Baseline widgets for custom/skipped survey or evenly distributed answers
  const defaultWidgetTypes = [
    'rain_timeline',
    'extended_forecast',
    'aqi_card',
    'uv_index',
    'sunrise_sunset',
    'comfort_index',
  ];

  if (!vector || Object.values(vector).every((v) => v === 0)) {
    defaultWidgetTypes.forEach((type, index) => {
      layout.push({ id: `widget-init-${index}`, type });
    });
    return layout;
  }

  // Score all registered widgets against the user's blended persona vector
  const scores = Object.values(WIDGET_REGISTRY).map((widget) => {
    let score = 0;
    for (const [persona, weight] of Object.entries(widget.relevance)) {
      score += (vector[persona as Persona] || 0) * (weight as number);
    }
    return { type: widget.id, score };
  });

  // Filter out the base summary (already at position 0) and sort by relevance score
  const scoredTop = scores
    .filter((w) => w.type !== 'current_summary' && w.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6); // PRD FR3: top 6 relevant widgets

  // If scored widgets are fewer than 4, fill remaining slots with high-value defaults
  const selectedTypes = new Set(scoredTop.map((w) => w.type));
  for (const defType of defaultWidgetTypes) {
    if (scoredTop.length >= 6) break;
    if (!selectedTypes.has(defType)) {
      scoredTop.push({ type: defType, score: 0.1 });
      selectedTypes.add(defType);
    }
  }

  scoredTop.forEach((w, index) => {
    layout.push({ id: `widget-${w.type}-${index}`, type: w.type });
  });

  return layout;
}

// Maps dominant persona to its recommended initial theme.
// User can freely override to any theme without changing their layout.
const PERSONA_THEME_MAP: Record<string, string> = {
  health: 'health',
  fitness: 'fitness',
  beach: 'beach',
  travel: 'travel',
  parent: 'parent',
  agriculture: 'agriculture',
  commuter: 'commuter',
  event: 'event',
};

export function getRecommendedTheme(vector: Record<Persona, number> | null): string {
  if (!vector) return 'custom';

  let dominant = 'custom';
  let max = 0;
  for (const [p, val] of Object.entries(vector)) {
    if (val > max) {
      max = val;
      dominant = p;
    }
  }

  return PERSONA_THEME_MAP[dominant] || 'custom';
}
