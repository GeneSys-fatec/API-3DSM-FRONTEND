import { useEffect, useState } from "react";
import ItemHistoricoTarefa from "./ItemHistoricoTarefa";
import { getErrorMessage } from "@/utils/errorUtils";
import { useParams } from "react-router-dom";
import { authFetch } from "@/utils/api";

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

// Interface exata do ProjetoDTO baseada no seu JSON e Controller
interface ProjetoDTO {
  projId: string;
  projNome: string;
  projDescricao?: string;
  equId?: string;
}

type CategoriaModificacao = "CRIACAO" | "EDICAO" | "EXCLUSAO";

interface AuditoriaResponseDto {
  projetoId: string;
  tarefaId: string;
  responsavel: { id: string; emailResponsavel: string };
  modificacao: { categoria: CategoriaModificacao; modificacao: string };
  dataAlteracao?: string;
  horaAlteracao?: string;
  traceId?: string;
}

function mapCategoriaToAcao(c: CategoriaModificacao): AcaoHistorico {
  switch (c) {
    case "CRIACAO":
      return "Create";
    case "EXCLUSAO":
      return "Delete";
    case "EDICAO":
    default:
      return "Update";
  }
}

function parseDateTime(date?: string, time?: string): Date {
  if (date && time) return new Date(`${date}T${time}`);
  if (date) return new Date(date);
  return new Date();
}

async function fetchAuditoriaPorProjeto(projetoId: string): Promise<AuditoriaResponseDto[]> {
  try {
    const url = `/auditoria/logs/projeto/${encodeURIComponent(projetoId)}`;
    const res = await authFetch(url, { headers: { "X-Audit-Skip": "1" } });
    if (!res.ok) {
      console.debug(`[Auditoria] ${res.status} ao buscar ${url}`);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? (data as AuditoriaResponseDto[]) : [];
  } catch (e) {
    console.debug("[Auditoria] erro ao buscar logs por projeto:", e);
    return [];
  }
}

async function fetchProjetosDoUsuario(): Promise<ProjetoDTO[]> {
  try {
    // Chama a rota definida no BuscaProjetoController
    const res = await authFetch("/projeto/meus-projetos");
    
    if (!res.ok) {
      console.error("Erro ao buscar projetos do usuário:", res.statusText);
      return [];
    }

    const dados = await res.json();
    return dados as ProjetoDTO[];
  } catch (error) {
    console.error("Erro na requisição de projetos:", error);
    return [];
  }
}

function mapAuditoriaParaHistorico(data: AuditoriaResponseDto[]): {
  historico: HistoricoPorTarefa[];
  responsaveis: Editor[];
} {
  const byTask = new Map<string, HistoricoPorTarefa>();
  const responsaveisMap = new Map<string, Editor>();

  for (const ev of data) {
    const tarId = String(ev.tarefaId ?? "sem-id");
    const tarNome = `Tarefa ${tarId}`; // Se o backend de auditoria não mandar o nome, fica genérico
    
    const usuId = String(ev.responsavel?.id ?? "desconhecido");
    const usuEmail = ev.responsavel?.emailResponsavel ?? "sem-email";
    const usuNome = usuEmail.includes("@") ? usuEmail.split("@")[0] : `Usuário ${usuId}`;

    const editor: Editor = { usuId, usuEmail, usuNome };

    if (!responsaveisMap.has(usuId)) responsaveisMap.set(usuId, editor);

    const alt: Alteracao = {
      altId: ev.traceId ?? `${tarId}-${Math.random().toString(36).slice(2)}`,
      altAcao: mapCategoriaToAcao(ev.modificacao?.categoria ?? "EDICAO"),
      altTipo: ev.modificacao?.modificacao ?? "Modificação",
      altEditor: editor,
      altDataHora: parseDateTime(ev.dataAlteracao, ev.horaAlteracao),
    };

    if (!byTask.has(tarId)) {
      byTask.set(tarId, { tarId, tarNome, alteracoes: [alt] });
    } else {
      byTask.get(tarId)!.alteracoes.push(alt);
    }
  }

  // Ordena alterações da mais recente para a mais antiga
  for (const item of byTask.values()) {
    item.alteracoes.sort((a, b) => b.altDataHora.getTime() - a.altDataHora.getTime());
  }

  const mostRecentChangeTime = (task: HistoricoPorTarefa): number =>
    task.alteracoes[0]?.altDataHora.getTime() ?? 0;

  const historico = Array.from(byTask.values()).sort(
    (left, right) => mostRecentChangeTime(right) - mostRecentChangeTime(left)
  );

  return { historico, responsaveis: Array.from(responsaveisMap.values()) };
}

// Lê o projeto ativo definido pela barra lateral
function getActiveProjectId(): string | null {
  try {
    const raw = localStorage.getItem("selectedProject");
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj?.id) return String(obj.id);
      if (obj?.projId) return String(obj.projId);
    }
  } catch {}
  const fallback = localStorage.getItem("selectedProjectId");
  return fallback ? String(fallback) : null;
}

export default function ListaHistorico() {
  const [historico, setHistorico] = useState<HistoricoPorTarefa[]>([]);
  const [responsaveis, setResponsaveis] = useState<Editor[]>([]);
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>("todos");
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Ainda aceita :id pela URL, mas damos prioridade ao projeto ativo da barra lateral
  const { id: projetoIdParam } = useParams<{ id: string }>();

  useEffect(() => {
    async function carregar() {
      setIsLoading(true);
      setErro(null);

      try {
        let eventos: AuditoriaResponseDto[] = [];

        const projetoAtivoId = getActiveProjectId();
        const effectiveProjectId = projetoAtivoId ?? projetoIdParam ?? null;

        if (effectiveProjectId) {
 
          eventos = await fetchAuditoriaPorProjeto(effectiveProjectId);
        } else {
          // Sem projeto ativo: agrega de todos os projetos do usuário
          const projetos = await fetchProjetosDoUsuario();
          if (projetos.length === 0) {
            setHistorico([]);
            setResponsaveis([]);
            setIsLoading(false);
            return;
          }
          const listas = await Promise.all(
            projetos.map((p) => fetchAuditoriaPorProjeto(p.projId))
          );
          eventos = listas.flat();
        }

        const { historico, responsaveis } = mapAuditoriaParaHistorico(eventos);
        setHistorico(historico);
        setResponsaveis(responsaveis);
      } catch (e) {
        console.error(e);
        setErro(getErrorMessage(e, "Erro ao carregar histórico de auditoria."));
      } finally {
        setIsLoading(false);
      }
    }

    carregar();

    // Quando voltar o foco para a aba, revalida o projeto ativo
    const onFocus = () => carregar();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [projetoIdParam]);

  // Lógica de filtragem na UI
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
              Veja todas as mudanças feitas nas tarefas em seus projetos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="filtro-responsavel"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <i className="fa-solid fa-user text-gray-500"></i> Responsável:
            </label>
            <select
              id="filtro-responsavel"
              value={filtroResponsavel}
              onChange={(e) => setFiltroResponsavel(e.target.value)}
              className="block w-auto min-w-[200px] pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
            >
              <option value="todos">Todos</option>
              {responsaveis.map((resp) => (
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
              <p className="text-slate-600 font-medium">
                Nenhum histórico encontrado para este responsável.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}