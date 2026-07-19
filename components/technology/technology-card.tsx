import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";

import { ProgressBar } from "@/components/shared/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTechnologyProgress } from "@/lib/progress";
import type { Technology } from "@/types";

interface TechnologyCardProps {
  technology: Technology;
}

export function TechnologyCard({ technology }: TechnologyCardProps) {
  const progress = getTechnologyProgress(technology);
  const topicCount = progress.total;
  const sectionCount = technology.sections.length;

  return (
    <Link href={`/technology/${technology.id}`} className="group block h-full">
      <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ backgroundColor: technology.color }}
            >
              <Layers className="size-5" />
            </div>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
          </div>
          <div className="space-y-2.5">
            <CardTitle>{technology.name}</CardTitle>
            {technology.description ? (
              <p className="line-clamp-2 text-fluid-body text-muted-foreground">
                {technology.description}
              </p>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{sectionCount} sections</Badge>
            <Badge variant="outline">{topicCount} topics</Badge>
          </div>
          <ProgressBar
            value={progress.percentage}
            label="Progress"
            accentColor={technology.color}
          />
        </CardContent>
      </Card>
    </Link>
  );
}
