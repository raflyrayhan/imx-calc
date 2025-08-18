"use client";
import useSWR from "swr";
import { useMemo, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Card } from "../_ui/Card";
import { Button } from "../_ui/Button";
import { Badge } from "../_ui/Badge";
import { Table, THead, Th, TBody, Td } from "../_ui/Table";
import { PageHeader } from "../_ui/PageHeader";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#94a3b8",
  SUBMITTED: "#3b82f6",
  REVIEWED: "#22c55e",
  APPROVED: "#16a34a",
  REJECTED: "#ef4444",
  CANCELED: "#64748b",
};

export default function DocumentControl() {
  const [projectId, setProjectId] = useState("");
  const { data: docs } = useSWR(projectId ? `/api/projects/${projectId}/documents` : null, u=>fetch(u).then(r=>r.json()));
  const { data: summary } = useSWR(projectId ? `/api/documents/summary?projectId=${projectId}` : null, u=>fetch(u).then(r=>r.json()));

  const total = useMemo(()=> (summary||[]).reduce((s:any,x:any)=>s + (x.count||0),0), [summary]);

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <PageHeader
        title="Document Control"
        aside={<ProjectSelect value={projectId} onChange={setProjectId} />}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="text-sm text-slate-500">Total Documents</div>
          <div className="mt-1 text-4xl font-bold">{total}</div>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={summary || []} dataKey="count" nameKey="status" innerRadius={62} outerRadius={92} paddingAngle={2}>
                  {(summary || []).map((x:any, i:number) => (
                    <Cell key={i} fill={STATUS_COLORS[x.status] || "#999"} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Documents">
          <Table>
            <THead>
              <tr>
                <Th>Code</Th><Th>Title</Th><Th className="w-14">Rev</Th><Th className="w-28">Status</Th><Th className="w-28"></Th>
              </tr>
            </THead>
            <TBody>
              {(docs||[]).map((d:any)=>(
                <tr key={d.id}>
                  <Td>{d.code ?? "—"}</Td>
                  <Td className="font-medium">{d.title}</Td>
                  <Td>{d.revision}</Td>
                  <Td><StatusPill s={d.status} /></Td>
                  <Td>
                    <a className="text-indigo-600 hover:underline" href={`/api/documents/${d.id}/download`} target="_blank">Download</a>
                  </Td>
                </tr>
              ))}
              {!docs?.length && (
                <tr><Td className="py-8 text-center text-slate-500" colSpan={5}>Select a project to view documents.</Td></tr>
              )}
            </TBody>
          </Table>
        </Card>
      </div>

      <div className="rounded-2xl border border-dashed p-5 text-sm text-slate-600 dark:text-slate-300">
        Tip: Use the **Project Control → Task** pages to attach documents, add memos, and generate MoMs.
      </div>
    </div>
  );
}

function ProjectSelect({ value, onChange }: { value: string; onChange: (v:string)=>void }) {
  // TODO: wire to /api/projects list. Placeholder options:
  const projects = [{id:"p1", name:"Project A"}, {id:"p2", name:"Project B"}];
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500">Project</span>
      <select value={value} onChange={e=>onChange(e.target.value)} className="rounded-lg border px-2 py-1">
        <option value="">Select…</option>
        {projects.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      {value && <Button variant="ghost" onClick={()=>onChange("")}>Clear</Button>}
    </div>
  );
}
function StatusPill({ s }: { s: string }) {
  const tone = s==="APPROVED" ? "green" : s==="REJECTED" ? "rose" : s==="SUBMITTED" ? "blue" : "slate";
  return <Badge tone={tone as any}>{s}</Badge>;
}
