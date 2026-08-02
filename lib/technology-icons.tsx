import {
  Activity,
  Atom,
  BrainCircuit,
  Box,
  Braces,
  Code2,
  Cloud,
  Container,
  Database,
  FileCode2,
  FileText,
  Gauge,
  GitBranch,
  Globe,
  Layers,
  Network,
  Palette,
  Server,
  Spline,
  TestTube2,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import type { Technology } from "@/types";

export interface TechnologyIconDefinition {
  svgPath?: `/technology-images/${string}`;
  svgRenderMode?: "mask" | "image";
  lucideIcon?: LucideIcon;
  fallbackLucideIcon?: LucideIcon;
  accentColor?: string;
  sizeOverride?: number;
}

export const TECHNOLOGY_ICON_REGISTRY = {
  react: {
    svgPath: "/technology-images/react.svg",
    lucideIcon: Atom,
  },
  angular: {
    svgPath: "/technology-images/angular.svg",
    svgRenderMode: "image",
    lucideIcon: Spline,
  },
  javascript: {
    svgPath: "/technology-images/javascript.svg",
    svgRenderMode: "image",
    lucideIcon: Braces,
  },
  typescript: {
    svgPath: "/technology-images/typescript.svg",
    svgRenderMode: "image",
    lucideIcon: FileCode2,
  },
  rxjs: {
    svgPath: "/technology-images/rxjs.svg",
    lucideIcon: Activity,
  },
  html: {
    lucideIcon: FileText,
  },
  css: {
    lucideIcon: Palette,
  },
  browser: {
    lucideIcon: Globe,
  },
  browserapis: {
    lucideIcon: Globe,
  },
  performance: {
    lucideIcon: Gauge,
    fallbackLucideIcon: Activity,
  },
  systemdesign: {
    lucideIcon: Workflow,
    fallbackLucideIcon: Network,
  },
  networking: {
    lucideIcon: Network,
  },
  nodejs: {
    svgPath: "/technology-images/nodejs.svg",
    lucideIcon: Server,
  },
  gfe75: {
    lucideIcon: Code2,
  },
  dsa: {
    lucideIcon: BrainCircuit,
    fallbackLucideIcon: GitBranch,
  },
  backend: {
    lucideIcon: Server,
  },
  testing: {
    lucideIcon: TestTube2,
  },
  graphql: {
    svgPath: "/technology-images/graphql.svg",
    lucideIcon: Braces,
  },
  docker: {
    svgPath: "/technology-images/docker.svg",
    lucideIcon: Container,
  },
  prisma: {
    svgPath: "/technology-images/prisma.svg",
    lucideIcon: Database,
  },
  nextjs: {
    svgPath: "/technology-images/nextjs.svg",
    lucideIcon: Globe,
  },
  redux: {
    svgPath: "/technology-images/redux.svg",
    lucideIcon: Layers,
  },
  zustand: {
    svgPath: "/technology-images/zustand.svg",
    lucideIcon: Box,
  },
  "react-query": {
    svgPath: "/technology-images/react-query.svg",
    lucideIcon: Activity,
  },
  tailwindcss: {
    svgPath: "/technology-images/tailwindcss.svg",
    lucideIcon: Palette,
  },
  aws: {
    svgPath: "/technology-images/aws.svg",
    lucideIcon: Cloud,
  },
} as const satisfies Record<string, TechnologyIconDefinition>;

export type TechnologyIdentifier = keyof typeof TECHNOLOGY_ICON_REGISTRY;

export type TechnologyIconTarget = string | Pick<Technology, "name" | "icon" | "color">;

const FALLBACK_ICON: LucideIcon = Layers;

const TECHNOLOGY_IDENTIFIER_ALIASES: Readonly<Record<string, TechnologyIdentifier>> = {
  "next.js": "nextjs",
  next: "nextjs",
  "react query": "react-query",
  reactquery: "react-query",
  "tanstack query": "react-query",
  "tailwind css": "tailwindcss",
  tailwind: "tailwindcss",
  "browser-apis": "browserapis",
  browserapis: "browserapis",
  "system-design": "systemdesign",
  systemdesign: "systemdesign",
  "gfe-75": "gfe75",
  gfe: "gfe75",
  "gfe75": "gfe75",
  dsa: "dsa",
  "data-structures-and-algorithms": "dsa",
  "web performance": "performance",
  webperformance: "performance",
  "frontend-performance": "performance",
  performance: "performance",
  "node-js": "nodejs",
  node: "nodejs",
  server: "nodejs",
  "nodejs-frontend-focused": "nodejs",
  nodejsfrontendfocused: "nodejs",
};

function normalizeTechnologyIdentifier(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toRegistryKey(value: string): TechnologyIdentifier | undefined {
  const normalized = normalizeTechnologyIdentifier(value);
  if (!normalized) {
    return undefined;
  }

  if (normalized in TECHNOLOGY_ICON_REGISTRY) {
    return normalized as TechnologyIdentifier;
  }

  const withoutHyphen = normalized.replace(/-/g, "");
  if (withoutHyphen in TECHNOLOGY_ICON_REGISTRY) {
    return withoutHyphen as TechnologyIdentifier;
  }

  return TECHNOLOGY_IDENTIFIER_ALIASES[normalized] ?? TECHNOLOGY_IDENTIFIER_ALIASES[withoutHyphen];
}

export function resolveTechnologyIdentifier(
  technology: TechnologyIconTarget,
): TechnologyIdentifier | undefined {
  if (typeof technology === "string") {
    return toRegistryKey(technology);
  }

  return toRegistryKey(technology.name) ?? (technology.icon ? toRegistryKey(technology.icon) : undefined);
}

export function getTechnologyIconDefinition(
  technology: TechnologyIconTarget,
): TechnologyIconDefinition | undefined {
  const identifier = resolveTechnologyIdentifier(technology);
  return identifier ? TECHNOLOGY_ICON_REGISTRY[identifier] : undefined;
}

export function getTechnologyIconAccentColor(
  technology: TechnologyIconTarget,
): string | undefined {
  if (typeof technology !== "string") {
    const candidate = technology.color?.trim();
    if (candidate) {
      return candidate;
    }
  }

  return getTechnologyIconDefinition(technology)?.accentColor;
}

export function getTechnologyFallbackIcon(): LucideIcon {
  return FALLBACK_ICON;
}
