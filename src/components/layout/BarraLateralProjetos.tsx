import { useState, useEffect, useCallback } from "react";
import ModalEditarProjetos from "../features/projects/ModalEditarProjetos";
import { authFetch } from "@/utils/api";
import type { Projeto, Equipe } from "@/types/types";
import { useOptionsMenu } from "@/hooks/useOptionsMenu";
import ProjetoItem from "../features/projects/ProjetoItem";
import { toast } from "react-toastify";

import { getMinhasEquipes } from "../features/teams/teamService";

interface EquipeComProjetos extends Equipe {
  projetos: Projeto[];
}

interface BarraLateralProjetosProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenModal: (equipeId: string) => void;
  onProjectSelect: (projId: string | null) => void;
}

export default function BarraLateralProjetos({
  isOpen,
  onClose,
  onOpenModal,
  onProjectSelect,
}: BarraLateralProjetosProps) {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [equipesComProjetos, setEquipesComProjetos] = useState<
    EquipeComProjetos[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projetoParaEditar, setProjetoParaEditar] = useState<Projeto | null>(
    null
  );
  const optionsMenu = useOptionsMenu();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const equipesComProjetosDoBackend = await getMinhasEquipes();

      setEquipesComProjetos(equipesComProjetosDoBackend);

      const primeiroProjeto = equipesComProjetosDoBackend[0]?.projetos[0];
      if (primeiroProjeto && !activeProjectId) {
        const firstProjectId = primeiroProjeto.projId;
        setActiveProjectId(firstProjectId);
        onProjectSelect(firstProjectId);
      } else if (!primeiroProjeto) {
        onProjectSelect(null);
      }
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        (error as Error).message || "Erro ao carregar dados da barra lateral."
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId, onProjectSelect]);
  useEffect(() => {
    fetchData();
    const handleDataChange = () => fetchData();
    window.addEventListener("projeto:created", handleDataChange);
    window.addEventListener("equipe:updated", handleDataChange);
    return () => {
      window.removeEventListener("projeto:created", handleDataChange);
      window.removeEventListener("equipe:updated", handleDataChange);
    };
  }, [fetchData]);

  const handleEdit = () => {
    if (!optionsMenu.selectedId) return;
    const todosProjetos = equipesComProjetos.flatMap((e) => e.projetos);
    const projeto =
      todosProjetos.find((p) => p.projId === optionsMenu.selectedId) ?? null;
    setProjetoParaEditar(projeto);
    setIsEditModalOpen(true);
    optionsMenu.close();
  };

  const handleDelete = async () => {
    if (!optionsMenu.selectedId) return;
    try {
      setIsDeleting(true);
      await authFetch(
        `http://localhost:8080/projeto/apagar/${encodeURIComponent(
          optionsMenu.selectedId
        )}`,
        { method: "DELETE", credentials: "include", }
      );
      if (activeProjectId === optionsMenu.selectedId) {
        onProjectSelect(null);
        setActiveProjectId(null);
      }
      await fetchData();
      optionsMenu.close();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className={`fixed lg:static h-full bg-white border-r border-slate-200 flex flex-col z-40 transition-transform lg:transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:w-16 lg:hover:w-64`}
      >
        <div className="p-4 text-center text-slate-400">
          <i className="fa-solid fa-spinner fa-spin"></i>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group fixed lg:static h-full bg-white border-r border-slate-200 flex flex-col z-40 transition-transform lg:transition-all duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:w-16 lg:hover:w-64`}
    >
      <div
        onClick={onClose}
        className="hidden lg:flex items-center justify-center w-6 h-6 rounded-full absolute -right-3 top-1/2 -translate-y-1/2 cursor-pointer bg-white border border-slate-200 hover:bg-indigo-100 group-hover:bg-indigo-100 transition-all duration-300"
      >
        <i
          className={`fa-solid fa-angles-right text-slate-500 text-base group-hover:text-indigo-600 transition-all duration-300 ${
            isOpen ? "" : "lg:group-hover:rotate-180"
          }`}
        ></i>
      </div>

      <div className="p-4 border-b border-slate-200 flex items-center gap-3 overflow-hidden">
        <i className="fa-solid fa-folder-open text-indigo-600 text-2xl"></i>
        <h2
          className={`text-xl font-bold text-slate-800 whitespace-nowrap transition-opacity duration-200 ${
            isOpen ? "opacity-100" : "opacity-0"
          } lg:opacity-0 lg:group-hover:opacity-100`}
        >
          Projetos
        </h2>
      </div>

      <div className="p-4 overflow-y-auto overflow-x-hidden flex-1">
        {equipesComProjetos.length === 0 && !isLoading && (
          <div
            className={`text-center p-4 t-9 transition-opacity duration-200 ${
              isOpen ? "opacity-100" : "opacity-0"
            } lg:opacity-0 lg:group-hover:opacity-100`}
          >
            <p className="text-slate-500 text-sm mt-4">
              Nenhuma equipe encontrada.
            </p>
          </div>
        )}

        <div>
          {equipesComProjetos.map((equipe) => (
            <div key={equipe.equId} className="pb-6">
              <div className="flex justify-between items-center mb-4 pb-1 border-b border-slate-100 gap-2">
                <h1
                  className={`font-bold text-slate-500 text-sm tracking-wider uppercase whitespace-nowrap transition-opacity ${
                    isOpen ? "opacity-100" : "opacity-0"
                  } lg:opacity-0 lg:group-hover:opacity-100`}
                >
                  {equipe.equNome}
                </h1>
                <button
                  onClick={() => onOpenModal(equipe.equId)}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition-colors"
                  title={`Adicionar projeto em ${equipe.equNome}`}
                >
                  <i className="fa-solid fa-plus"></i>
                  <span
                    className={`whitespace-nowrap ${
                      isOpen ? "opacity-100" : "opacity-0"
                    } lg:opacity-0 lg:group-hover:opacity-100`}
                  >
                    Add
                  </span>
                </button>
              </div>

              <div className="flex flex-col gap-3 py-2">
                {equipe.projetos.length === 0 && (
                  <p
                    className={`text-slate-400 text-xs px-2 transition-opacity duration-200 ${
                      isOpen ? "opacity-100" : "opacity-0"
                    } lg:opacity-0 lg:group-hover:opacity-100`}
                  >
                    Nenhum projeto aqui.
                  </p>
                )}
                {equipe.projetos.map((p) => (
                  <ProjetoItem
                    key={p.projId}
                    projeto={p}
                    isActive={activeProjectId === p.projId}
                    isExpanded={isOpen}
                    onClick={() => {
                      setActiveProjectId(p.projId);
                      onProjectSelect(p.projId);
                      if (isOpen) onClose();
                    }}
                    onOpenOptions={(e) => optionsMenu.open(e, p.projId)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {optionsMenu.isOpen && optionsMenu.position && (
        <>
          <div className="fixed inset-0 z-40" onClick={optionsMenu.close}></div>
          <div
            className="fixed z-50 bg-white border border-slate-200 rounded-md shadow-lg w-44 p-2"
            style={{
              top: optionsMenu.position.top,
              left: optionsMenu.position.left,
              transform: "translate(calc(-100% - 6px), -50%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleEdit}
              className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 flex items-center gap-2"
            >
              <i className="fa-solid fa-pen text-slate-600"></i>
              <span>Editar</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full text-left px-3 py-2 rounded hover:bg-red-50 text-red-700 flex items-center gap-2 disabled:opacity-60"
            >
              <i className="fa-solid fa-trash"></i>
              <span>{isDeleting ? "Excluindo..." : "Excluir"}</span>
            </button>
          </div>
        </>
      )}

      {isEditModalOpen && projetoParaEditar && (
        <ModalEditarProjetos
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          projeto={projetoParaEditar}
          onSaved={() => {
            fetchData();
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
