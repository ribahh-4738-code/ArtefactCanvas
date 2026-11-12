import { ChevronDown, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { InstitutoAppChrome } from "@instituto/tool-shell";
import type { ProjectSummary } from "../types";

type Props = {
  projectName: string;
  projects: ProjectSummary[];
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (title: string) => Promise<void>;
  onRenameProject: (title: string) => Promise<void>;
  onAddToday: () => void;
};

export function HeaderBar({
  projectName,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onRenameProject,
  onAddToday,
}: Props) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(projectName);
  const [menuOpen, setMenuOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createDraft, setCreateDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editingTitle) setTitleDraft(projectName);
  }, [projectName, editingTitle]);

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.select();
  }, [editingTitle]);

  useEffect(() => {
    if (creating) createInputRef.current?.focus();
  }, [creating]);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
        setCreating(false);
        setCreateDraft("");
        setError(null);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  async function commitRename() {
    const next = titleDraft.trim();
    if (!next || next === projectName) {
      setEditingTitle(false);
      setTitleDraft(projectName);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onRenameProject(next);
      setEditingTitle(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao renomear");
    } finally {
      setBusy(false);
    }
  }

  async function commitCreate() {
    const next = createDraft.trim();
    if (!next) return;
    setBusy(true);
    setError(null);
    try {
      await onCreateProject(next);
      setCreating(false);
      setCreateDraft("");
      setMenuOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <InstitutoAppChrome
      current="artefact-canvas"
      productName="Artefact Canvas"
      left={
        editingTitle ? (
          <input
            ref={titleInputRef}
            className="glass-input mt-1 py-1.5 text-sm"
            value={titleDraft}
            disabled={busy}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={() => void commitRename()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void commitRename();
              }
              if (e.key === "Escape") {
                setEditingTitle(false);
                setTitleDraft(projectName);
              }
            }}
          />
        ) : (
          <button
            type="button"
            className="font-subtitle mt-1 block max-w-full truncate text-left text-sm text-white/70 transition hover:text-white"
            title="Duplo clique para renomear"
            onDoubleClick={() => {
              setMenuOpen(false);
              setEditingTitle(true);
            }}
          >
            {projectName}
          </button>
        )
      }
    >
      <div className="relative" ref={menuRef}>
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            className="chrome-icon-btn"
            aria-label="Selecionar projeto"
            aria-expanded={menuOpen}
            title="Projetos"
            onClick={() => {
              setEditingTitle(false);
              setMenuOpen((o) => !o);
              setCreating(false);
              setError(null);
            }}
          >
            <ChevronDown className="h-4 w-4" strokeWidth={2.5} absoluteStrokeWidth />
          </button>
          <button
            type="button"
            className="chrome-icon-btn"
            onClick={onAddToday}
            aria-label="Nova tarefa em Today"
            title="Nova tarefa em Today"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} absoluteStrokeWidth />
          </button>
        </div>

        {menuOpen && (
          <div className="glass-panel absolute right-0 top-full z-40 mt-2 min-w-[16rem] p-2">
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
              Projetos
            </p>
            <ul className="max-h-56 space-y-0.5 overflow-y-auto">
              {projects.map((p) => {
                const active = p.id === activeProjectId;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition ${
                        active
                          ? "bg-white/20 text-white"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                      }`}
                      onClick={() => {
                        onSelectProject(p.id);
                        setMenuOpen(false);
                      }}
                    >
                      <span className="truncate">{p.name}</span>
                    </button>
                  </li>
                );
              })}
              {projects.length === 0 && (
                <li className="px-3 py-2 text-sm text-white/45">Nenhum projeto</li>
              )}
            </ul>

            <div className="mt-2 border-t border-white/10 pt-2">
              {creating ? (
                <div className="space-y-2 px-1">
                  <input
                    ref={createInputRef}
                    className="glass-input py-2 text-sm"
                    placeholder="Nome do novo projeto"
                    value={createDraft}
                    disabled={busy}
                    onChange={(e) => setCreateDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void commitCreate();
                      }
                      if (e.key === "Escape") {
                        setCreating(false);
                        setCreateDraft("");
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="glass-btn-primary flex-1 py-1.5 text-xs"
                      disabled={busy || !createDraft.trim()}
                      onClick={() => void commitCreate()}
                    >
                      Criar
                    </button>
                    <button
                      type="button"
                      className="glass-btn py-1.5 text-xs"
                      disabled={busy}
                      onClick={() => {
                        setCreating(false);
                        setCreateDraft("");
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="glass-btn w-full justify-start gap-2 py-2 text-sm"
                  onClick={() => setCreating(true)}
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} absoluteStrokeWidth />
                  Novo projeto
                </button>
              )}
            </div>

            {error && (
              <p className="mt-2 px-2 text-xs text-rose-200">{error}</p>
            )}
          </div>
        )}
      </div>
    </InstitutoAppChrome>
  );
}
