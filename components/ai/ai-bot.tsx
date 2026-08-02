"use client";

import Lottie from "lottie-react";
import { ComponentPropsWithoutRef, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type AiBotProps = ComponentPropsWithoutRef<"div">;

type LottieAnimationData = Record<string, unknown>;

const AI_BOT_ANIMATION_PATH = "/lottie/AI%20bot.json";

export function AiBot({ className, ...props }: AiBotProps) {
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAnimation = async () => {
      try {
        const response = await fetch(AI_BOT_ANIMATION_PATH);

        if (!response.ok) {
          throw new Error(`Failed to load AI bot animation: ${response.status}`);
        }

        const data = (await response.json()) as LottieAnimationData;

        if (isMounted) {
          setAnimationData(data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    void loadAnimation();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!animationData) {
    return <div className={cn("size-[108px]", className)} aria-hidden="true" />;
  }

  return (
    <Lottie
      animationData={animationData}
      autoplay
      loop
      className={cn("size-[108px]", className)}
      {...props}
    />
  );
}
