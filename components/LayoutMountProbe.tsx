// components/LayoutMountProbe.tsx
//
// A tiny client component whose only job is to log once when it mounts. It is
// rendered by the nested products layout to prove, by observation, that the
// layout stays mounted across navigation rather than remounting.
//
// Because layouts do not re-render on navigation, moving /products ->
// /products/[id] and back must produce exactly one log line. A second line
// would mean the layout remounted. The effect uses an empty dependency array
// so it fires only on mount, and the component renders nothing.

"use client";

import { useEffect } from "react";

interface LayoutMountProbeProps {
  /** Identifies the log line, so a probe in another segment reads differently. */
  label?: string;
}

export default function LayoutMountProbe({
  label = "layout",
}: LayoutMountProbeProps) {
  useEffect(() => {
    console.log(`[mount] ${label}`);
  }, [label]);

  return null;
}
