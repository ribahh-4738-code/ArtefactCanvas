import { useState } from "react";
import type { Project } from "../types";

type Field = "artefato" | "iniciativa" | "aposta";

type Props = {
  project: Project;
  onSave: (field: Field, value: string) => Promise<void>;
};

const LABELS: Record<Field, string> = {
  artefato: "Artefato",
  iniciativa: "Iniciativa",
  aposta: "Aposta",
};

function MetaRow({
  field,
  value,
  onSave,
}: {
  field: Field;
  value: string;
  onSave: (field: Field, value: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  async function commit() {
    setEditing(false);
    if (draft.trim() === value) return;
    await onSave(field, draft);
  }

  return (
    <div className="font-body text-base leading-relaxed">
      <span className="meta-label">{LABELS[field]}: </span>
      {editing ? (
        <input
          className="inline-edit max-w-full text-white"
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
      ) : (
        <span
          className="cursor-text text-white/90"
          onDoubleClick={() => {
            setDraft(value);
            setEditing(true);
          }}
          title="Duplo clique para editar"
        >
          {value || "—"}
        </span>
      )}
    </div>
  );
}

export function ProjectMeta({ project, onSave }: Props) {
  return (
    <div className="mt-6 space-y-1.5">
      <MetaRow field="artefato" value={project.artefato} onSave={onSave} />
      <MetaRow field="iniciativa" value={project.iniciativa} onSave={onSave} />
      <MetaRow field="aposta" value={project.aposta} onSave={onSave} />
    </div>
  );
}
