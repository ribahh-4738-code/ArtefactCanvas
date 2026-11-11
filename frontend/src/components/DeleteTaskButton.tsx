import { Trash2 } from "lucide-react";
import type { Task } from "../types";

type Props = {
  task: Task;
  onDelete: (task: Task) => Promise<void>;
  className?: string;
};

export function DeleteTaskButton({ task, onDelete, className = "h-7 w-7" }: Props) {
  return (
    <button
      type="button"
      className={`chrome-icon-btn shrink-0 ${className}`}
      aria-label="Excluir tarefa"
      onClick={() => {
        if (!window.confirm(`Excluir “${task.title}”?`)) return;
        void onDelete(task);
      }}
    >
      <Trash2 size={14} strokeWidth={1.75} />
    </button>
  );
}
