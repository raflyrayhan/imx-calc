"use client";
import { useEffect, useState } from "react";
import { Project, WbsItem } from "@/lib/types";

export default function ProjectBar({
  onLoad,
}: { onLoad: (p: Project) => void }) {
  const [list, setList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    const res = await fetch("/api/projects", { cache: "no-store" });
    setList(await res.json());
    setLoading(false);
  };

  useEffect(()=>{ fetchList(); }, []);

  const newProject = () => {
    const name = prompt("Project name?");
    if (!name) return;
    const p: Project = {
      id: crypto.randomUUID(),
      name,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onLoad(p);
  };

  const saveProject = async (p: Project) => {
    await fetch("/api/projects", { method:"POST", body: JSON.stringify(p) });
    await fetchList();
    alert("Saved");
  };

  const load = async (id: string) => {
    const res = await fetch(`/api/projects/${id}`, { cache:"no-store" });
    if (res.ok) onLoad(await res.json());
  };

  const remove = async (id: string) => {
    if (!confirm("Delete project?")) return;
    await fetch(`/api/projects/${id}`, { method:"DELETE" });
    await fetchList();
  };

  return (
    <div className="flex gap-2 items-center">
      <button onClick={newProject} className="px-3 py-2 rounded bg-blue-600 text-white">New</button>
      <button onClick={fetchList} className="px-3 py-2 rounded border">{loading?"...":"Refresh"}</button>

      <div className="flex gap-2 overflow-x-auto">
        {list.map(p=>(
          <div key={p.id} className="flex items-center gap-1 border rounded px-2 py-1">
            <button onClick={()=>load(p.id)} className="underline">{p.name}</button>
            <button onClick={()=>remove(p.id)} className="text-red-600">✕</button>
          </div>
        ))}
      </div>

      {/* Save current draft in localStorage to DB */}
      <button onClick={()=>{
        const s = localStorage.getItem("currentProject");
        if (!s) return alert("Nothing to save.");
        const p = JSON.parse(s) as Project;
        saveProject(p);
      }} className="ml-auto px-3 py-2 rounded bg-emerald-600 text-white">Save to DB</button>
    </div>
  );
}
