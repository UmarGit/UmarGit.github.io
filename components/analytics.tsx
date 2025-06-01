"use client";

import { useAnalytics } from "@/hooks/useAnalytics";

export function Analytics() {
  // Initialize analytics tracking
  useAnalytics();

  // This component doesn't render anything
  return null;
}
