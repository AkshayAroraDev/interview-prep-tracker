"use client";

import { createContext, useContext, type ReactNode } from "react";

import {
  useInterviewTracker,
  type InterviewTracker,
} from "@/hooks/use-interview-tracker";

const TrackerContext = createContext<InterviewTracker | null>(null);

export function TrackerProvider({ children }: { children: ReactNode }) {
  const tracker = useInterviewTracker();
  return (
    <TrackerContext.Provider value={tracker}>{children}</TrackerContext.Provider>
  );
}

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error("useTracker must be used within a TrackerProvider");
  }
  return context;
}
