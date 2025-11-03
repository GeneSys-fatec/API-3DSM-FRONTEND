import { 
  ResponsiveContainer, 
  LineChart, Line, 
  BarChart, Bar,
  XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from "recharts";
import CompactLegend from "../../../utils/dashboardUtils";

export default function GraficoPrazos({ dados, periodo, setPeriodo, isCompact }: any) {
  
  const colors = {
    dentroPrazo: "#34d399",
    foraPrazo: "#f87171",
  };


  const renderChart = () => {
    
    if (dados.length === 1) {
      return (
        <BarChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend content={<CompactLegend isCompact={isCompact} />} />
          <Bar dataKey="dentroPrazo" name="Dentro do prazo" fill={colors.dentroPrazo} />
          <Bar dataKey="foraPrazo" name="Fora do prazo" fill={colors.foraPrazo} />
        </BarChart>
      );
    }


    return (
      <LineChart data={dados}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend content={<CompactLegend isCompact={isCompact} />} />
        <Line type="monotone" dataKey="dentroPrazo" stroke={colors.dentroPrazo} name="Dentro do prazo" strokeWidth={2} />
        <Line type="monotone" dataKey="foraPrazo" stroke={colors.foraPrazo} name="Fora do prazo" strokeWidth={2} />
      </LineChart>
    );
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Cumprimento de Prazos</h2>

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

      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}