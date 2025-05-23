export interface Strategy {
  id: string;
  name: string;
  objective: string;
  targetAudience: string;
  keyMessages: string;
  channels: string[];
  timeline: string;
  budget: string;
  kpis: string;
  additionalNotes: string;
  clientId: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface StrategyFormData {
  name: string;
  objective: string;
  targetAudience: string;
  keyMessages: string;
  channels: string[];
  timeline: string;
  budget: string;
  kpis: string;
  additionalNotes: string;
}

export interface StrategyResponse {
  id: string;
  name: string;
  objective: string;
  target_audience: string;
  key_messages: string;
  channels: string[];
  timeline: string;
  budget: string;
  kpis: string;
  additional_notes: string;
  client_id: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  updated_by?: string;
  clients?: {
    id: string;
    name: string;
  };
}

export interface StrategiesListResponse {
  strategies: StrategyResponse[];
}

export interface StrategyDetailResponse {
  strategy: StrategyResponse;
}
