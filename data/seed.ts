import { generateId } from "@/lib/id";
import { DEFAULT_TOPIC_METADATA } from "@/lib/constants";
import { TOPIC_CATALOG } from "../lib/topics";
import type {
  ConfidenceLevel,
  InterviewFrequency,
  Priority,
  Topic,
  TopicStatus,
  TrackerState,
} from "@/types";

function createTopic(
  title: string,
  status: TopicStatus = "not_started",
  priority: Priority = "medium",
  interviewFrequency: InterviewFrequency = DEFAULT_TOPIC_METADATA.interviewFrequency,
  confidence: ConfidenceLevel = DEFAULT_TOPIC_METADATA.confidence,
  notes: string = DEFAULT_TOPIC_METADATA.notes,
): Topic {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title,
    interviewFrequency,
    confidence,
    notes,
    status,
    priority,
    createdAt: now,
    updatedAt: now,
  };
}

export const seedData: TrackerState = {
  technologies: TOPIC_CATALOG.map((technologyTemplate) => {
    const technologyId = generateId();

    return {
      id: technologyId,
      name: technologyTemplate.name,
      description: technologyTemplate.description,
      color: technologyTemplate.color,
      icon: technologyTemplate.icon,
      sections: technologyTemplate.sections.map((sectionTemplate) => ({
        id: generateId(),
        technologyId,
        title: sectionTemplate.title,
        description: sectionTemplate.description,
        topics: sectionTemplate.topics.map((topicTemplate) =>
          createTopic(
            topicTemplate.title,
            topicTemplate.status ?? "not_started",
            topicTemplate.priority ?? "medium",
            topicTemplate.interviewFrequency ?? DEFAULT_TOPIC_METADATA.interviewFrequency,
            topicTemplate.confidence ?? DEFAULT_TOPIC_METADATA.confidence,
            topicTemplate.notes ?? DEFAULT_TOPIC_METADATA.notes,
          ),
        ),
      })),
    };
  }),
};
