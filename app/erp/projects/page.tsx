import { Suspense } from "react";
import ProjectsClient from "./ProjectsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-600">Loading projects…</div>}>
      <ProjectsClient />
    </Suspense>
  );
}
