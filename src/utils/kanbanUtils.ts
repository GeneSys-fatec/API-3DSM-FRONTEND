import { type Coluna, type Tarefa } from "../types/types";
import {
  defaultDropAnimationSideEffects,
  type DropAnimation,
} from "@dnd-kit/core";

export const agruparTarefasPorColuna = (
  tarefas: Tarefa[],
  colunas: Coluna[]
) => {
  const tarefasAgrupadas: { [key: string]: Tarefa[] } = {};

  colunas.forEach((coluna) => {
    tarefasAgrupadas[coluna.titulo] = [];
  });

  tarefas.forEach((tarefa) => {
    if (tarefasAgrupadas[tarefa.tarStatus]) {
      tarefasAgrupadas[tarefa.tarStatus].push(tarefa);
    }
  });
  return tarefasAgrupadas;
};

export const adicionarCoresAsColunas = (
  colunasDaAPI: Omit<Coluna, "corClasse" | "corFundo">[]
): Coluna[] => {
  const paletaDeCores = [
    { corClasse: "orange-400", corFundo: "bg-orange-400/35" },
    { corClasse: "blue-400", corFundo: "bg-blue-400/40" },
    { corClasse: "green-500", corFundo: "bg-green-500/40" },
    { corClasse: "purple-400", corFundo: "bg-purple-400/35" },
    { corClasse: "red-400", corFundo: "bg-red-400/35" },
  ];

  return colunasDaAPI.map((coluna, index) => ({
    ...coluna,
    ...paletaDeCores[index % paletaDeCores.length],
  }));
};

export const encontrarColunaDaTarefa = (
  tarefaId: string,
  tarefas: { [key: string]: Tarefa[] }
): string | null => {
  if (!tarefaId) return null;
  for (const colunaTitulo in tarefas) {
    if (tarefas[colunaTitulo].some((tarefa) => tarefa.tarId === tarefaId)) {
      return colunaTitulo;
    }
  }
  return null;
};

export const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: { opacity: "0.5" },
    },
  }),
};
