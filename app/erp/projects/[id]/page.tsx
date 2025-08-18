"use client";
import useSWR from "swr";
import Link from "next/link";
import { Card } from "../../_ui/Card";
import { Button } from "../../_ui/Button";
import { Badge } from "../../_ui/Badge";
import { Table, THead, Th, TBody, Td } from "../../_ui/Table";
import { PageHeader } from "../../_ui/PageHeader";

export default function ProjectOverview({ params }: { params: { id: string } }) {
  const { data: project } = useSWR(`/api/projects/${params.id}`, u=>fetch(u).then(r=>r.json()));
  const { data: tasks } = useSWR(`/api/projects/${params.id}/tasks`, u=>fetch(u).then(r=>r.json()));

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <PageHeader
        title={project ? `${project.name} (${project.code})` : "Project"}
        aside={<Link href={`/erp/document-control?projectId=${params.id}`} className="text-sm text-indigo-600 hover:underline">Document Control →</Link>}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tasks list */}
        <Card className="lg:col-span-2" title="Tasks">
          <Table>
            <THead>
              <tr>
                <Th className="w-20">WBS</Th><Th>Task</Th><Th className="w-20">Prog.</Th><Th className="w-28">Start</Th><Th className="w-28">Due</Th><Th className="w-28">Status</Th>
              </tr>
            </THead>
            <TBody>
              {(tasks||[]).map((t:any)=>(
                <tr key={t.id}>
                  <Td className="text-slate-500">{t.wbs ?? "—"}</Td>
                  <Td className="font-medium">
                    <Link className="hover:underline" href={`/erp/projects/${params.id}/tasks/${t.id}`}>{t.name}</Link>
                  </Td>
                  <Td>{Number(t.progressPct).toFixed(0)}%</Td>
                  <Td>{t.startDate?.slice(0,10) ?? "—"}</Td>
                  <Td>{t.dueDate?.slice(0,10) ?? "—"}</Td>
                  <Td><Status s={t.status}/></Td>
                </tr>
              ))}
              {!tasks?.length && <tr><Td className="py-8 text-center text-slate-500" colSpan={6}>No tasks yet.</Td></tr>}
            </TBody>
          </Table>
          <div className="mt-4">
            <Button onClick={()=>createQuickTask(params.id)}>Add Task</Button>
          </div>
        </Card>

        {/* Mini schedule */}
        <Card title="Schedule glance">
          <div className="space-y-2 max-h-[440px] overflow-auto pr-1">
            {(tasks||[]).map((t:any)=> <Bar key={t.id} task={t} />)}
            {!tasks?.length && <div className="py-8 text-center text-slate-500 text-sm">Tasks will show here with a compact timeline.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Status({ s }: { s: string }) {
  const tone = s==="DONE" ? "green" : s==="BLOCKED" ? "rose" : s==="IN_PROGRESS" ? "blue" : "slate";
  return <Badge tone={tone as any}>{s.replace("_"," ")}</Badge>;
}
function Bar({ task }: { task:any }) {
  const start = task.startDate ? new Date(task.startDate).getTime() : NaN;
  const end   = task.dueDate ? new Date(task.dueDate).getTime() : NaN;
  const width = Number.isFinite(start) && Number.isFinite(end) && end>start
    ? Math.max(6, Math.min(100, ((end - start) / (1000*60*60*24*90)) * 100))
    : 12;
  const color = task.status==="DONE" ? "bg-emerald-500" : task.status==="BLOCKED" ? "bg-rose-500" : "bg-indigo-500";
  return (
    <div className="text-xs">
      <div className="flex items-center justify-between">
        <div className="truncate max-w-[70%]"><span className="text-slate-500">{task.wbs ?? "—"}</span> {task.name}</div>
        <div>{Number(task.progressPct).toFixed(0)}%</div>
      </div>
      <div className="mt-1 h-2 rounded bg-slate-200/70 dark:bg-slate-800">
        <div className={`h-2 rounded ${color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
async function createQuickTask(projectId: string) {
  const name = prompt("Task name?");
  if (!name) return;
  await fetch("/api/tasks", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ projectId, name }) });
  location.reload();
}
