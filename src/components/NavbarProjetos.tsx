import { useState } from "react";

import { NavLink, useLocation } from "react-router-dom";
import SearchBar from "./common/SearchBar";

export default function NavbarProjetos() {
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const location = useLocation();
  const isTarefasPath = location.pathname.startsWith("/tarefas");

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

        <div className="w-full rounded-lg shadow-md border border-gray-200 bg-white">
          <div className="flex flex-wrap h-auto min-h-[82px] p-4 justify-between items-center gap-y-4">
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
              {/* Desktop search bar */}
              {isTarefasPath && <SearchBar variant="desktop" />}

              {/* Mobile search toggle button */}
              {isTarefasPath && (
                <button
                  onClick={() => setIsSearchVisible(!isSearchVisible)}
                  className="md:hidden p-2 h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  aria-label="Buscar tarefa"
                >
                  <i className="fa-solid fa-magnifying-glass text-gray-600"></i>
                </button>
              )}
              {/* <button
                className="p-2 h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                aria-label="Filtrar e ordenar tarefas"
              >
                <i className="fa-solid fa-arrow-down-wide-short text-gray-600"></i>
              </button> */}
            </div>
          </div>
          {/* Mobile Search Bar - Now controlled by SearchBar component */}
          {isTarefasPath && <SearchBar variant="mobile" isSearchVisible={isSearchVisible} />}
        </div>
    </>
  );
}
