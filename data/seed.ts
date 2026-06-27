import { generateId } from "@/lib/id";
import type { TrackerState } from "@/types";

function createTopic(
  title: string,
  status: "not_started" | "in_progress" | "completed" | "needs_review" = "not_started",
  priority: "low" | "medium" | "high" = "medium",
) {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title,
    status,
    priority,
    createdAt: now,
    updatedAt: now,
  };
}

const reactId = generateId();
const jsId = generateId();
const systemDesignId = generateId();

export const seedData: TrackerState = {
  technologies: [
    {
      id: reactId,
      name: "React",
      description: "Core React concepts for frontend interviews",
      color: "#6366f1",
      icon: "Atom",
      sections: [
        {
          id: generateId(),
          technologyId: reactId,
          title: "Fundamentals",
          description: "JSX, components, and rendering",
          topics: [
            createTopic("Virtual DOM & Reconciliation", "completed", "high"),
            createTopic("JSX & Component Composition", "completed", "medium"),
            createTopic("Props vs State", "in_progress", "high"),
            createTopic("Controlled vs Uncontrolled Components", "not_started", "medium"),
          ],
        },
        {
          id: generateId(),
          technologyId: reactId,
          title: "Hooks",
          description: "Built-in and custom hooks",
          topics: [
            createTopic("useState & useEffect", "in_progress", "high"),
            createTopic("useMemo & useCallback", "not_started", "high"),
            createTopic("useRef & useLayoutEffect", "not_started", "medium"),
            createTopic("Custom Hooks Patterns", "not_started", "medium"),
          ],
        },
        {
          id: generateId(),
          technologyId: reactId,
          title: "Performance",
          description: "Optimization strategies",
          topics: [
            createTopic("React.memo & memoization", "not_started", "high"),
            createTopic("Code splitting & lazy loading", "not_started", "medium"),
            createTopic("List virtualization", "not_started", "low"),
          ],
        },
      ],
    },
    {
      id: jsId,
      name: "JavaScript",
      description: "Language fundamentals and advanced patterns",
      color: "#eab308",
      icon: "Braces",
      sections: [
        {
          id: generateId(),
          technologyId: jsId,
          title: "Core Concepts",
          description: "Execution model and types",
          topics: [
            createTopic("Closures & Scope", "completed", "high"),
            createTopic("Event Loop & Microtasks", "in_progress", "high"),
            createTopic("Prototypes & Inheritance", "not_started", "medium"),
            createTopic("this keyword binding", "not_started", "medium"),
          ],
        },
        {
          id: generateId(),
          technologyId: jsId,
          title: "Async & Promises",
          description: "Asynchronous JavaScript",
          topics: [
            createTopic("Promises & async/await", "in_progress", "high"),
            createTopic("Promise.all / race / allSettled", "not_started", "medium"),
            createTopic("Error handling patterns", "not_started", "medium"),
          ],
        },
      ],
    },
    {
      id: systemDesignId,
      name: "System Design",
      description: "Architecture and scalability fundamentals",
      color: "#14b8a6",
      icon: "Network",
      sections: [
        {
          id: generateId(),
          technologyId: systemDesignId,
          title: "Foundations",
          description: "Building blocks of distributed systems",
          topics: [
            createTopic("CAP Theorem", "not_started", "high"),
            createTopic("Load Balancing", "not_started", "high"),
            createTopic("Caching Strategies", "not_started", "high"),
            createTopic("Database Sharding", "not_started", "medium"),
          ],
        },
        {
          id: generateId(),
          technologyId: systemDesignId,
          title: "Case Studies",
          description: "Common interview design problems",
          topics: [
            createTopic("Design a URL Shortener", "not_started", "high"),
            createTopic("Design a Rate Limiter", "not_started", "high"),
            createTopic("Design a Chat Application", "not_started", "medium"),
          ],
        },
      ],
    },
  ],
};
