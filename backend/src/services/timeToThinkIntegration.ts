import { prisma } from "../db/prisma.js";
import { env } from "../config/env.js";

export type DoneTaskPayload = {
  projectId: string;
  projectName: string;
  taskId: string;
  title: string;
  instructions?: string | null;
  completedAt?: string | null;
};

function completedAtPayload(value: Date | null | undefined): string | null {
  if (!value) return null;
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Best-effort upsert of a Done task into TT timeline "AC: [project]". */
export async function pushDoneTaskToTimeToThink(
  payload: DoneTaskPayload,
): Promise<boolean> {
  const url = `${env.timeToThinkApiUrl}/api/integrations/artefact-canvas/done-tasks`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(
        `[integrations] Time To Think Done sync failed (${res.status}):`,
        text || res.statusText,
      );
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[integrations] Time To Think unreachable:", err);
    return false;
  }
}

export async function removeDoneTaskFromTimeToThink(
  taskId: string,
): Promise<boolean> {
  const url = `${env.timeToThinkApiUrl}/api/integrations/artefact-canvas/done-tasks/${encodeURIComponent(taskId)}`;
  try {
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(
        `[integrations] Time To Think Done remove failed (${res.status}):`,
        text || res.statusText,
      );
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[integrations] Time To Think unreachable:", err);
    return false;
  }
}

export async function renameProjectTimelineOnTimeToThink(
  projectId: string,
  projectName: string,
): Promise<boolean> {
  const url = `${env.timeToThinkApiUrl}/api/integrations/artefact-canvas/projects`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, projectName }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(
        `[integrations] Time To Think project rename failed (${res.status}):`,
        text || res.statusText,
      );
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[integrations] Time To Think unreachable:", err);
    return false;
  }
}

export async function pushTaskRecordToTimeToThink(task: {
  id: string;
  projectId: string;
  title: string;
  instructions: string;
  status: string;
  completedAt: Date | null;
}): Promise<void> {
  if (task.status !== "DONE") return;
  const project = await prisma.project.findUnique({
    where: { id: task.projectId },
    select: { id: true, name: true },
  });
  if (!project) return;
  void pushDoneTaskToTimeToThink({
    projectId: project.id,
    projectName: project.name,
    taskId: task.id,
    title: task.title,
    instructions: task.instructions,
    completedAt: completedAtPayload(task.completedAt),
  });
}

/**
 * Backfill all Done tasks into TT (one timeline per project).
 * Idempotent on TT via sourceRef=taskId.
 */
export async function syncDoneTasksToTimeToThink(): Promise<{
  total: number;
  ok: number;
  failed: number;
}> {
  const tasks = await prisma.task.findMany({
    where: { status: "DONE" },
    orderBy: [{ completedAt: "asc" }, { createdAt: "asc" }],
    include: { project: { select: { id: true, name: true } } },
  });

  let ok = 0;
  let failed = 0;
  for (const task of tasks) {
    const pushed = await pushDoneTaskToTimeToThink({
      projectId: task.project.id,
      projectName: task.project.name,
      taskId: task.id,
      title: task.title,
      instructions: task.instructions,
      completedAt: completedAtPayload(task.completedAt),
    });
    if (pushed) ok += 1;
    else failed += 1;
  }

  console.log(
    `[integrations] Time To Think Done sync: total=${tasks.length} ok=${ok} failed=${failed}`,
  );
  return { total: tasks.length, ok, failed };
}
