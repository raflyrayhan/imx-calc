"use client";

import { useEffect } from "react";

/** Ensures the app always uses light mode on mount. */
export default function ForceLightMode() {
  useEffect(() => {
    // Remove any existing dark class & stored preference
    document.documentElement.classList.remove("dark");
    try {
      localStorage.removeItem("theme");
    } catch {}
  }, []);

  return null;
}
