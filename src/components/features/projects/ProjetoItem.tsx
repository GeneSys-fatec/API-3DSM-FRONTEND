import React from "react";
import type { Projeto } from "@/types/types";

interface ProjetoItemProps {
  projeto: Projeto;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  onOpenOptions: (e: React.MouseEvent) => void;
}

export default function ProjetoItem({
  projeto,
  isActive,
  isExpanded,
  onClick,
  onOpenOptions,
}: ProjetoItemProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between w-full rounded-md p-2 text-md cursor-pointer transition-colors duration-150 ${
        isActive && isExpanded
          ? "bg-indigo-100 text-indigo-700 font-bold"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            isActive ? "bg-indigo-500" : "bg-slate-300"
          }`}
        />
        <p
          className={`leading-none truncate transition-opacity duration-200 ${
            isExpanded ? "opacity-100" : "opacity-0" 
          } lg:opacity-0 lg:group-hover:opacity-100`}
        >
          {projeto.projNome}
        </p>
      </div>
      <i
        role="button"
        aria-label="Mais opções"
        title="Mais opções"
        tabIndex={0}
        onClick={onOpenOptions}
        className={`fa-solid fa-ellipsis-vertical cursor-pointer p-0 rounded-full flex-shrink-0 transition-opacity duration-200 ${
          isExpanded ? "opacity-100" : "opacity-0"
        } lg:opacity-0 lg:group-hover:opacity-100
        ${
          isActive ? "text-indigo-600" : "text-slate-400 hover:bg-slate-200"
        } focus:outline-none focus:ring-2 focus:ring-indigo-400`}
      />
    </div>
  );
}
