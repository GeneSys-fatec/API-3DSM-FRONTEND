import { ModalContext } from "../context/ModalContext";
import { authFetch } from "../utils/api";
import { useKanban } from "../hooks/useKanban";
import { encontrarColunaDaTarefa, dropAnimation } from "../utils/kanbanUtils";
import { type Tarefa, type Coluna } from "../types/types";
import { showErrorToastFromResponse } from "../utils/errorUtils";

import ColunaKanban from "../components/features/tasks/ColunaKanban";
import CardTarefa from "../components/features/tasks/CardTarefa";
import ModalCriarTarefas from "../components/features/tasks/ModalCriarTarefas";
import ModalEditarTarefas from "../components/features/tasks/ModalEditarTarefas";
import ModalConfirmacao from "../components/ui/ModalConfirmacao";
import { useState, useContext, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  rectIntersection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useMemo } from "react";

export default function Home() {
  const { selectedProjectId } = useOutletContext<{
    selectedProjectId: string | null;
  }>();
  const { colunas, tarefas, loading, fetchData, setTarefas, setColunas } =
    useKanban(selectedProjectId);
  const modalContext = useContext(ModalContext);

  const [activeTask, setActiveTask] = useState<Tarefa | null>(null);
  const [activeColumn, setActiveColumn] = useState<Coluna | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [itemParaExcluir, setItemParaExcluir] = useState<{
    type: "tarefa" | "coluna";
    data: Tarefa | Coluna;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, {})
  );

  const colunasIds = useMemo(() => colunas.map((c) => c.id), [colunas]);

  const handleSaveColumnOrder = async (
    updateData: { id: string; ordem: number }[]
  ) => {
    try {
      const response = await authFetch(
        `http://localhost:8080/colunas/reordenar`,
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );
      if (!response.ok)
        throw new Error("Falha ao reordenar as colunas no servidor.");
    } catch (error) {
      console.error(
        "Erro ao salvar a ordem das colunas, revertendo a UI:",
        error
      );
      fetchData();
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type;

    if (type === "task") {
      const activeId = active.id as string;
      const colunaTitulo = encontrarColunaDaTarefa(activeId, tarefas);
      if (colunaTitulo) {
        const tarefa = tarefas[colunaTitulo].find((t) => t.tarId === activeId);
        if (tarefa) setActiveTask(tarefa);
      }
    }

    if (type === "column") {
      setActiveColumn(active.data.current?.coluna);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    setActiveColumn(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeType = active.data.current?.type;

    if (activeType === "column") {
      setColunas((prevColunas) => {
        const activeIndex = prevColunas.findIndex((c) => c.id === activeId);
        const overIndex = prevColunas.findIndex((c) => c.id === overId);

        if (activeIndex === -1 || overIndex === -1) return prevColunas;

        const newColunas = arrayMove(prevColunas, activeIndex, overIndex);

        const updateData = newColunas.map((col, index) => ({
          id: col.id,
          ordem: index,
        }));

        handleSaveColumnOrder(updateData);

        return newColunas;
      });
    }

    if (activeType === "task") {
      const activeContainer = encontrarColunaDaTarefa(activeId, tarefas);
      const overColuna = colunas.find((c) => c.id === overId);
      const overContainer = overColuna
        ? overColuna.titulo
        : encontrarColunaDaTarefa(overId, tarefas);

      if (
        !activeContainer ||
        !overContainer ||
        activeContainer === overContainer
      )
        return;

      const tarefaMovida = tarefas[activeContainer]?.find(
        (t) => t.tarId === activeId
      );
      if (!tarefaMovida) return;

      setTarefas((prev) => {
        const newTarefas = JSON.parse(JSON.stringify(prev));
        const activeItems = newTarefas[activeContainer];
        const activeIndex = activeItems.findIndex(
          (item: Tarefa) => item.tarId === activeId
        );

        const [movedItem] = activeItems.splice(activeIndex, 1);
        movedItem.tarStatus = overContainer;

        const overItems = newTarefas[overContainer];
        overItems.push(movedItem);

        return newTarefas;
      });

      try {
        const response = await authFetch(
          `http://localhost:8080/tarefa/atualizar/${activeId}`,
          {
            method: "PUT",
            body: JSON.stringify({ ...tarefaMovida, tarStatus: overContainer }),
          }
        );
        if (!response.ok)
          throw new Error("Falha ao atualizar a tarefa no servidor.");
      } catch (error) {
        console.error(
          "Erro ao salvar a mudança da tarefa, revertendo a UI:",
          error
        );
        fetchData();
      }
    }
  };

  const handleAddColumn = async () => {
    if (!selectedProjectId) return;
    try {
      const response = await authFetch(
        "http://localhost:8080/colunas/cadastrar",
        {
          method: "POST",
          body: JSON.stringify({
            titulo: "Nova Coluna",
            projId: selectedProjectId,
          }),
        }
      );
      if (!response.ok) {
        await showErrorToastFromResponse(response, "Erro ao criar coluna");
        return;
      }
      await fetchData();
    } catch (error) {
      console.error("Erro ao adicionar nova coluna:", error);
    }
  };

  const handleUpdateColumnTitle = async (id: string, newTitle: string) => {
    const originalColumns = [...colunas];
    setEditingColumnId(null);
    setColunas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, titulo: newTitle } : c))
    );

    try {
      const response = await authFetch(
        `http://localhost:8080/colunas/atualizar/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({ titulo: newTitle }),
        }
      );
      if (!response.ok) {
        await showErrorToastFromResponse(response, "Erro ao atualizar o título");
        setColunas(originalColumns);
        return;
      }
      await fetchData();
    } catch (error) {
      console.error("Erro ao atualizar título da coluna:", error);
      setColunas(originalColumns);
    }
  };

  const executarExclusao = async () => {
    if (!itemParaExcluir) return;
    const { type, data } = itemParaExcluir;
    const url =
      type === "tarefa"
        ? `http://localhost:8080/tarefa/apagar/${(data as Tarefa).tarId}`
        : `http://localhost:8080/colunas/deletar/${(data as Coluna).id}`;

    try {
      const response = await authFetch(url, { method: "DELETE" });
      if (!response.ok) {
        await showErrorToastFromResponse(response, `Erro ao excluir ${type}`);
        return;
      }
      fetchData();
    } catch (error) {
      console.error(`Falha ao excluir ${type}:`, error);
    } finally {
      setItemParaExcluir(null);
    }
  };

  const abrirModalCriacao = useCallback(
    (statusDaColuna: string) => {
      modalContext?.openModal(
        <ModalCriarTarefas
          onSuccess={fetchData}
          statusInicial={statusDaColuna}
          selectedProjectId={selectedProjectId}
        />
      );
    },
    [modalContext, fetchData, selectedProjectId]
  );

  const abrirModalEdicao = useCallback(
    (tarefa: Tarefa) => {
      modalContext?.openModal(
        <ModalEditarTarefas tarefa={tarefa} onSave={fetchData} />
      );
    },
    [modalContext, fetchData]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        Carregando quadro...
      </div>
    );
  }

  if (!selectedProjectId) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-center p-4">
        <i className="fa-solid fa-folder-open text-5xl text-slate-300 mb-4"></i>
        <h2 className="text-xl font-bold text-slate-600">
          Nenhum projeto selecionado
        </h2>
        <p className="text-slate-500 mt-1">
          Crie um projeto ou selecione um existente na barra lateral para
          começar.
        </p>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col h-full lg:flex-row items-center lg:items-start gap-5 pt-5 pb-4 lg:pr-4 flex-1 overflow-y-auto lg:overflow-x-auto lg:overflow-y-hidden">
          <SortableContext
            items={colunasIds}
            strategy={horizontalListSortingStrategy}
          >
            {colunas.map((coluna) => (
              <ColunaKanban
                key={coluna.id}
                {...coluna}
                tarefas={tarefas[coluna.titulo] || []}
                onAbrirModalCriacao={() => abrirModalCriacao(coluna.titulo)}
                onAbrirModalEdicao={abrirModalEdicao}
                onApagarColuna={() => {
                  if ((tarefas[coluna.titulo] || []).length > 0) {
                    alert("Não é possível apagar colunas com tarefas.");
                    return;
                  }
                  setItemParaExcluir({ type: "coluna", data: coluna });
                }}
                onExcluirTarefa={(tarefa) =>
                  setItemParaExcluir({ type: "tarefa", data: tarefa })
                }
                isEditing={editingColumnId === coluna.id}
                onStartEditing={setEditingColumnId}
                onFinishEditing={handleUpdateColumnTitle}
              />
            ))}
          </SortableContext>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeTask ? <CardTarefa tarefa={activeTask} isOverlay /> : null}

            {activeColumn ? (
              <ColunaKanban
                {...activeColumn}
                tarefas={tarefas[activeColumn.titulo] || []}
                onAbrirModalCriacao={() => {}}
                onAbrirModalEdicao={() => {}}
                onApagarColuna={() => {}}
                onExcluirTarefa={() => {}}
                isEditing={false}
                onStartEditing={() => {}}
                onFinishEditing={() => {}}
                isOverlay
              />
            ) : null}
          </DragOverlay>

          <div className="w-full lg:w-80 flex-shrink-0 lg:mt-0">
            <button
              onClick={handleAddColumn}
              className="w-full rounded-lg bg-gray-200/70 p-3 text-center transition-colors hover:bg-gray-300 lg:h-full flex items-center justify-center"
            >
              <h2 className="text-xl font-bold tracking-wider text-gray-600">
                + Adicionar Coluna
              </h2>
            </button>
          </div>
        </div>
      </DndContext>

      {itemParaExcluir && (
        <ModalConfirmacao
          titulo={
            itemParaExcluir.type === "tarefa"
              ? "Tem certeza?"
              : "Excluir Coluna?"
          }
          mensagem={
            <p>
              {itemParaExcluir.type === "tarefa" ? 'A tarefa "' : 'A coluna "'}
              <span className="font-bold">
                {itemParaExcluir.type === "tarefa"
                  ? (itemParaExcluir.data as Tarefa).tarTitulo
                  : (itemParaExcluir.data as Coluna).titulo}
              </span>
              {'" será excluída permanentemente.'}
            </p>
          }
          onConfirm={executarExclusao}
          onCancel={() => setItemParaExcluir(null)}
        />
      )}
    </>
  );
}