export type Platoon = 'RDPL' | 'GRPL' | 'BLPL' | 'LTPR' | 'LTPG' | 'LTPB' | 'GENERAL';

export interface User {
  id: string;
  username: string;
  platoon: Platoon;
  name: string;
}

export type ScenarioType = 'RESCUE' | 'ASSAULT' | 'RECON' | 'DEFENSE' | 'CUSTOM';

export interface Mission {
  id: string;
  title: string;
  scenarioType: ScenarioType;
  assignedPlatoon: Platoon;
  objective: string;
  description: string;
  assets: string;
  creatorId: string;
  creatorPlatoon: Platoon;
  createdAt: number;
  updatedAt: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}