import type { ProgressStats, Section, Technology, Topic, TrackerState } from "@/types";

function collectTopics(technology: Technology): Topic[] {
  return technology.sections.flatMap((section) => section.topics);
}

export function getTopicStats(topics: Topic[]): ProgressStats {
  const total = topics.length;
  const completed = topics.filter((t) => t.status === "completed").length;
  const inProgress = topics.filter((t) => t.status === "in_progress").length;
  const needsReview = topics.filter((t) => t.status === "needs_review").length;
  const notStarted = topics.filter((t) => t.status === "not_started").length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, inProgress, needsReview, notStarted, percentage };
}

export function getSectionProgress(section: Section): ProgressStats {
  return getTopicStats(section.topics);
}

export function getTechnologyProgress(technology: Technology): ProgressStats {
  return getTopicStats(collectTopics(technology));
}

export function getOverallStats(state: TrackerState): ProgressStats {
  const allTopics = state.technologies.flatMap(collectTopics);
  return getTopicStats(allTopics);
}
