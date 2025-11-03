import { useState, useCallback, useEffect } from "react";
import { type Coluna, type Tarefa } from "../types/types";
import { authFetch } from "../utils/api";
import {
  agruparTarefasPorColuna,
  adicionarCoresAsColunas,
} from "../utils/kanbanUtils";

export function useKanban(selectedProjectId: string | null) {
  const [colunas, setColunas] = useState<Coluna[]>([]);
  const [tarefas, setTarefas] = useState<{ [key: string]: Tarefa[] }>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!selectedProjectId) {
      setColunas([]);
      setTarefas({});
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [colunasResponse, tarefasResponse] = await Promise.all([
        authFetch(
          `http://localhost:8080/colunas/por-projeto/${selectedProjectId}`
        ),
        authFetch(
          `http://localhost:8080/tarefa/por-projeto/${selectedProjectId}`
        ),
      ]);

      if (!colunasResponse.ok || !tarefasResponse.ok) {
        throw new Error("Falha ao buscar dados da API");
      }

      const colunasDataFromAPI: Omit<Coluna, "corClasse" | "corFundo">[] =
        await colunasResponse.json();
      const tarefasData: Tarefa[] = await tarefasResponse.json();

      const colunasData = adicionarCoresAsColunas(
        colunasDataFromAPI.sort((a, b) => a.ordem - b.ordem)
      );

      setColunas(colunasData);
      setTarefas(agruparTarefasPorColuna(tarefasData, colunasData));
    } catch (error) {
      console.error("Erro ao carregar o quadro:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { colunas, tarefas, loading, fetchData, setTarefas, setColunas };
}
