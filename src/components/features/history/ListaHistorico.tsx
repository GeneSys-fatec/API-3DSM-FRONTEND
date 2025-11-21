import { useEffect, useState } from "react";
import ItemHistoricoTarefa from "./ItemHistoricoTarefa";
import { getErrorMessage } from "@/utils/errorUtils";
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
  altDataHoraRaw?: { data: string; hora: string }; 
}

interface HistoricoPorTarefa {
  tarId: string;
  tarNome: string;
  alteracoes: Alteracao[];
}

interface ProjetoDTO {
  projId: string;
  projNome: string;
}

type CategoriaModificacao = "CRIACAO" | "EDICAO" | "EXCLUSAO";

type AuditoriaResponseDto = any;


export default function ListaHistorico() {
  const [historico, setHistorico] = useState<HistoricoPorTarefa[]>([]);
  const [responsaveis, setResponsaveis] = useState<Editor[]>([]);
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>("todos");
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

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

  async function fetchTaskNames(ids: string[]): Promise<Record<string,string>> {
    const map: Record<string,string> = {};
    await Promise.all(ids.map(async id => {
      try {
        const res = await authFetch(`/tarefa/${id}`, { method: "GET" , headers: { "X-Audit-Skip": "1" }});
        if (!res.ok) return;
        const json = await res.json();
        map[id] = json.titulo || json.nome || json.tarefaNome || String(id);
      } catch {
      }
    }));
    return map;
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

  function mapAuditoriaParaHistorico(data: AuditoriaResponseDto[], nameMap: Record<string,string> = {}): {
    historico: HistoricoPorTarefa[];
    responsaveis: Editor[];
  } {
    const byTask = new Map<string, HistoricoPorTarefa>();
    const responsaveisMap = new Map<string, Editor>();

    for (const ev of data) {
      const modificacaoTxt = String(ev.modificacao?.modificacao ?? '');
      if (/Requisição\s+GET/i.test(modificacaoTxt)) continue;
      const rawTarId = ev.tarefaId ?? ev.modificacao?.tarefaId ?? null;
      const rawTarNome = ev.tarefaNome ?? ev.modificacao?.tarefaNome ?? null;
      
      if (!rawTarId && !rawTarNome) continue;

      const tarId = rawTarId ? String(rawTarId) : `nome:${String(rawTarNome)}`;
      const tarNome = String(rawTarNome ?? nameMap[String(rawTarId)] ?? `Tarefa ${tarId}`);

      const usuId = String(ev.responsavel?.id ?? "desconhecido");
      const usuEmail = String(ev.responsavel?.email ?? ev.responsavel?.emailResponsavel ?? "sem-email");
      const usuNome = String(ev.responsavel?.nome ?? (usuEmail.includes("@") ? usuEmail.split("@")[0] : `Usuário ${usuId}`));

      const editor: Editor = { usuId, usuEmail, usuNome };
      responsaveisMap.set(usuId, editor);

      const categoria = ev.categoria ?? "EDICAO";
      const tipo = ev.modificacao?.mensagem ?? "Modificação";

      const alt: Alteracao = {
        altId: ev.traceId ?? `${tarId}-${Math.random().toString(36).slice(2)}`,
        altAcao: mapCategoriaToAcao(categoria),
        altTipo: tipo,
        altEditor: editor,
        altDataHora: new Date(),
        altDataHoraRaw: { data: ev.dataAlteracao ?? "", hora: ev.horaAlteracao ?? "" }
      };

      if (!byTask.has(tarId)) {
        byTask.set(tarId, { tarId, tarNome, alteracoes: [alt] });
      } else {
        byTask.get(tarId)!.alteracoes.push(alt);
      }
    }

    const historico = Array.from(byTask.values())
      .map(item => ({
        ...item,
        alteracoes: item.alteracoes.sort((a,b) => {
          const ta = a.altDataHora instanceof Date ? a.altDataHora.getTime() : 0;
          const tb = b.altDataHora instanceof Date ? b.altDataHora.getTime() : 0;
          return tb - ta;
        })
      }))
      .sort((a,b) => {
          const ta = a.alteracoes[0]?.altDataHora instanceof Date ? a.alteracoes[0].altDataHora.getTime() : 0;
          const tb = b.alteracoes[0]?.altDataHora instanceof Date ? b.alteracoes[0].altDataHora.getTime() : 0;
          return tb - ta;
      });

    return { historico, responsaveis: Array.from(responsaveisMap.values()) };
}

  useEffect(() => {
    async function carregar() {
      setIsLoading(true);
      setErro(null);

      try {
        const projetos = await fetchProjetosDoUsuario();
        if (projetos.length === 0) {
          setHistorico([]);
          setResponsaveis([]);
          return;
        }
        const eventosList = await Promise.all(projetos.map(p => fetchAuditoriaPorProjeto(p.projId)));
        const eventos = eventosList.flat();
        const idsParaBuscar = Array.from(new Set(
          eventos
            .map(ev => ev.tarefaId ?? ev.modificacao?.tarefaId ?? null)
            .filter(Boolean)
        )) as string[];
        const nameMap = idsParaBuscar.length ? await fetchTaskNames(idsParaBuscar) : {};
        const { historico, responsaveis } = mapAuditoriaParaHistorico(eventos, nameMap);
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
    const onFocus = () => carregar();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

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
    <div className="p-4 md:p-8 overflow-y-auto">
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