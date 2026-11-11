import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CompanySummary, ProjectSummary } from "../types";

type Props = {
  company: CompanySummary;
  projectName: string;
  companies: CompanySummary[];
  projects: ProjectSummary[];
  onSelectCompany: (companyId: string) => void;
  onSelectProject: (projectId: string) => void;
  onCreateCompany: () => void;
  onCreateProject: () => void;
};

export function HeaderBar({
  company,
  projectName,
  companies,
  projects,
  onSelectCompany,
  onSelectProject,
  onCreateCompany,
  onCreateProject,
}: Props) {
  const [companyOpen, setCompanyOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const companyRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (companyRef.current && !companyRef.current.contains(t)) {
        setCompanyOpen(false);
      }
      if (projectRef.current && !projectRef.current.contains(t)) {
        setProjectOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <header className="flex items-start justify-between gap-6">
      <div className="relative min-w-0" ref={projectRef}>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="font-display truncate text-left text-4xl text-white transition hover:text-white/85 sm:text-5xl"
            onClick={() => {
              setProjectOpen((v) => !v);
              setCompanyOpen(false);
            }}
            title="Alternar projeto"
          >
            {projectName}
          </button>
          <button
            type="button"
            className="chrome-icon-btn shrink-0"
            aria-label="Novo projeto"
            onClick={onCreateProject}
          >
            <Plus size={20} strokeWidth={1.75} />
          </button>
        </div>
        {projectOpen && (
          <div className="glass-panel absolute left-0 z-20 mt-2 min-w-[14rem] overflow-hidden py-1">
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                className="block w-full px-4 py-2.5 text-left font-body text-sm text-white/85 hover:bg-white/10"
                onClick={() => {
                  setProjectOpen(false);
                  onSelectProject(p.id);
                }}
              >
                {p.name}
              </button>
            ))}
            {projects.length === 0 && (
              <p className="px-4 py-2.5 font-body text-sm text-white/45">
                Nenhum projeto
              </p>
            )}
          </div>
        )}
      </div>

      <div className="relative shrink-0" ref={companyRef}>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="chrome-icon-btn"
            aria-label="Nova empresa"
            onClick={onCreateCompany}
          >
            <Plus size={18} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="font-subtitle text-right text-base text-white/80 transition hover:text-white"
            onClick={() => {
              setCompanyOpen((v) => !v);
              setProjectOpen(false);
            }}
            title="Alternar empresa"
          >
            {company.name}
          </button>
        </div>
        {companyOpen && (
          <div className="glass-panel absolute right-0 z-20 mt-2 min-w-[14rem] overflow-hidden py-1">
            {companies.map((c) => (
              <button
                key={c.id}
                type="button"
                className="block w-full px-4 py-2.5 text-left font-body text-sm text-white/85 hover:bg-white/10"
                onClick={() => {
                  setCompanyOpen(false);
                  onSelectCompany(c.id);
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
