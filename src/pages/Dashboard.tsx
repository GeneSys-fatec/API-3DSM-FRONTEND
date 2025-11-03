import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { authFetch } from "../utils/api";

import GraficoPrazos from "../components/features/dashboard/GraficoPrazos";
import GraficoTarefas from "../components/features/dashboard/GraficoTarefas";
import GraficoProdutividade from "../components/features/dashboard/GraficoProdutividade";


function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function filtrarTarefasPorPeriodo(tarefas: any[], periodo: "semanal" | "mensal") {

  const agora = new Date();

  const dadosTransformados = tarefas.map((usuario) => {
    if (!usuario.datasConclusao || usuario.datasConclusao.length === 0) {
      return { ...usuario, tarefasConcluidasFiltradas: 0 };
    }

    const datasFiltradas = usuario.datasConclusao.filter((dataObj: any) => {
      const dataConclusao = parseLocalDate(dataObj.data);

      if (periodo === "semanal") {
        const seteDiasAtras = new Date();
        seteDiasAtras.setDate(agora.getDate() - 7);
        seteDiasAtras.setHours(0, 0, 0, 0);
        return dataConclusao >= seteDiasAtras && dataConclusao <= agora;
      }

      if (periodo === "mensal") {
        return (
          dataConclusao.getMonth() === agora.getMonth() &&
          dataConclusao.getFullYear() === agora.getFullYear()
        );
      }
      return false;
    });

    return {
      ...usuario,
      tarefasConcluidasFiltradas: datasFiltradas.length,
    };
  });

  return dadosTransformados.filter(u => u.tarefasConcluidasFiltradas > 0);
}

function processarDadosPrazos(tarefasData: any[], periodo: "semanal" | "mensal") {
  const agora = new Date();

  const todasAsTarefas: { data: Date; noPrazo: boolean; id: string }[] = [];
  tarefasData.forEach(usuario => {
    if (usuario.datasConclusao) {
      usuario.datasConclusao.forEach((tarefa: { data: string; noPrazo: boolean; id: string }) => {
        todasAsTarefas.push({
          data: parseLocalDate(tarefa.data),
          noPrazo: tarefa.noPrazo,
          id: tarefa.id,
        });
      });
    }
  });

  if (periodo === "semanal") {
    const dadosSemanais: any[] = [];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const dataPonto = new Date(hoje);
      dataPonto.setDate(hoje.getDate() - i);
      const diaFormatado = dataPonto.toLocaleDateString('pt-BR', { day: 'numeric', month: 'numeric' });

      dadosSemanais.push({
        label: diaFormatado,
        dentroPrazo: 0,
        foraPrazo: 0,
        dataRef: new Date(dataPonto),
        tarefasContadas: new Set<string>()
      });
    }

    todasAsTarefas.forEach(tarefa => {
      const dataTarefaStr = tarefa.data.toDateString();
      const ponto = dadosSemanais.find(p => p.dataRef.toDateString() === dataTarefaStr);

      if (ponto && !ponto.tarefasContadas.has(tarefa.id)) {
        if (tarefa.noPrazo) {
          ponto.dentroPrazo++;
        } else {
          ponto.foraPrazo++;
        }
        ponto.tarefasContadas.add(tarefa.id);
      }
    });

    return dadosSemanais.map(p => ({ label: p.label, dentroPrazo: p.dentroPrazo, foraPrazo: p.foraPrazo }));
  }

  if (periodo === "mensal") {
    const dadosMensais: {
      [week: string]: {
        label: string;
        dentroPrazo: number;
        foraPrazo: number;
        tarefasContadas: Set<string>;
      }
    } = {
      "Semana 1": { label: "Semana 1", dentroPrazo: 0, foraPrazo: 0, tarefasContadas: new Set<string>() },
      "Semana 2": { label: "Semana 2", dentroPrazo: 0, foraPrazo: 0, tarefasContadas: new Set<string>() },
      "Semana 3": { label: "Semana 3", dentroPrazo: 0, foraPrazo: 0, tarefasContadas: new Set<string>() },
      "Semana 4": { label: "Semana 4", dentroPrazo: 0, foraPrazo: 0, tarefasContadas: new Set<string>() },
      "Semana 5": { label: "Semana 5", dentroPrazo: 0, foraPrazo: 0, tarefasContadas: new Set<string>() },
    };

    todasAsTarefas.forEach(tarefa => {
      if (tarefa.data.getMonth() === agora.getMonth() && tarefa.data.getFullYear() === agora.getFullYear()) {
        const diaDoMes = tarefa.data.getDate();
        const semana = Math.ceil(diaDoMes / 7);
        const key = `Semana ${semana}`;
        const pontoSemana = dadosMensais[key];

        if (pontoSemana && !pontoSemana.tarefasContadas.has(tarefa.id)) {
          if (tarefa.noPrazo) {
            pontoSemana.dentroPrazo++;
          } else {
            pontoSemana.foraPrazo++;
          }
          pontoSemana.tarefasContadas.add(tarefa.id);
        }
      }
    });

    return Object.values(dadosMensais)
      .filter(s => s.dentroPrazo > 0 || s.foraPrazo > 0)
      .map(s => ({ label: s.label, dentroPrazo: s.dentroPrazo, foraPrazo: s.foraPrazo }));
  }

  return [];
}


