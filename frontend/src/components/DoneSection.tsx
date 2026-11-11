import { FileText, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDoneHeading, toDateKey, todayKey } from "../lib/dates";
import type { Task } from "../types";
import { DeleteTaskButton } from "./DeleteTaskButton";
import { EditableTitle } from "./EditableTitle";
import { TaskInstructions } from "./TaskInstructions";

type Props = {
  done: Task[];
  onAddBatch: (titles: string[], completedOn: string) => Promise<void>;
  onToggleComplete: (task: Task, completed: boolean) => Promise<void>;
  onRename: (task: Task, title: string) => Promise<void>;
  onSaveInstructions: (task: Task, instructions: string) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
  onChangeDate: (task: Task, completedOn: string) => Promise<void>;
};

export function DoneSection({
  done,
  onAddBatch,
  onToggleComplete,
  onRename,
  onSaveInstructions,
  onDelete,
  onChangeDate,
}: Props) {
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [extraDates, setExtraDates] = useState<string[]>([]);
  const [newDate, setNewDate] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of done) {
      const key = task.completedAt ? toDateKey(task.completedAt) : todayKey();
      const list = map.get(key) ?? [];
      list.push(task);
      map.set(key, list);
    }
    for (const dateKey of extraDates) {
      if (!map.has(dateKey)) map.set(dateKey, []);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [done, extraDates]);

  async function submitAdd(dateKey: string) {
    const titles = draft
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (titles.length === 0) {
      setAddingFor(null);
      setDraft("");
      return;
    }
    await onAddBatch(titles, dateKey);
    setDraft("");
    setAddingFor(null);
  }

  function addEarlierDate() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) return;
    setExtraDates((prev) =>
      prev.includes(newDate) ? prev : [...prev, newDate].sort().reverse(),
    );
    setAddingFor(newDate);
    setDraft("");
    setNewDate("");
  }

  return (
    <section className="mt-10 pb-16">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="section-title">Done</h2>
        <button
          type="button"
          className="chrome-icon-btn"
          aria-label="Adicionar concluídas hoje"
          onClick={() => {
            setAddingFor(todayKey());
            setDraft("");
          }}
        >
          <Plus size={18} strokeWidth={1.75} />
        </button>
        <div className="ml-auto flex items-center gap-2">
          <label className="font-subtitle text-xs text-white/50" htmlFor="earlier-date">
            Data anterior
          </label>
          <input
            id="earlier-date"
            type="date"
            className="glass-input w-auto py-1.5 text-sm"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <button
            type="button"
            className="glass-btn py-1.5 text-xs"
            onClick={addEarlierDate}
            disabled={!newDate}
          >
            Adicionar
          </button>
        </div>
      </div>

      {groups.length === 0 && addingFor === null && (
        <p className="font-body text-sm text-white/45">Nenhuma tarefa concluída.</p>
      )}

      {groups.map(([dateKey, tasks]) => (
        <div key={dateKey} className="mb-6">
          <div className="mb-2 flex items-center gap-1">
            <h3 className="font-subtitle text-sm text-white/70">
              {formatDoneHeading(dateKey)}
            </h3>
            <button
              type="button"
              className="chrome-icon-btn h-7 w-7"
              aria-label={`Adicionar em ${dateKey}`}
              onClick={() => {
                setAddingFor(dateKey);
                setDraft("");
              }}
            >
              <Plus size={14} strokeWidth={1.75} />
            </button>
          </div>

          {addingFor === dateKey && (
            <div className="mb-3">
              <textarea
                className="glass-input min-h-[6rem]"
                placeholder="Uma tarefa concluída por linha…"
                value={draft}
                autoFocus
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => void submitAdd(dateKey)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setDraft("");
                    setAddingFor(null);
                  }
                }}
              />
            </div>
          )}

          <ul className="space-y-2">
            {tasks.map((task) => {
              const hasInstructions = task.instructions.trim().length > 0;
              const expanded = expandedId === task.id;
              const taskDate = task.completedAt
                ? toDateKey(task.completedAt)
                : dateKey;
              return (
                <li key={task.id}>
                  <div className="flex flex-wrap items-start gap-2 sm:gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-white"
                      checked
                      onChange={() => void onToggleComplete(task, false)}
                      aria-label="Reabrir tarefa"
                    />
                    <EditableTitle
                      value={task.title}
                      className="font-body task-strike min-w-0 flex-1 text-base"
                      onSave={(title) => onRename(task, title)}
                    />
                    <input
                      type="date"
                      className="glass-input w-auto shrink-0 py-1 text-xs"
                      value={taskDate}
                      aria-label="Data de conclusão"
                      onChange={(e) => {
                        const next = e.target.value;
                        if (!next || next === taskDate) return;
                        void onChangeDate(task, next);
                      }}
                    />
                    {hasInstructions && (
                      <button
                        type="button"
                        className="chrome-icon-btn h-7 w-7 shrink-0"
                        aria-label={
                          expanded ? "Ocultar instructions" : "Ver instructions"
                        }
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
                    <div className="ml-8">
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
        </div>
      ))}
    </section>
  );
}
