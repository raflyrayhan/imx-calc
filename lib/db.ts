import Database from "better-sqlite3";
import { Project } from "./types";

let db: Database.Database | null = null;

function getDb() {
  if (db) return db;
  db = new Database(process.env.DB_FILE || "data.sqlite");
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      json TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);
  return db;
}

// Row shape in SQLite
type ProjectRow = {
  id: string;
  name: string;
  json: string;
  createdAt: string;
  updatedAt: string;
};

export function listProjects(): Project[] {
  const rows = getDb()
    .prepare(`SELECT id, name, json, createdAt, updatedAt FROM projects ORDER BY updatedAt DESC`)
    .all() as ProjectRow[];
  return rows.map((r) => JSON.parse(r.json) as Project);
}

export function getProject(id: string): Project | null {
  // only select the json column for clarity (and typing)
  const row = getDb()
    .prepare(`SELECT json FROM projects WHERE id = ?`)
    .get(id) as { json: string } | undefined;
  return row ? (JSON.parse(row.json) as Project) : null;
}

export function saveProject(p: Project) {
  const now = new Date().toISOString();
  p.updatedAt = now;

  const existing = getDb().prepare(`SELECT id FROM projects WHERE id = ?`).get(p.id) as
    | { id: string }
    | undefined;

  if (existing) {
    getDb()
      .prepare(`UPDATE projects SET name = ?, json = ?, updatedAt = ? WHERE id = ?`)
      .run(p.name, JSON.stringify(p), p.updatedAt, p.id);
  } else {
    p.createdAt ||= now;
    getDb()
      .prepare(
        `INSERT INTO projects (id, name, json, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`
      )
      .run(p.id, p.name, JSON.stringify(p), p.createdAt, p.updatedAt);
  }
}

export function deleteProject(id: string) {
  getDb().prepare(`DELETE FROM projects WHERE id = ?`).run(id);
}
