export type TopicStatus = "not_started" | "in_progress" | "completed" | "needs_review";

export type Priority = "low" | "medium" | "high";

export interface Topic {
  id: string;
  title: string;
  notes?: string;
  resources?: string[];
  status: TopicStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  technologyId: string;
  title: string;
  description?: string;
  topics: Topic[];
}

export interface Technology {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  sections: Section[];
}

export interface TrackerState {
  technologies: Technology[];
}

export interface ProgressStats {
  total: number;
  completed: number;
  inProgress: number;
  needsReview: number;
  notStarted: number;
  percentage: number;
}

export interface CreateTechnologyInput {
  name: string;
  description?: string;
  color: string;
  icon?: string;
}

export interface CreateSectionInput {
  title: string;
  description?: string;
}

export interface CreateTopicInput {
  title: string;
  notes?: string;
  resources?: string[];
  status?: TopicStatus;
  priority?: Priority;
}

export interface UpdateTopicInput {
  title?: string;
  notes?: string;
  resources?: string[];
  status?: TopicStatus;
  priority?: Priority;
}
