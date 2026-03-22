export interface ApplicationContact {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ApplicationStageLog {
  id: string;
  stage: string;
  createdAt: string;
}

export interface PipelineApplication {
  id: string;
  title: string;
  company: string;
  url: string | null;
  source: string;
  score: number;
  appliedAt: string | null;
  stage: string | null;
  appliedVia: string | null;
  contacts: ApplicationContact[];
  scheduledEvents: {
    id: string;
    kind: string;
    scheduledAt: string;
    notes: string | null;
  }[];
  stageLogs: ApplicationStageLog[];
}
