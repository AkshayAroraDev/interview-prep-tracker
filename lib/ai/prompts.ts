import type { TrackerState } from "@/types";

/**
 * Builds a compact, personalized prompt optimized for low token usage.
 */
export function buildPrompt(userState: TrackerState, userMessage: string): string {
  const technologies = userState.technologies ?? [];
  const sections = technologies.flatMap((tech) => tech.sections);
  const sectionCount = sections.length;

  const allTopics = sections.flatMap((section) => section.topics);

  const completedTopics = allTopics.filter((topic) => topic.status === "completed").length;
  const inProgressTopics = allTopics.filter((topic) => topic.status === "in_progress").length;
  const needsReviewTopics = allTopics.filter((topic) => topic.status === "needs_review").length;
  const notStartedTopics = allTopics.filter((topic) => topic.status === "not_started").length;

  const technologySummary =
    technologies.length === 0
      ? "No technologies tracked yet."
      : technologies
          .map((tech) => {
            const topics = tech.sections.flatMap((section) => section.topics);
            const done = topics.filter((topic) => topic.status === "completed").length;
            const total = topics.length;
            return `- ${tech.name}: ${done}/${total} completed`;
          })
          .join("\n");

  const nextTopics = technologies
    .flatMap((tech) =>
      tech.sections.flatMap((section) =>
        section.topics
          .filter((topic) => topic.status !== "completed")
          .map((topic) => ({
            technology: tech.name,
            section: section.title,
            topic: topic.title,
            status: topic.status,
          })),
      ),
    )
    .sort((a, b) => {
      const rank: Record<string, number> = {
        in_progress: 0,
        needs_review: 1,
        not_started: 2,
      };
      return (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
    })
    .slice(0, 5)
    .map(
      (item) => `- ${item.technology} > ${item.section}: ${item.topic} (${item.status.replace("_", " ")})`,
    )
    .join("\n");

  return [
    "SYSTEM:",
    "You are an Interview Prep Assistant.",
    "Provide concise, actionable, technically correct guidance tailored to tracker context.",
    "Response guidelines:",
    "- Keep answers brief and practical (prefer bullets).",
    "- Prioritize next concrete study actions.",
    "- If helpful, include a tiny study plan (today/this week).",
    "- Avoid long explanations unless explicitly requested.",
    "",
    "TRACKER SUMMARY:",
    `- technologies=${technologies.length}, sections=${sectionCount}, topics=${allTopics.length}`,
    `- completed=${completedTopics}, in_progress=${inProgressTopics}, needs_review=${needsReviewTopics}, not_started=${notStartedTopics}`,
    "- progress by technology:",
    technologySummary,
    "",
    "SUGGESTED NEXT TOPICS:",
    nextTopics || "- No pending topics found.",
    "",
    "USER QUESTION:",
    userMessage,
  ].join("\n");
}
