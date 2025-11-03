import { useState } from "react";

import { NavLink } from "react-router-dom";

export default function NavbarProjetos() {
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link-responsive relative pb-1 text-gray-700 whitespace-nowrap after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-blue-600 after:w-full after:scale-x-0 after:transition-transform after:duration-300 after:ease-in-out ${
      isActive
        ? "after:scale-x-100 font-semibold text-blue-600"
        : "hover:after:scale-x-100"
    }`;

  return (
    <>
        <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media (max-width: 370px) {
        .nav-link-responsive {
        font-size: 0.8rem; /* Tamanho da fonte ligeiramente menor que 'text-sm' */
        }
        .nav-links-container {
        gap: 0.75rem; /* Diminui o espaçamento entre os links */
        }
        }
      `}</style>

        <div className="flex flex-wrap h-auto min-h-14 w-full rounded-lg shadow-md border border-gray-200 p-4 justify-between items-center bg-white gap-y-4">
          <nav className="flex gap-4 sm:gap-8 flex-wrap items-center">
            <NavLink to="/home" className={getNavLinkClass}>
              Visão Geral
            </NavLink>
            <NavLink to="/tarefas" className={getNavLinkClass}>
              Tarefas
            </NavLink>
            <NavLink to="/dashboard" className={getNavLinkClass}>
              Estatísticas
            </NavLink>
          </nav>
          <div className="flex justify-end items-center gap-2">
            <div className="relative hidden md:block">
              <i className="fa-solid fa-magnifying-glass absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Busque uma tarefa..."
                className="bg-gray-50 pl-10 pr-3 py-2 border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 rounded-3xl w-full max-w-xs h-10 transition-shadow"
              />
            </div>
            <button
              onClick={() => setIsSearchVisible(!isSearchVisible)}
              className="md:hidden p-2 h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="Buscar tarefa"
            >
              <i className="fa-solid fa-magnifying-glass text-gray-600"></i>
            </button>
            {/* <button
              className="p-2 h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="Filtrar e ordenar tarefas"
            >
              <i className="fa-solid fa-arrow-down-wide-short text-gray-600"></i>
            </button> */}
          </div>
          {isSearchVisible && (
            <div className="relative w-full md:hidden animate-fade-in">
              <i className="fa-solid fa-magnifying-glass absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Busque uma tarefa..."
                className="bg-gray-50 pl-10 pr-3 py-2 border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 rounded-3xl w-full h-10"
                autoFocus
              />
            </div>
          )}
        </div>
    </>
  );
}
