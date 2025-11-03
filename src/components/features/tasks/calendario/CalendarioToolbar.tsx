import React from "react";

interface CalendarioToolbarProps {
  view: 'month' | 'week';
  setView: (view: 'month' | 'week') => void;
  isGoogleLogged: boolean;
  setShowGoogleModal: (show: boolean) => void;
  responsaveis: string[];
  responsavelSelecionado: string;
  setResponsavelSelecionado: (value: string) => void;
  carregarTarefas: () => void;
}

const CalendarioToolbar: React.FC<CalendarioToolbarProps> = ({
  view,
  setView,
  isGoogleLogged,
  setShowGoogleModal,
  responsaveis,
  responsavelSelecionado,
  setResponsavelSelecionado,
  carregarTarefas
}) => (
  <div className="bg-white p-2">
    <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center lg:gap-4">
      <div className="flex gap-2 justify-center sm:justify-start">
        <button
          onClick={() => setView('month')}
          className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold transition-colors text-sm ${
            view === 'month'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
          }`}
        >
          <i className="fa-solid fa-calendar mr-1 sm:mr-2"></i>
          <span className="hidden xs:inline">Mensal</span>
          <span className="xs:hidden">Mês</span>
        </button>
        <button
          onClick={() => setView('week')}
          className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold transition-colors text-sm ${
            view === 'week'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
          }`}
        >
          <i className="fa-solid fa-calendar-week mr-1 sm:mr-2"></i>
          <span className="hidden xs:inline">Semanal</span>
          <span className="xs:hidden">Sem</span>
        </button>
        {!isGoogleLogged && (
          <button
            onClick={() => setShowGoogleModal(true)}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors shadow ml-2"
          >
            <i className="fa-brands fa-google"></i>
            <span className="hidden xs:inline">Sincronizar Google</span>
            <span className="xs:hidden">Sincronizar Google</span>
          </button>
        )}
      </div>

      <div className="flex gap-2 items-center justify-between sm:gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <label className="text-sm font-medium text-gray-700">
            <i className="fa-solid fa-user mr-1"></i>
            <span className="hidden sm:inline">Responsável:</span>
          </label>
          <select
            value={responsavelSelecionado}
            onChange={(e) => setResponsavelSelecionado(e.target.value)}
            className="flex-1 min-w-0 px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-3 sm:py-2 sm:text-sm sm:rounded-lg"
          >
            <option value="">Todos</option>
            {responsaveis.map((responsavel) => (
              <option key={responsavel} value={responsavel}>
                {responsavel}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={carregarTarefas}
          className="px-2.5 py-1.5 bg-green-100 hover:bg-green-200 active:bg-green-300 text-green-700 rounded-md font-medium transition-colors text-xs whitespace-nowrap sm:px-3 sm:py-2 sm:text-sm sm:rounded-lg"
        >
          <i className="fa-solid fa-refresh mr-1 sm:mr-1"></i>
          <span className="hidden sm:inline">Atualizar</span>
          <span className="sm:hidden">Atualizar</span>
        </button>
      </div>
    </div>
  </div>
);

export default CalendarioToolbar;