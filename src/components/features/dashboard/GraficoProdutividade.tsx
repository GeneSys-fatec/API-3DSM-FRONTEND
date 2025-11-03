import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function GraficoProdutividade({ dados, isCompact }: any) {

  const { usuarios, dadosMensais } = dados;

  const colors = ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#fb923c", "#38bdf8", "#f472b6"];

  if (!usuarios || usuarios.length === 0) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-md h-[300px] flex items-center justify-center">

        <p className="text-gray-500">Sem dados de produtividade nos últimos 6 meses.</p> </div>
    );
  }

  return (<div className="bg-white p-4 rounded-2xl shadow-md">
    <h2 className="text-lg font-semibold mb-3 text-gray-800">Produtividade (Últimos 6 Meses)</h2>

    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={dadosMensais}
        margin={{
          bottom: isCompact ? 30 : 30, // Aumentado de 40 para 80
          left: isCompact ?-20 : -15, // Puxa o gráfico pra esquerda
          right: 10 // Dá um respiro na direita
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="mes"
          interval={0}
          height={isCompact ? 50 : 20} 
          tick={{ fontSize: isCompact ? 10 : 12 }}
          angle={isCompact ? -90 : 0}
          textAnchor={isCompact ? 'end' : 'middle'}
          dy={isCompact ? 5 : 0}
        />
        <YAxis domain={[0, 100]} />
        <Tooltip formatter={(value: any) => `${value}%`} />

        <Legend
          verticalAlign="bottom"
          wrapperStyle={{
            fontSize: isCompact ? '12px' : '14px',
            left: isCompact ?-0 : -15, 
          }}
        />
        {usuarios.map((usuario: string, index: number) => (
          <Bar
            key={usuario}
            dataKey={usuario} name={usuario} fill={colors[index % colors.length]} />
        ))} </BarChart>
    </ResponsiveContainer>
  </div>
  );
}