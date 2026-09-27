export type Persona = 'health' | 'fitness' | 'beach' | 'travel' | 'parent' | 'agriculture' | 'commuter' | 'event';

export const SURVEY_WEIGHTS: Record<string, Partial<Record<Persona, number>>> = {
  // Q1 Weights (from TRD)
  'q1_health':     { health: 3 },
  'q1_fitness':    { fitness: 3, health: 1 },
  'q1_beach':      { beach: 3 },
  'q1_travel':     { travel: 3 },
  'q1_parent':     { parent: 3 },
  'q1_agriculture':{ agriculture: 3 },
  'q1_commute':    { commuter: 3 },
  'q1_events':     { event: 3 },
  
  // Q2 Weights (New additions to support 3rd question blend)
  'q2_morning':    { fitness: 1, commuter: 1, agriculture: 1 },
  'q2_afternoon':  { beach: 1, event: 1 },
  'q2_evening':    { event: 1, fitness: 1, commuter: 1 },
  'q2_flexible':   { travel: 1, parent: 1 },

  // Q3 Weights (from TRD q3_*)
  'q3_air_quality':{ health: 2, agriculture: 1 },
  'q3_rain_alerts':{ commuter: 2, parent: 2, agriculture: 1 },
  'q3_outdoor_time':{ fitness: 2, beach: 1, event: 1 },
  'q3_travel_plans':{ travel: 2 },
  'q3_school_run': { parent: 3 },
  'q3_planting':   { agriculture: 3 },
};

export interface SurveyOption {
  id: string;
  label: string;
}

export interface SurveyQuestion {
  id: string;
  title: string;
  subtitle?: string;
  type: 'single' | 'multi';
  options: SurveyOption[];
}

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'q1',
    title: 'Which of these describe you?',
    subtitle: 'Select all that apply.',
    type: 'multi',
    options: [
      { id: 'q1_health', label: 'Health-Conscious / Allergies' },
      { id: 'q1_fitness', label: 'Outdoor Fitness & Sports' },
      { id: 'q1_beach', label: 'Beachgoer / Surfer' },
      { id: 'q1_travel', label: 'Frequent Traveler' },
      { id: 'q1_parent', label: 'Parent / Family Organizer' },
      { id: 'q1_agriculture', label: 'Farmer / Gardener' },
      { id: 'q1_commute', label: 'Daily Commuter' },
      { id: 'q1_events', label: 'Event Planner' },
    ]
  },
  {
    id: 'q2',
    title: 'When are you most active outdoors?',
    subtitle: 'Select any time that applies.',
    type: 'multi',
    options: [
      { id: 'q2_morning', label: 'Early Morning' },
      { id: 'q2_afternoon', label: 'Afternoon' },
      { id: 'q2_evening', label: 'Evening' },
      { id: 'q2_flexible', label: 'Flexible / Varies' },
    ]
  },
  {
    id: 'q3',
    title: 'What information matters most to you?',
    subtitle: 'Select up to 3 options.',
    type: 'multi',
    options: [
      { id: 'q3_air_quality', label: 'Air Quality & Pollen' },
      { id: 'q3_rain_alerts', label: 'Rain & Storm Alerts' },
      { id: 'q3_outdoor_time', label: 'Best Time to go Outside' },
      { id: 'q3_travel_plans', label: 'Weather at Destinations' },
      { id: 'q3_school_run', label: 'School Commute Conditions' },
      { id: 'q3_planting', label: 'Soil & Planting Guidance' },
    ]
  }
];
