import type { Dashboard, Project, ProjectSummary, Task } from "./types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      if (typeof body?.error === "string") message = body.error;
      else if (body?.error) message = JSON.stringify(body.error);
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function fetchLastOpenedProjectId() {
  return request<{ projectId: string | null }>("/api/projects/last-opened");
}

export function listProjects(companyId?: string) {
  const qs = companyId ? `?companyId=${encodeURIComponent(companyId)}` : "";
  return request<ProjectSummary[]>(`/api/projects${qs}`);
}

export function fetchDashboard(projectId: string) {
  return request<Dashboard>(`/api/projects/${projectId}/dashboard`);
}

export function createCompany(name: string) {
  return request<{ id: string; name: string }>("/api/companies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export function createProject(companyId: string, name: string) {
  return request<Project>("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyId, name }),
  });
}

export function updateProject(
  id: string,
  patch: Partial<Pick<Project, "name" | "artefato" | "iniciativa" | "aposta">>,
) {
  return request<Project>(`/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}

export function createTask(body: {
  projectId: string;
  title: string;
  status?: "NEXT" | "DONE" | "IN_DEVELOPMENT";
  completedOn?: string;
  instructions?: string;
}) {
  return request<Task>("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function createTasksBatch(body: {
  projectId: string;
  titles: string[];
  status: "NEXT" | "DONE";
  completedOn?: string;
}) {
  return request<Task[]>("/api/tasks/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function updateTask(
  id: string,
  patch: {
    title?: string;
    instructions?: string;
    completed?: boolean;
    completedOn?: string;
  },
) {
  return request<Task>(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}

export function moveTask(id: string, direction: "up" | "down") {
  return request<Task>(`/api/tasks/${id}/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ direction }),
  });
}

export function demoteTask(id: string) {
  return request<Task>(`/api/tasks/${id}/demote`, { method: "POST" });
}

export function deleteTask(id: string) {
  return request<void>(`/api/tasks/${id}`, { method: "DELETE" });
}
