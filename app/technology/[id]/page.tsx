import { TechnologyDetail } from "@/components/technology/technology-detail";

interface TechnologyPageProps {
  params: Promise<{ id: string }>;
}

export default async function TechnologyPage({ params }: TechnologyPageProps) {
  const { id } = await params;
  return <TechnologyDetail technologyId={id} />;
}