export default function Dashboard() {
  const { selectedProjectId } = useOutletContext<{ selectedProjectId: string | null }>();

  const [tarefasData, setTarefasData] = useState<any[]>([]);
  const [produtividadeData, setProdutividadeData] = useState<any>({ usuarios: [], dadosMensais: [] });
  const [loading, setLoading] = useState(true);
  const [isCompact, setIsCompact] = useState(false);


  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [periodoPrazos, setPeriodoPrazos] = useState<"semanal" | "mensal">("semanal");
  const [periodoTarefas, setPeriodoTarefas] = useState<"semanal" | "mensal">("semanal");

  useEffect(() => {
    if (!selectedProjectId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setDashboardError(null);

        const tarefasRes = await authFetch(`http://localhost:8080/dashboard/tarefas-concluidas/${selectedProjectId}`);
        const produtividadeRes = await authFetch(`http://localhost:8080/dashboard/produtividade/${selectedProjectId}`);


        if (!tarefasRes.ok || !produtividadeRes.ok) {
          const erroRes = !tarefasRes.ok ? tarefasRes : produtividadeRes;
          const erroJson = await erroRes.json();


          setDashboardError(erroJson.mensagem || "Erro ao carregar dados do dashboard.");
          return;
        }

        const tarefasJson = await tarefasRes.json();
        const produtividadeJson = await produtividadeRes.json();

        setTarefasData(tarefasJson);
        setProdutividadeData(produtividadeJson);

      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        setDashboardError("Não foi possível conectar ao servidor. Tente novamente.");

      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedProjectId]);

  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">Carregando dados do dashboard...</p>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-4 p-6 text-center">
        <p className="text-gray-500">{dashboardError}</p>
      </div>
    );
  }


  const tarefasFiltradas = filtrarTarefasPorPeriodo(tarefasData, periodoTarefas);
  const prazosProcessados = processarDadosPrazos(tarefasData, periodoPrazos);

  return (
    <div className="flex flex-col gap-6 p-6 pb-20 w-full bg-slate-50 overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoPrazos
          dados={prazosProcessados}
          periodo={periodoPrazos}
          setPeriodo={setPeriodoPrazos}
          isCompact={isCompact}
        />
        <GraficoTarefas
          dados={tarefasFiltradas.map((item: any) => ({
            nome: item.usuNome || "Membro",
            concluidas: item.tarefasConcluidasFiltradas || 0,
          }))}
          periodo={periodoTarefas}
          setPeriodo={setPeriodoTarefas}
          isCompact={isCompact}
        />
      </div>

      <GraficoProdutividade
        dados={produtividadeData}
        isCompact={isCompact}
      />
    </div>
  );
}