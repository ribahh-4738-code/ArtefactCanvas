export type TaskStatus = "IN_DEVELOPMENT" | "NEXT" | "DONE";

export interface CompanySummary {
  id: string;
  name: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  companyId: string;
  lastOpenedAt: string | null;
}

export interface Project {
  id: string;
  companyId: string;
  name: string;
  artefato: string;
  iniciativa: string;
  aposta: string;
  lastOpenedAt: string | null;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  instructions: string;
  status: TaskStatus;
  sortOrder: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Dashboard {
  company: CompanySummary;
  project: Project;
  tasks: {
    inDevelopment: Task | null;
    next: Task[];
    done: Task[];
  };
  companies: CompanySummary[];
  projects: ProjectSummary[];
}
