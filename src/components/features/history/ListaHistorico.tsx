

import { useEffect, useState } from "react";
import ItemHistoricoTarefa from "./ItemHistoricoTarefa";
import { getErrorMessage } from "@/utils/errorUtils";
import { useParams } from "react-router-dom"; 

type AcaoHistorico = "Add" | "Update" | "Delete" | "Create";

interface Editor {
  usuId: string;
  usuEmail: string;
  usuNome: string;
}

interface Alteracao {
  altId: string;
  altAcao: AcaoHistorico;
  altTipo: string;
  altEditor: Editor;
  altDataHora: Date;
}

interface HistoricoPorTarefa {
  tarId: string;
  tarNome: string;
  alteracoes: Alteracao[];
}


const mockEditores: Editor[] = [
  { usuId: "1", usuEmail: "exemplo@gmail.com", usuNome: "Usuário Exemplo" },
  { usuId: "2", usuEmail: "maria@gmail.com", usuNome: "Maria Silva" },
  { usuId: "3", usuEmail: "joao@gmail.com", usuNome: "João Souza" },
];

const mockHistorico: HistoricoPorTarefa[] = [
  {
    tarId: "t1",
    tarNome: "Tarefa 1: Desenvolver tela de login",
    alteracoes: [
      { altId: "h1", altAcao: "Update", altTipo: "Responsável", altEditor: mockEditores[0], altDataHora: new Date("2025-10-21T23:17:00") },
      { altId: "h2", altAcao: "Add", altTipo: "Comentário", altEditor: mockEditores[1], altDataHora: new Date("2025-10-21T23:14:00") },
      { altId: "h3", altAcao: "Delete", altTipo: "Anexo", altEditor: mockEditores[0], altDataHora: new Date("2025-10-21T23:14:00") },
    ],
  },
  {
    tarId: "t2",
    tarNome: "Tarefa 2: Corrigir bug no dashboard",
    alteracoes: [
      { altId: "h4", altAcao: "Create", altTipo: "Tarefa", altEditor: mockEditores[2], altDataHora: new Date("2025-10-20T10:30:00") },
    ],
  },
  {
    tarId: "t3",
    tarNome: "Tarefa 3: Otimizar consulta ao banco de dados",
    alteracoes: [
      { altId: "h5", altAcao: "Update", altTipo: "Prioridade", altEditor: mockEditores[1], altDataHora: new Date("2025-10-19T15:00:00") },
      { altId: "h6", altAcao: "Add", altTipo: "Comentário", altEditor: mockEditores[2], altDataHora: new Date("2025-10-19T14:55:00") },
    ],
  },
];

async function getHistoricoAlteracoes(projetoId: string): Promise<HistoricoPorTarefa[]> {
  console.log("Buscando histórico para o projeto ID:", projetoId); 
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockHistorico);
    }, 500);
  });
}

async function getResponsaveis(projetoId: string): Promise<Editor[]> {
  console.log("Buscando responsáveis para o projeto ID:", projetoId);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockEditores);
    }, 300);
  });
}


export default function ListaHistorico() {
  const [historico, setHistorico] = useState<HistoricoPorTarefa[]>([]);
  const [responsaveis, setResponsaveis] = useState<Editor[]>([]);
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>("todos");
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const { id: projetoId } = useParams<{ id: string }>();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setErro(null);

      if (!projetoId) {
        setErro("ID do projeto não encontrado na URL.");
        setIsLoading(false);
        return;
      }

      try {
        const [dataHistorico, dataResponsaveis] = await Promise.all([
          getHistoricoAlteracoes(projetoId),
          getResponsaveis(projetoId),
        ]);
        
        setHistorico(dataHistorico);
        setResponsaveis(dataResponsaveis);
      } catch (error: unknown) {
        console.error(error);
        setErro(getErrorMessage(error, "Um erro inesperado ocorreu ao buscar o histórico."));
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [projetoId]); 

  const historicoFiltrado = historico
    .map(tarefa => {
      if (filtroResponsavel === "todos") {
        return tarefa;
      }
      const alteracoesFiltradas = tarefa.alteracoes.filter(
        alt => alt.altEditor.usuId === filtroResponsavel
      );
      return { ...tarefa, alteracoes: alteracoesFiltradas };
    })
    .filter(tarefa => tarefa.alteracoes.length > 0);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full bg-gray-50">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-indigo-600"></i>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex flex-col justify-center items-center h-full bg-gray-50 text-center p-4">
        <i className="fa-solid fa-circle-exclamation text-5xl text-red-500 mb-4"></i>
        <h2 className="text-xl font-bold text-slate-700">Ocorreu um Erro</h2>
        <p className="text-slate-500 mt-1">{erro}</p>
      </div>
    );
  }

  if (historico.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-full bg-gray-50 text-center p-4">
        <i className="fa-solid fa-history text-5xl text-slate-300 mb-4"></i>
        <h2 className="text-xl font-bold text-slate-600">
          Nenhum histórico de alterações
        </h2>
        <p className="text-slate-500 mt-1 pb-2">
          As alterações nas tarefas aparecerão aqui assim que forem feitas.
        </p>
      </div>
    );
  }


  return (
    <div className="p-4 md:p-8">
      <div>
        
        <div className="flex flex-col gap-4 pb-6 px-1">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Histórico de Alterações
            </h1>
            <p className="text-gray-500 mt-1">
              Veja todas as mudanças feitas nas tarefas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label 
              htmlFor="filtro-responsavel" 
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <i className="fa-solid fa-user text-gray-500"></i>
              Responsável:
            </label>
            <select
              id="filtro-responsavel"
              value={filtroResponsavel}
              onChange={(e) => setFiltroResponsavel(e.target.value)}
              className="block w-auto min-w-[200px] pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
            >
              <option value="todos">Todos</option>
              {responsaveis.map(resp => (
                <option key={resp.usuId} value={resp.usuId}>
                  {resp.usuNome} ({resp.usuEmail})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-4 pb-6">
          {historicoFiltrado.length > 0 ? (
            historicoFiltrado.map((item, index) => (
              <ItemHistoricoTarefa
                key={item.tarId}
                tarefaNome={item.tarNome}
                alteracoes={item.alteracoes}
                abertoPorPadrao={index === 0}
              />
            ))
          ) : (
            <div className="text-center bg-white p-10 rounded-lg shadow-sm">
              <i className="fa-solid fa-filter-circle-xmark text-4xl text-slate-300 mb-3"></i>
              <p className="text-slate-600 font-medium">Nenhum histórico encontrado para este responsável.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}