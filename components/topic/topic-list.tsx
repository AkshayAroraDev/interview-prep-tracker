import { TopicItem } from "@/components/topic/topic-item";
import type { Topic } from "@/types";

interface TopicListProps {
  technologyId: string;
  sectionId: string;
  topics: Topic[];
}

export function TopicList({ technologyId, sectionId, topics }: TopicListProps) {
  return (
    <div className="divide-y divide-border/60 rounded-xl border border-border/70 bg-background">
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
