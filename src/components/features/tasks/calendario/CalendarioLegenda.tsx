import React from "react";

const CalendarLegenda: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
    <div className="grid grid-cols-4 gap-1 sm:hidden">
      <div className="flex flex-col items-center gap-1">
        <div className="w-2.5 h-2.5 bg-yellow-500 rounded"></div>
        <span className="text-xs text-gray-700 font-medium leading-tight">Pendente</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-2.5 h-2.5 bg-blue-500 rounded"></div>
        <span className="text-xs text-gray-700 font-medium leading-tight">Em Desenv.</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-2.5 h-2.5 bg-green-500 rounded"></div>
        <span className="text-xs text-gray-700 font-medium leading-tight">Concluída</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: '#764B9C' }}></div>
        <span className="text-xs text-gray-700 font-medium leading-tight">Outros</span>
      </div>
    </div>
    <div className="hidden sm:grid grid-cols-2 gap-6 justify-items-center md:grid-cols-4">
      <div className="flex items-center justify-center gap-3">
        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
        <span className="text-sm text-gray-700">Pendente</span>
      </div>
      <div className="flex items-center justify-center gap-3">
        <div className="w-4 h-4 bg-blue-500 rounded"></div>
        <span className="text-sm text-gray-700">Em Desenvolvimento</span>
      </div>
      <div className="flex items-center justify-center gap-3">
        <div className="w-4 h-4 bg-green-500 rounded"></div>
        <span className="text-sm text-gray-700">Concluída</span>
      </div>
      <div className="flex items-center justify-center gap-3">
        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#764B9C' }}></div>
        <span className="text-sm text-gray-700">Outros</span>
      </div>
    </div>
  </div>
);

export default CalendarLegenda;