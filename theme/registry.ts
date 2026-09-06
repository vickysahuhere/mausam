import { CustomTheme } from './themes/custom';
import { AppleLiquidTheme } from './themes/appleLiquid';
import { RetroPeacefulTheme } from './themes/retroPeaceful';
import { HealthTheme } from './themes/health';
import { FitnessTheme } from './themes/fitness';
import { BeachTheme } from './themes/beach';
import { TravelTheme } from './themes/travel';
import { ParentTheme } from './themes/parent';
import { AgricultureTheme } from './themes/agriculture';
import { CommuterTheme } from './themes/commuter';
import { EventTheme } from './themes/event';
import { VintageCreamTheme } from './themes/vintageCream';

export const THEME_REGISTRY = {
  [CustomTheme.id]: CustomTheme,
  [AppleLiquidTheme.id]: AppleLiquidTheme,
  [RetroPeacefulTheme.id]: RetroPeacefulTheme,
  [HealthTheme.id]: HealthTheme,
  [FitnessTheme.id]: FitnessTheme,
  [BeachTheme.id]: BeachTheme,
  [TravelTheme.id]: TravelTheme,
  [ParentTheme.id]: ParentTheme,
  [AgricultureTheme.id]: AgricultureTheme,
  [CommuterTheme.id]: CommuterTheme,
  [EventTheme.id]: EventTheme,
  [VintageCreamTheme.id]: VintageCreamTheme,
};
