import { useCallback } from "react";

import { useTracker } from "@/components/providers/tracker-provider";
import type { Priority, Topic, TopicStatus } from "@/types";

type CheckedState = boolean | "indeterminate";

interface UseTopicItemActionsParams {
  technologyId: string;
  sectionId: string;
  topic: Topic;
}

export function useTopicItemActions({
  technologyId,
  sectionId,
  topic,
}: UseTopicItemActionsParams) {
  const { updateTopicStatus, updateTopicPriority, deleteTopic } = useTracker();

  const isCompleted = topic.status === "completed";
  const hasDetails = Boolean(topic.notes) || (topic.resources?.length ?? 0) > 0;

  const toggleCompleted = useCallback(
    (checked: CheckedState) => {
      updateTopicStatus(
        technologyId,
        sectionId,
        topic.id,
        checked === true ? "completed" : "not_started",
      );
    },
    [technologyId, sectionId, topic.id, updateTopicStatus],
  );

  const setStatus = useCallback(
    (status: TopicStatus) => {
      updateTopicStatus(technologyId, sectionId, topic.id, status);
    },
    [technologyId, sectionId, topic.id, updateTopicStatus],
  );

  const setPriority = useCallback(
    (priority: Priority) => {
      updateTopicPriority(technologyId, sectionId, topic.id, priority);
    },
    [technologyId, sectionId, topic.id, updateTopicPriority],
  );

  const removeTopic = useCallback(() => {
    deleteTopic(technologyId, sectionId, topic.id);
  }, [deleteTopic, technologyId, sectionId, topic.id]);

  return {
    hasDetails,
    isCompleted,
    toggleCompleted,
    setStatus,
    setPriority,
    removeTopic,
  };
}
