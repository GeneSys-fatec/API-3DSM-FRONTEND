import React, { useState, useEffect, useContext, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import ModalCriarTarefas from "./ModalCriarTarefas";
import ModalEditarTarefas from "./ModalEditarTarefas";
import { ModalContext } from "@/context/ModalContext";
import type { ResponsavelTarefa, Tarefa } from "@/types/types";
import { authFetch } from "@/utils/api";
import { formatDateToDDMMYYYY } from "@/utils/dateUtils";

const getStatusClass = (status: string | null | undefined) => {
  if (!status) {
    return "bg-gray-100 text-gray-800";
  }
  switch (status.toLowerCase()) {
    case "pendente":
      return "bg-orange-100 text-orange-400";
    case "em desenvolvimento":
      return "bg-blue-100 text-blue-400";
    case "concluída":
      return "bg-green-100 text-green-500";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPrioridadeClass = (prioridade: string | null | undefined) => {
  if (!prioridade) {
    return "bg-gray-100 text-gray-800";
  }
  switch (prioridade.toLowerCase()) {
    case "alta":
      return "bg-red-100 text-red-700";
    case "média":
      return "bg-yellow-100 text-yellow-700";
    case "baixa":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const AvatarCircle: React.FC<{ responsavel: ResponsavelTarefa }> = ({
  responsavel,
}) => (
  <div
    className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold border-2 border-white"
    title={responsavel.usuNome}
  >
    {responsavel.usuNome?.charAt(0)?.toUpperCase() || "?"}
  </div>
);

const AvatarCountCircle: React.FC<{ count: number }> = ({ count }) => (
  <div
    className="w-7 h-7 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-bold border-2 border-white"
    title={`${count} mais responsáveis`}
  >
    +{count}
  </div>
);

export default function ListaTarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tarefaParaExcluir, setTarefaParaExcluir] = useState<string | null>(
    null
  );

  const modalContext = useContext(ModalContext);
  const { selectedProjectId } = useOutletContext<{
    selectedProjectId: string | null;
  }>();

  const carregarTarefas = useCallback(async () => {
    if (!selectedProjectId) {
      setTarefas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(
        `http://localhost:8080/tarefa/por-projeto/${selectedProjectId}`
      );
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Erro na requisição: ${response.statusText}. Resposta: ${errorBody}`
        );
      }

      const data: any[] = await response.json();

      const tarefasConvertidas: Tarefa[] = data.map((item) => ({
        tarId: item.tarId,
        tarTitulo: item.tarTitulo,
        tarStatus: item.tarStatus,

        responsaveis: item.responsaveis || [],

        tarPrazo: item.tarPrazo ?? "-",
        tarPrioridade: item.tarPrioridade,
        tarDescricao: item.tarDescricao,
        projId: item.projId,
        tarAnexo: null,
      }));

      setTarefas(tarefasConvertidas);
    } catch (err) {
      console.error("Falha ao carregar tarefas:", err);
      setError("Não foi possível carregar as tarefas.");
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    carregarTarefas();
  }, [carregarTarefas]);

  const executarExclusao = useCallback(async () => {
    if (!tarefaParaExcluir) return;

    try {
      const response = await authFetch(
        `http://localhost:8080/tarefa/apagar/${tarefaParaExcluir}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Erro ao excluir tarefa: ${response.statusText}. Resposta: ${errorBody}`
        );
      }
      setTarefas((prevTarefas) =>
        prevTarefas.filter((tarefa) => tarefa.tarId !== tarefaParaExcluir)
      );
      setTarefaParaExcluir(null);
    } catch (err) {
      console.error("Falha ao excluir tarefa:", err);
      setError("Não foi possível excluir a tarefa.");
      setTarefaParaExcluir(null);
    }
  }, [tarefaParaExcluir]);

  const abrirModalCriacao = useCallback(() => {
    if (modalContext) {
      modalContext.openModal(
        <ModalCriarTarefas
          onSuccess={carregarTarefas}
          statusInicial="Pendente"
          selectedProjectId={selectedProjectId}
        />
      );
    }
  }, [modalContext, carregarTarefas, selectedProjectId]);

  const abrirModalEdicao = useCallback(
    (tarefa: Tarefa) => {
      if (modalContext) {
        modalContext.openModal(
          <ModalEditarTarefas tarefa={tarefa} onSave={carregarTarefas} />
        );
      }
    },
    [modalContext, carregarTarefas]
  );

  if (loading) {
    return <div className="p-4 text-center">Carregando tarefas...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600 text-center">{error}</div>;
  }

  if (!selectedProjectId) {
    return (
      <div className="p-4 text-center text-gray-500">
        Selecione um projeto para ver as tarefas.
      </div>
    );
  }

  return (
    <>
      <div className="bg-white md:p-4 md:rounded-lg md:shadow-md overflow-hidden relative min-w-full">
        <div className="hidden md:block">
          <div className="max-h-[700px] overflow-y-auto">
            <div className="grid grid-cols-7 gap-4 py-3 px-2 text-xs font-semibold text-gray-500 border-b sticky top-0 bg-white">
              <div className="text-center">ID</div>
              <div className="text-center">
                <i className="fa-solid fa-bars-staggered pr-2" />
                Título
              </div>
              <div className="text-center">
                <i className="fa-solid fa-user pr-1" />
                Responsável
              </div>
              <div className="text-center">
                <i className="fa-solid fa-tag pr-1" />
                Entrega
              </div>
              <div className="text-center">
                <i className="fa-solid fa-arrow-up pr-1" />
                Prioridade
              </div>
              <div className="text-center">
                <i className="fa-solid fa-arrow-right pr-1" />
                Status
              </div>
              <div className="text-center">
                <i className="fa-solid fa-cog pr-1" />
                Ações
              </div>
            </div>
            <div>
              {tarefas.map((tarefa, index) => (
                <div
                  key={tarefa.tarId}
                  className="grid grid-cols-7 gap-4 p-3 items-center hover:bg-gray-100 transition-all duration-100 ease-in-out"
                >
                  <div className="text-sm font-medium text-gray-800 text-center">
                    {index + 1}
                  </div>
                  <div className="text-sm text-gray-800 text-center truncate">
                    {tarefa.tarTitulo}
                  </div>

                  <div className="flex justify-center items-center -space-x-2 px-2">
                    {tarefa.responsaveis && tarefa.responsaveis.length > 0 ? (
                      <>
                        {tarefa.responsaveis.slice(0, 2).map((r) => (
                          <AvatarCircle key={r.usuId} responsavel={r} />
                        ))}

                        {tarefa.responsaveis.length > 2 && (
                          <AvatarCountCircle
                            count={tarefa.responsaveis.length - 2}
                          />
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-300 transition-colors whitespace-nowrap">
                      {formatDateToDDMMYYYY(tarefa.tarPrazo)}
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-md uppercase whitespace-nowrap ${getPrioridadeClass(
                        tarefa.tarPrioridade
                      )}`}
                    >
                      {tarefa.tarPrioridade}
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-md uppercase whitespace-nowrap ${getStatusClass(
                        tarefa.tarStatus
                      )}`}
                      title={tarefa.tarStatus}
                    >
                      {tarefa.tarStatus}
                    </span>
                  </div>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => abrirModalEdicao(tarefa)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Editar"
                    >
                      <i className="fa-solid fa-pencil text-sm"></i>
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 p-1"
                      onClick={() => setTarefaParaExcluir(tarefa.tarId)}
                      title="Excluir"
                    >
                      <i className="fa-solid fa-trash text-sm"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-4">
            <button
              onClick={abrirModalCriacao}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
            >
              <i className="fa-solid fa-plus mr-2"></i>Adicionar Nova Tarefa
            </button>
          </div>
        </div>

        <div className="block md:hidden relative w-screen -ml-1">
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto pb-20 px-1 -mt-2">
            <div className="space-y-4">
              {tarefas.map((tarefa, index) => (
                <React.Fragment key={tarefa.tarId}>
                  <div className="bg-white rounded-lg p-5 hover:bg-gray-200 active:bg-gray-200 transition-all duration-300 ease-in-out">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0 mr-3">
                        <h3 className="font-semibold text-gray-800 text-lg break-words mb-2">
                          <span className="text-gray-500">#{index + 1}</span> -{" "}
                          {tarefa.tarTitulo}
                        </h3>
                        <div className="flex gap-2">
                          <span
                            className={`px-3 py-1 text-sm font-bold rounded-full uppercase ${getPrioridadeClass(
                              tarefa.tarPrioridade
                            )}`}
                          >
                            {tarefa.tarPrioridade}
                          </span>
                          <span
                            className={`px-3 py-1 text-sm font-bold rounded-full uppercase ${getStatusClass(
                              tarefa.tarStatus
                            )}`}
                          >
                            {tarefa.tarStatus}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => abrirModalEdicao(tarefa)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                          title="Editar"
                        >
                          <i className="fa-solid fa-pencil text-lg"></i>
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 p-2"
                          onClick={() => setTarefaParaExcluir(tarefa.tarId)}
                          title="Excluir"
                        >
                          <i className="fa-solid fa-trash text-lg"></i>
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-base">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-start min-w-0 flex-1">
                          <span className="text-gray-600 font-medium flex-shrink-0 pt-1">
                            Responsável:
                          </span>

                          <div className="flex items-center -space-x-2 pl-2">
                            {tarefa.responsaveis &&
                            tarefa.responsaveis.length > 0 ? (
                              tarefa.responsaveis.map((r) => (
                                <AvatarCircle key={r.usuId} responsavel={r} />
                              ))
                            ) : (
                              <span className="text-sm text-gray-500 pt-1">
                                -
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center min-w-0 flex-1">
                          <span className="text-gray-600 font-medium flex-shrink-0">
                            Entrega:
                          </span>
                          <span className="text-gray-800 font-medium pl-2">
                            {formatDateToDDMMYYYY(tarefa.tarPrazo)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < tarefas.length - 1 && (
                    <hr className="border-gray-400 mx-4" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="fixed bottom-20 left-4 right-4 z-50">
            <div className="bg-white border-t border-gray-200 p-3 rounded-lg shadow-lg">
              <button
                onClick={abrirModalCriacao}
                className="w-full bg-blue-300 hover:bg-blue-600 text-white hover:text-white font-semibold py-4 px-4 rounded-lg transition-colors flex items-center justify-center text-lg"
                title="Adicionar Nova Tarefa"
              >
                <i className="fa-solid fa-plus mr-2 text-lg"></i>Adicionar Nova
                Tarefa
              </button>
            </div>
          </div>
        </div>
      </div>

      {tarefaParaExcluir && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setTarefaParaExcluir(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <i className="fa-solid fa-triangle-exclamation text-red-500 text-4xl mb-4"></i>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tem certeza?
              </h3>
              <p className="text-gray-600">
                Esta ação não pode ser desfeita. A tarefa será excluída
                permanentemente.
              </p>
              <div
                className="flex gap-4 justify-center"
                style={{ paddingTop: "20px" }}
              >
                <button
                  onClick={() => setTarefaParaExcluir(null)}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={executarExclusao}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
