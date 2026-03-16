"use client";

import { useEffect, useState } from "react";

/**
 * Hook to determine if component is mounted
 * Useful for avoiding hydration mismatch with server rendering
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
