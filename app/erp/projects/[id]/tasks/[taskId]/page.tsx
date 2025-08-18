"use client";
import useSWR from "swr";
import { useState } from "react";
import Link from "next/link";
import { Card } from "../../../../_ui/Card";
import { Button } from "../../../../_ui/Button";
import { Badge } from "../../../../_ui/Badge";
import { Table, THead, Th, TBody, Td } from "../../../../_ui/Table";
import { PageHeader } from "../../../../_ui/PageHeader";

export default function TaskDetail({ params }: { params: { id: string; taskId: string } }) {
  const { data: task } = useSWR(`/api/tasks/${params.taskId}`, u=>fetch(u).then(r=>r.json()));
  const { data: links, mutate: refreshLinks } = useSWR(`/api/tasks/${params.taskId}/links`, u=>fetch(u).then(r=>r.json()));
  const { data: memos, mutate: refreshMemos } = useSWR(`/api/tasks/${params.taskId}/memos`, u=>fetch(u).then(r=>r.json()));
  const { data: templates } = useSWR(`/api/mom-templates`, u=>fetch(u).then(r=>r.json()));
  const [attachId, setAttachId] = useState("");

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <PageHeader
        title={task ? `${task.name} — ${task.project.name}` : "Task"}
        aside={<Link className="text-sm text-slate-500 hover:underline" href={`/erp/projects/${params.id}`}>← Back</Link>}
      />
      <div className="text-sm text-slate-500">WBS {task?.wbs ?? "—"} • <Status s={task?.status ?? ""} /></div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2" title="Documents">
          <div className="mb-3 flex gap-2">
            <input value={attachId} onChange={e=>setAttachId(e.target.value)} placeholder="Document ID…" className="flex-1 rounded-lg border px-3 py-2 text-sm" />
            <Button onClick={async ()=>{
              if (!attachId) return;
              await fetch(`/api/tasks/${params.taskId}/attach`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ documentId: attachId }) });
              setAttachId(""); refreshLinks();
            }}>Attach</Button>
          </div>
          <Table>
            <THead><tr><Th>Document</Th><Th className="w-28">Status</Th></tr></THead>
            <TBody>
              {(links||[]).map((l:any)=>(
                <tr key={l.id}><Td className="font-medium">{l.document.code ?? "—"} — {l.document.title}</Td><Td><Badge tone="blue">{l.document.status}</Badge></Td></tr>
              ))}
              {!links?.length && <tr><Td className="py-6 text-slate-500" colSpan={2}>No documents attached.</Td></tr>}
            </TBody>
          </Table>
        </Card>

        <Card title="Memo">
          <MemoBox taskId={params.taskId} onSaved={refreshMemos} />
          <div className="mt-3 space-y-2">
            {(memos||[]).map((m:any)=>(
              <div key={m.id} className="rounded-lg border p-2">
                <div className="text-[11px] text-slate-500">{new Date(m.createdAt).toLocaleString()} • {m.author?.name ?? m.author?.email ?? "User"}</div>
                <div className="mt-1 whitespace-pre-wrap text-sm">{m.content}</div>
              </div>
            ))}
            {!memos?.length && <div className="py-4 text-sm text-slate-500">No memos yet.</div>}
          </div>
        </Card>
      </div>

      <Card title="Minutes of Meeting">
        <div className="flex flex-wrap gap-2">
          {(templates||[]).map((t:any)=>(
            <Button key={t.id} variant="outline" onClick={async ()=>{
              const title = prompt("Meeting title?", t.name) || t.name;
              const date = prompt("Meeting date (YYYY-MM-DD)?", new Date().toISOString().slice(0,10)) || new Date().toISOString().slice(0,10);
              await fetch(`/api/tasks/${params.taskId}/mom/generate`, {
                method:"POST", headers:{ "Content-Type":"application/json" },
                body: JSON.stringify({ templateId: t.id, title, date, attendees: [], context: { ownerId: "current-user-id" } })
              });
              alert("MoM generated.");
            }}>{t.name}</Button>
          ))}
          {!templates?.length && <span className="text-sm text-slate-500">No templates available.</span>}
        </div>
      </Card>
    </div>
  );
}

function Status({ s }: { s: string }) {
  const tone = s==="DONE" ? "green" : s==="BLOCKED" ? "rose" : s==="IN_PROGRESS" ? "blue" : "slate";
  return <span className="align-middle"><Badge tone={tone as any}>{s.replace("_"," ") || "—"}</Badge></span>;
}

function MemoBox({ taskId, onSaved }: { taskId: string; onSaved: ()=>void }) {
  const [val, setVal] = useState("");
  return (
    <div>
      <textarea className="w-full rounded-lg border p-2 text-sm" rows={4} placeholder="Write a memo…" value={val} onChange={e=>setVal(e.target.value)} />
      <div className="mt-2 flex justify-end">
        <Button onClick={async ()=>{
          if (!val.trim()) return;
          await fetch(`/api/tasks/${taskId}/memos`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ authorId: "current-user-id", content: val }) });
          setVal(""); onSaved();
        }}>Save memo</Button>
      </div>
    </div>
  );
}
