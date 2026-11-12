import { useCallback, useEffect, useState } from "react";
import {
  createCompany,
  createProject,
  createTask,
  createTasksBatch,
  deleteTask,
  demoteTask,
  fetchDashboard,
  fetchLastOpenedProjectId,
  listProjects,
  moveTask,
  updateProject,
  updateTask,
} from "./api";
import { DoneSection } from "./components/DoneSection";
import { InstitutoToolNav } from "@instituto/tool-shell";
import { HeaderBar } from "./components/HeaderBar";
import { NextSection } from "./components/NextSection";
import { ProjectMeta } from "./components/ProjectMeta";
import { TodaySection } from "./components/TodaySection";
import type { Dashboard, Task } from "./types";

export default function App() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProject = useCallback(async (projectId: string) => {
    setError(null);
    const data = await fetchDashboard(projectId);
    setDashboard(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const { projectId } = await fetchLastOpenedProjectId();
        if (!projectId) {
          throw new Error("Nenhum projeto encontrado. Rode o seed.");
        }
        if (cancelled) return;
        await loadProject(projectId);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Falha ao carregar");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadProject]);

  async function refresh() {
    if (!dashboard) return;
    await loadProject(dashboard.project.id);
  }

  async function handleSelectCompany(companyId: string) {
    if (!dashboard) return;
    if (companyId === dashboard.company.id) return;
    const projects = await listProjects(companyId);
    if (projects.length === 0) {
      const name = window.prompt("Nome do primeiro projeto desta empresa:");
      if (!name?.trim()) return;
      const project = await createProject(companyId, name.trim());
      await loadProject(project.id);
      return;
    }
    const first = projects[0] as { id: string };
    await loadProject(first.id);
  }

  async function handleSelectProject(projectId: string) {
    if (!dashboard || projectId === dashboard.project.id) return;
    await loadProject(projectId);
  }

  async function handleCreateCompany() {
    const name = window.prompt("Nome da nova empresa:");
    if (!name?.trim()) return;
    const company = await createCompany(name.trim());
    const projectName =
      window.prompt("Nome do primeiro projeto:")?.trim() || "Novo projeto";
    const project = await createProject(company.id, projectName);
    await loadProject(project.id);
  }

  async function handleCreateProject() {
    if (!dashboard) return;
    const name = window.prompt("Nome do novo projeto:");
    if (!name?.trim()) return;
    const project = await createProject(dashboard.company.id, name.trim());
    await loadProject(project.id);
  }

  async function handleMetaSave(
    field: "artefato" | "iniciativa" | "aposta",
    value: string,
  ) {
    if (!dashboard) return;
    await updateProject(dashboard.project.id, { [field]: value });
    await refresh();
  }

  async function handleAddToday(title: string) {
    if (!dashboard) return;
    await createTask({
      projectId: dashboard.project.id,
      title,
      status: "IN_DEVELOPMENT",
    });
    await refresh();
  }

  async function handleAddNextBatch(titles: string[]) {
    if (!dashboard) return;
    await createTasksBatch({
      projectId: dashboard.project.id,
      titles,
      status: "NEXT",
    });
    await refresh();
  }

  async function handleAddDoneBatch(titles: string[], completedOn: string) {
    if (!dashboard) return;
    await createTasksBatch({
      projectId: dashboard.project.id,
      titles,
      status: "DONE",
      completedOn,
    });
    await refresh();
  }

  async function handleToggleComplete(task: Task, completed: boolean) {
    await updateTask(task.id, { completed });
    await refresh();
  }

  async function handleMove(task: Task, direction: "up" | "down") {
    await moveTask(task.id, direction);
    await refresh();
  }

  async function handleDemote(task: Task) {
    await demoteTask(task.id);
    await refresh();
  }

  async function handleRename(task: Task, title: string) {
    await updateTask(task.id, { title });
    await refresh();
  }

  async function handleSaveInstructions(task: Task, instructions: string) {
    await updateTask(task.id, { instructions });
    await refresh();
  }

  async function handleDelete(task: Task) {
    await deleteTask(task.id);
    await refresh();
  }

  async function handleChangeDate(task: Task, completedOn: string) {
    await updateTask(task.id, { completedOn });
    await refresh();
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center font-body text-white/60">
        Carregando…
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-display text-xl text-white">Artefact Canvas</p>
        <p className="font-body text-white/60">{error ?? "Sem dados"}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-full overflow-auto">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% -10%, rgba(120,140,200,0.22), transparent 55%), radial-gradient(ellipse 60% 40% at 90% 10%, rgba(90,110,160,0.18), transparent 50%)",
        }}
      />
      <main className="relative mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <div className="mb-6 flex items-start justify-between gap-4">
          <p className="font-brand text-[0.7rem] text-white/40">
            Artefact Canvas
          </p>
          <InstitutoToolNav current="artefact-canvas" />
        </div>
        <HeaderBar
          company={dashboard.company}
          projectName={dashboard.project.name}
          companies={dashboard.companies}
          projects={dashboard.projects}
          onSelectCompany={(id) => void handleSelectCompany(id)}
          onSelectProject={(id) => void handleSelectProject(id)}
          onCreateCompany={() => void handleCreateCompany()}
          onCreateProject={() => void handleCreateProject()}
        />
        <ProjectMeta project={dashboard.project} onSave={handleMetaSave} />
        <TodaySection
          task={dashboard.tasks.inDevelopment}
          onAdd={handleAddToday}
          onToggleComplete={handleToggleComplete}
          onDemote={handleDemote}
          onRename={handleRename}
          onSaveInstructions={handleSaveInstructions}
          onDelete={handleDelete}
        />
        <NextSection
          tasks={dashboard.tasks.next}
          onAddBatch={handleAddNextBatch}
          onToggleComplete={handleToggleComplete}
          onMove={handleMove}
          onRename={handleRename}
          onSaveInstructions={handleSaveInstructions}
          onDelete={handleDelete}
        />
        <DoneSection
          done={dashboard.tasks.done}
          onAddBatch={handleAddDoneBatch}
          onToggleComplete={handleToggleComplete}
          onRename={handleRename}
          onSaveInstructions={handleSaveInstructions}
          onDelete={handleDelete}
          onChangeDate={handleChangeDate}
        />
      </main>
    </div>
  );
}
