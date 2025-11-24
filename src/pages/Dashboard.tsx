import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { authFetch } from "../utils/api";

import GraficoPrazos from "../components/features/dashboard/GraficoPrazos";
import GraficoTarefas from "../components/features/dashboard/GraficoTarefas";
import GraficoProdutividade from "../components/features/dashboard/GraficoProdutividade";


function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function filtrarTarefasPorPeriodo(
  tarefas: any[],
  periodo: "semanal" | "mensal"
) {
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

  return dadosTransformados.filter((u) => u.tarefasConcluidasFiltradas > 0);
}

export default function Dashboard() {
  const { selectedProjectId } = useOutletContext<{
    selectedProjectId: string | null;
  }>();

  const [tarefasData, setTarefasData] = useState<any[]>([]);
  const [produtividadeData, setProdutividadeData] = useState<any>({
    usuarios: [],
    dadosMensais: [],
  });
  const [prazosPorMembroData, setPrazosPorMembroData] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [isCompact, setIsCompact] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [periodoPrazos, setPeriodoPrazos] = useState<"semanal" | "mensal">(
    "semanal"
  );
  const [periodoTarefas, setPeriodoTarefas] = useState<"semanal" | "mensal">(
    "semanal"
  );

  useEffect(() => {
    if (!selectedProjectId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setDashboardError(null);

        const [tarefasRes, produtividadeRes, prazosPorMembroRes] =
          await Promise.all([
            authFetch(
              `http://localhost:8000/dashboard/tarefas-concluidas/${selectedProjectId}`
            ), //
            authFetch(
              `http://localhost:8000/dashboard/produtividade/${selectedProjectId}`
            ), //
            authFetch(
              `http://localhost:8000/dashboard/prazos/${selectedProjectId}`
            ),
          ]);

        const responses = [tarefasRes, produtividadeRes, prazosPorMembroRes];
        const failedResponse = responses.find((res) => !res.ok);

        if (failedResponse) {
          const erroJson = await failedResponse.json();
          setDashboardError(
            erroJson.mensagem || "Erro ao carregar dados do dashboard."
          );
          return;
        }

        const tarefasJson = await tarefasRes.json();
        const produtividadeJson = await produtividadeRes.json();
        const prazosPorMembroJson = await prazosPorMembroRes.json();

        setTarefasData(tarefasJson);
        setProdutividadeData(produtividadeJson);
        setPrazosPorMembroData(prazosPorMembroJson);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        setDashboardError("Erro ao carregar dados do dashboard.");
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

  const tarefasFiltradas = filtrarTarefasPorPeriodo(
    tarefasData,
    periodoTarefas
  );

  return (
    <div className="flex flex-col gap-6 p-6 pb-20 w-full bg-slate-50 overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoPrazos
          dados={prazosPorMembroData}
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

      <GraficoProdutividade dados={produtividadeData} isCompact={isCompact} />
    </div>
  );
}
