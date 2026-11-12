import { ArrowDown } from "lucide-react";
import { useEffect, useState } from "react";
import type { Task } from "../types";
import { DeleteTaskButton } from "./DeleteTaskButton";
import { EditableTitle } from "./EditableTitle";
import { TaskInstructions } from "./TaskInstructions";

type Props = {
  task: Task | null;
  addRequestNonce?: number;
  onAdd: (title: string) => Promise<void>;
  onToggleComplete: (task: Task, completed: boolean) => Promise<void>;
  onDemote: (task: Task) => Promise<void>;
  onRename: (task: Task, title: string) => Promise<void>;
  onSaveInstructions: (task: Task, instructions: string) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
};

export function TodaySection({
  task,
  addRequestNonce = 0,
  onAdd,
  onToggleComplete,
  onDemote,
  onRename,
  onSaveInstructions,
  onDelete,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (addRequestNonce > 0) {
      setAdding(true);
      setDraft("");
    }
  }, [addRequestNonce]);

  async function submitAdd() {
    const title = draft.trim();
    if (!title) {
      setAdding(false);
      return;
    }
    await onAdd(title);
    setDraft("");
    setAdding(false);
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="section-title">Today</h2>
      </div>

      {adding && (
        <div className="mb-4">
          <input
            className="glass-input"
            placeholder="Nova tarefa em destaque…"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => void submitAdd()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void submitAdd();
              }
              if (e.key === "Escape") {
                setDraft("");
                setAdding(false);
              }
            }}
          />
        </div>
      )}

      {task ? (
        <div>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-2 h-5 w-5 accent-white"
              checked={false}
              onChange={() => void onToggleComplete(task, true)}
              aria-label="Concluir tarefa"
            />
            <button
              type="button"
              className="chrome-icon-btn mt-0.5"
              aria-label="Mover para Next"
              onClick={() => void onDemote(task)}
            >
              <ArrowDown size={16} strokeWidth={1.75} />
            </button>
            <EditableTitle
              value={task.title}
              className="font-display flex-1 pt-0.5 text-[1.35em] text-white"
              onSave={(title) => onRename(task, title)}
            />
            <DeleteTaskButton task={task} onDelete={onDelete} className="mt-0.5 h-8 w-8" />
          </div>
          <div className="ml-12">
            <TaskInstructions
              value={task.instructions}
              onSave={(instructions) => onSaveInstructions(task, instructions)}
            />
          </div>
        </div>
      ) : (
        !adding && (
          <p className="font-body text-sm text-white/45">
            Nenhuma tarefa em destaque.
          </p>
        )
      )}
    </section>
  );
}
