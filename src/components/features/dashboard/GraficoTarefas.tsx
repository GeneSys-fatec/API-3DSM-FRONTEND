import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import CompactLegend from "../../../utils/dashboardUtils";

export default function GraficoTarefas({ dados, periodo, setPeriodo, isCompact }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-md">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Tarefas Concluídas</h2>

        <div className="inline-flex rounded-md shadow-sm bg-gray-100 p-1">
          <button
            onClick={() => setPeriodo("semanal")}
            className={`px-3 py-1 text-sm rounded ${periodo === "semanal" ? "bg-white font-semibold" : "text-gray-600"}`}
          >
            Semanal
          </button>
          <button
            onClick={() => setPeriodo("mensal")}
            className={`px-3 py-1 text-sm rounded ${periodo === "mensal" ? "bg-white font-semibold" : "text-gray-600"}`}
          >
            Mensal
          </button>
        </div>
      </div>

      {dados && dados.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dados} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="nome" type="category" width={120} />
            <Tooltip />
            <Legend content={<CompactLegend isCompact={isCompact} />} />
            <Bar dataKey="concluidas" fill="#34d399" name="Concluídas" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div
          className="flex justify-center items-center text-center text-gray-500"
          style={{ height: 300 }}>
          <p>Nenhuma tarefa foi concluída neste período.</p>
        </div>
      )}
    </div>
  );
}