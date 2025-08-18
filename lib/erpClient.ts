export const api = {
  // Projects
  project: (id: string) => fetch(`/api/projects/${id}`).then(r => r.json()),
  projectDocs: (id: string) => fetch(`/api/projects/${id}/documents`).then(r => r.json()),
  projectTasks: (id: string) => fetch(`/api/projects/${id}/tasks`).then(r => r.json()),

  // Documents
  createDoc: (payload: {
    projectId: string; title: string; code?: string; mime?: string; sizeBytes?: number;
  }) => fetch("/api/documents/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(r => r.json()),
  docSummary: (projectId: string) => fetch(`/api/documents/summary?projectId=${projectId}`).then(r => r.json()),
  docDownload: (id: string) => fetch(`/api/documents/${id}/download`).then(r => r.json()),
  docSetStatus: (id: string, status: string, note?: string) => fetch(`/api/documents/${id}/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, note }) }).then(r => r.json()),

  // Tasks
  createTask: (payload: { projectId: string; wbs?: string; name: string; startDate?: string; dueDate?: string }) =>
    fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(r => r.json()),
  updateTask: (payload: { id: string; status?: string; progressPct?: number; name?: string; startDate?: string; dueDate?: string }) =>
    fetch("/api/tasks", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(r => r.json()),
  task: (taskId: string) => fetch(`/api/tasks/${taskId}`).then(r => r.json()),
  taskLinks: (taskId: string) => fetch(`/api/tasks/${taskId}/links`).then(r => r.json()),
  attachDoc: (taskId: string, documentId: string, note = "") =>
    fetch(`/api/tasks/${taskId}/attach`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentId, note }) }).then(r => r.json()),
  memos: (taskId: string) => fetch(`/api/tasks/${taskId}/memos`).then(r => r.json()),
  addMemo: (taskId: string, authorId: string, content: string) =>
    fetch(`/api/tasks/${taskId}/memos`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ authorId, content }) }).then(r => r.json()),
  templates: () => fetch(`/api/mom-templates`).then(r => r.json()),
  generateMoM: (taskId: string, payload: { templateId: string; title: string; date: string; attendees: string[]; context: Record<string, string> }) =>
    fetch(`/api/tasks/${taskId}/mom/generate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(r => r.json()),
};
