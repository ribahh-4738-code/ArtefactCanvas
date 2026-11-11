import { ArrowDown, ArrowUp, FileText, Plus } from "lucide-react";
import { useState } from "react";
import type { Task } from "../types";
import { DeleteTaskButton } from "./DeleteTaskButton";
import { EditableTitle } from "./EditableTitle";
import { TaskInstructions } from "./TaskInstructions";

type Props = {
  tasks: Task[];
  onAddBatch: (titles: string[]) => Promise<void>;
  onToggleComplete: (task: Task, completed: boolean) => Promise<void>;
  onMove: (task: Task, direction: "up" | "down") => Promise<void>;
  onRename: (task: Task, title: string) => Promise<void>;
  onSaveInstructions: (task: Task, instructions: string) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
};

export function NextSection({
  tasks,
  onAddBatch,
  onToggleComplete,
  onMove,
  onRename,
  onSaveInstructions,
  onDelete,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function submitAdd() {
    const titles = draft
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (titles.length === 0) {
      setAdding(false);
      setDraft("");
      return;
    }
    await onAddBatch(titles);
    setDraft("");
    setAdding(false);
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="section-title">Next</h2>
        <button
          type="button"
          className="chrome-icon-btn"
          aria-label="Adicionar tarefas em lote"
          onClick={() => setAdding(true)}
        >
          <Plus size={18} strokeWidth={1.75} />
        </button>
      </div>

      {adding && (
        <div className="mb-4">
          <textarea
            className="glass-input min-h-[7rem]"
            placeholder="Uma tarefa por linha…"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => void submitAdd()}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setDraft("");
                setAdding(false);
              }
            }}
          />
        </div>
      )}

      <ul className="space-y-3">
        {tasks.map((task, index) => {
          const isLast = index === tasks.length - 1;
          const hasInstructions = task.instructions.trim().length > 0;
          const expanded = expandedId === task.id;
          return (
            <li key={task.id}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1.5 h-4 w-4 accent-white"
                  checked={false}
                  onChange={() => void onToggleComplete(task, true)}
                  aria-label="Concluir tarefa"
                />
                <div className="mt-0.5 flex items-center gap-0.5">
                  <button
                    type="button"
                    className="chrome-icon-btn h-7 w-7"
                    aria-label="Mover para cima"
                    onClick={() => void onMove(task, "up")}
                  >
                    <ArrowUp size={14} strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    className="chrome-icon-btn h-7 w-7"
                    aria-label="Mover para baixo"
                    disabled={isLast}
                    onClick={() => void onMove(task, "down")}
                  >
                    <ArrowDown size={14} strokeWidth={1.75} />
                  </button>
                </div>
                <EditableTitle
                  value={task.title}
                  className="font-body flex-1 pt-0.5 text-base text-white/88"
                  onSave={(title) => onRename(task, title)}
                />
                {hasInstructions && (
                  <button
                    type="button"
                    className="chrome-icon-btn h-7 w-7 shrink-0"
                    aria-label={expanded ? "Ocultar instructions" : "Ver instructions"}
                    aria-pressed={expanded}
                    onClick={() =>
                      setExpandedId((id) => (id === task.id ? null : task.id))
                    }
                  >
                    <FileText size={14} strokeWidth={1.75} />
                  </button>
                )}
                <DeleteTaskButton task={task} onDelete={onDelete} />
              </div>
              {expanded && hasInstructions && (
                <div className="ml-14">
                  <TaskInstructions
                    value={task.instructions}
                    compact
                    onSave={(instructions) =>
                      onSaveInstructions(task, instructions)
                    }
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {tasks.length === 0 && !adding && (
        <p className="font-body text-sm text-white/45">Nenhuma tarefa em Next.</p>
      )}
    </section>
  );
}
