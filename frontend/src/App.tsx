import { useCallback, useEffect, useState } from "react";
import {
  createProject,
  createTask,
  createTasksBatch,
  deleteTask,
  demoteTask,
  fetchDashboard,
  fetchLastOpenedProjectId,
  moveTask,
  updateProject,
  updateTask,
} from "./api";
import { DoneSection } from "./components/DoneSection";
import { HeaderBar } from "./components/HeaderBar";
import { NextSection } from "./components/NextSection";
import { ProjectMeta } from "./components/ProjectMeta";
import { TodaySection } from "./components/TodaySection";
import type { Dashboard, Task } from "./types";

export default function App() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayAddNonce, setTodayAddNonce] = useState(0);

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

  async function handleSelectProject(projectId: string) {
    if (!dashboard || projectId === dashboard.project.id) return;
    await loadProject(projectId);
  }

  async function handleCreateProject(title: string) {
    if (!dashboard) return;
    const project = await createProject(dashboard.company.id, title.trim());
    await loadProject(project.id);
  }

  async function handleRenameProject(title: string) {
    if (!dashboard) return;
    await updateProject(dashboard.project.id, { name: title.trim() });
    await refresh();
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
      <HeaderBar
        projectName={dashboard.project.name}
        projects={dashboard.projects}
        activeProjectId={dashboard.project.id}
        onSelectProject={(id) => void handleSelectProject(id)}
        onCreateProject={handleCreateProject}
        onRenameProject={handleRenameProject}
        onAddToday={() => setTodayAddNonce((n) => n + 1)}
      />
      <main className="relative mx-auto max-w-3xl px-6 pb-10 pt-6 sm:px-10">
        <ProjectMeta project={dashboard.project} onSave={handleMetaSave} />
        <TodaySection
          task={dashboard.tasks.inDevelopment}
          addRequestNonce={todayAddNonce}
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
