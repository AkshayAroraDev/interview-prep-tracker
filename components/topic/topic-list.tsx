import { TopicItem } from "@/components/topic/topic-item";
import type { Topic } from "@/types";

interface TopicListProps {
  technologyId: string;
  sectionId: string;
  topics: Topic[];
}

export function TopicList({ technologyId, sectionId, topics }: TopicListProps) {
  return (
    <div className="divide-y divide-border/50 rounded-md border border-border/50 bg-background/50">
      {topics.map((topic) => (
        <TopicItem
          key={topic.id}
          technologyId={technologyId}
          sectionId={sectionId}
          topic={topic}
        />
      ))}
    </div>
  );
}
