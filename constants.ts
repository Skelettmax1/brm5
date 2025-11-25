import { Platoon } from './types';

export const LIEUTENANT_ROLES: Platoon[] = ['LTPR', 'LTPG', 'LTPB'];
export const FULL_VISIBILITY_ROLES: Platoon[] = ['RDPL', ...LIEUTENANT_ROLES];

export const SCENARIO_TYPES = [
  { value: 'RESCUE', label: 'Rescue Operation (RESCUE)' },
  { value: 'ASSAULT', label: 'Assault (ASSAULT)' },
  { value: 'RECON', label: 'Reconnaissance (RECON)' },
  { value: 'DEFENSE', label: 'Defense (DEFENSE)' },
  { value: 'CUSTOM', label: 'Custom (CUSTOM)' },
];

export const PLATOON_OPTIONS = [
  { value: 'GENERAL', label: 'General / All Platoons' },
  { value: 'RDPL', label: 'Red Platoon (RDPL)' },
  { value: 'GRPL', label: 'Green Platoon (GRPL)' },
  { value: 'BLPL', label: 'Blue Platoon (BLPL)' },
  { value: 'LTPR', label: 'Red Lieutenant (LTPR)', hidden: true },
  { value: 'LTPG', label: 'Green Lieutenant (LTPG)', hidden: true },
  { value: 'LTPB', label: 'Blue Lieutenant (LTPB)', hidden: true },
];