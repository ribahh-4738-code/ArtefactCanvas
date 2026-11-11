import { useState } from "react";

type Props = {
  value: string;
  className?: string;
  onSave: (value: string) => Promise<void>;
};

export function EditableTitle({ value, className = "", onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  async function commit() {
    setEditing(false);
    const next = draft.trim();
    if (!next || next === value) {
      setDraft(value);
      return;
    }
    await onSave(next);
  }

  if (editing) {
    return (
      <input
        className={`inline-edit ${className}`}
        value={draft}
        autoFocus
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void commit();
          }
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <span
      className={`cursor-text ${className}`}
      onDoubleClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      title="Duplo clique para editar"
    >
      {value}
    </span>
  );
}
