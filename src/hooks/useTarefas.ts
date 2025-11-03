import { useState, useCallback, useEffect } from "react";
import { authFetch } from "@/utils/api";
import type { Tarefa } from "@/types/types";

export interface EventoTarefa {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    status: string;
    prioridade: string;
    responsavel: string;
    tarefaCompleta: Tarefa;
  };
}

const converterTarefasParaEventos = (tarefas: Tarefa[]): EventoTarefa[] =>
  tarefas.map(tarefa => {
    const dataVencimento = new Date(tarefa.tarPrazo + 'T00:00:00');
    return {
      id: tarefa.tarId,
      title: tarefa.tarTitulo,
      start: dataVencimento,
      end: new Date(dataVencimento.getTime() + (23 * 60 * 60 * 1000)),
      resource: {
        status: tarefa.tarStatus,
        prioridade: tarefa.tarPrioridade,
        responsavel: tarefa.usuNome,
        tarefaCompleta: tarefa
      }
    };
  });

export function useTarefas(selectedProjectId: string | null) {
  const [eventos, setEventos] = useState<EventoTarefa[]>([]);
  const [eventosFiltrados, setEventosFiltrados] = useState<EventoTarefa[]>([]);
  const [responsaveis, setResponsaveis] = useState<string[]>([]);
  const [responsavelSelecionado, setResponsavelSelecionado] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [mensagemVazia, setMensagemVazia] = useState<string>('');


  const carregarTarefas = useCallback(async () => {
    if (!selectedProjectId) {
      setEventos([]);
      setEventosFiltrados([]);
      setResponsaveis([]);
      setLoading(false);
      setMensagemVazia('Selecione um projeto para ver as tarefas no calendário.');
      return;
    }
    setLoading(true);
    try {
      const response = await authFetch(
        `http://localhost:8080/tarefa/por-projeto/${selectedProjectId}`
      );
      if (!response.ok) throw new Error('Erro ao carregar tarefas');
      const data: Tarefa[] = await response.json();
      if (data.length === 0) {
        setMensagemVazia('Não há tarefas disponíveis para exibir no calendário.');
        setEventos([]);
        setEventosFiltrados([]);
        setResponsaveis([]);
        setLoading(false);
        return;
      }
      const eventosConvertidos = converterTarefasParaEventos(data);
      setEventos(eventosConvertidos);
      setEventosFiltrados(eventosConvertidos);
      setResponsaveis([...new Set(data.map(t => t.usuNome))]);
      setMensagemVazia('');
    } catch {
      setMensagemVazia('Erro ao carregar tarefas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);


  useEffect(() => {
    if (!responsavelSelecionado) setEventosFiltrados(eventos);
    else setEventosFiltrados(eventos.filter(ev => ev.resource.responsavel === responsavelSelecionado));
  }, [responsavelSelecionado, eventos]);

  useEffect(() => {
    carregarTarefas();
  }, [carregarTarefas]);

  const excluirTarefa = async (tarefaId: string) => {
    try {
      const response = await authFetch(
        `http://localhost:8080/tarefa/apagar/${tarefaId}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        setEventos(evts => evts.filter(ev => ev.id !== tarefaId));
        setEventosFiltrados(evts => evts.filter(ev => ev.id !== tarefaId));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };


  return {
    eventos,
    eventosFiltrados,
    responsaveis,
    responsavelSelecionado,
    setResponsavelSelecionado,
    loading,
    mensagemVazia,
    carregarTarefas,
    excluirTarefa,
    setEventos,
    setEventosFiltrados 
  };
}