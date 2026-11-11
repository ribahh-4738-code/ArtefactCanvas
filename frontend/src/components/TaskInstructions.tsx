import { useEffect, useState } from "react";

type Props = {
  value: string;
  onSave: (value: string) => Promise<void>;
  compact?: boolean;
};

export function TaskInstructions({ value, onSave, compact = false }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  async function commit() {
    setEditing(false);
    if (draft === value) return;
    await onSave(draft);
  }

  if (editing) {
    return (
      <textarea
        className={`glass-input font-body ${compact ? "mt-2 min-h-[4.5rem]" : "mt-3 min-h-[7rem]"}`}
        value={draft}
        autoFocus
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <div className={compact ? "mt-2" : "mt-3"}>
      {!compact && (
        <h3 className="font-subtitle mb-1.5 text-[0.95em] text-white/55">
          Instructions
        </h3>
      )}
      <p
        className="font-body whitespace-pre-wrap text-white/80 cursor-text"
        onDoubleClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        title="Duplo clique para editar"
      >
        {value || "—"}
      </p>
    </div>
  );
}
