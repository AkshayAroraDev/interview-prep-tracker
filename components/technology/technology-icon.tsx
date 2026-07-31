import Image from "next/image";

import { cn } from "@/lib/utils";
import {
  getTechnologyIconAccentColor,
  getTechnologyFallbackIcon,
  getTechnologyIconDefinition,
  type TechnologyIconTarget,
} from "@/lib/technology-icons";

interface TechnologyIconProps {
  technology: TechnologyIconTarget;
  size?: number;
  className?: string;
}

export function TechnologyIcon({
  technology,
  size = 20,
  className,
}: TechnologyIconProps) {
  const definition = getTechnologyIconDefinition(technology);
  const accentColor = getTechnologyIconAccentColor(technology);
  const resolvedColor = accentColor ?? "currentColor";
  const resolvedSize = definition?.sizeOverride ?? size;

  if (definition?.svgPath) {
    if (definition.svgRenderMode === "image") {
      return (
        <Image
          src={definition.svgPath}
          alt=""
          aria-hidden="true"
          width={resolvedSize}
          height={resolvedSize}
          className={cn("shrink-0 object-contain", className)}
        />
      );
    }

    return (
      <span
        aria-hidden="true"
        className={cn("block shrink-0", className)}
        style={{
          width: resolvedSize,
          height: resolvedSize,
          backgroundColor: resolvedColor,
          WebkitMaskImage: `url(${definition.svgPath})`,
          maskImage: `url(${definition.svgPath})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
    );
  }

  const FallbackIcon = definition?.lucideIcon ?? definition?.fallbackLucideIcon ?? getTechnologyFallbackIcon();
  return (
    <FallbackIcon
      aria-hidden="true"
      className={cn("shrink-0", className)}
      style={{ width: resolvedSize, height: resolvedSize, color: resolvedColor }}
    />
  );
}
