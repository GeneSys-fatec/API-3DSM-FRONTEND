import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import NavbarPrincipal from "../components/layout/NavbarPrincipal";
import BarraLateral from "../components/layout/BarraLateral";
import BarraLateralProjetos from "../components/layout/BarraLateralProjetos";
import BottomNavbar from "../components/layout/BottomNavbar";
import ModalProjetos from "../components/features/projects/ModalProjetos";
import NavbarProjetos from "../components/NavbarProjetos";

export default function LayoutPrincipal() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalProjetosOpen, setIsModalProjetosOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  const [targetEquipeId, setTargetEquipeId] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleOpenModal = (equipeId: string) => {
    setTargetEquipeId(equipeId);
    setIsModalProjetosOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalProjetosOpen(false);
    setTargetEquipeId(null);
  };

  const isEquipesPage = location.pathname.startsWith("/equipes");
  const isCalendarioPage = location.pathname.startsWith("/calendario");

  return (
    <div className="bg-slate-50 h-screen flex flex-col">
      <NavbarPrincipal onToggleSidebar={toggleSidebar} navigate={navigate} />

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:flex">
          {" "}
          <BarraLateral />
          {!isEquipesPage && (
            <BarraLateralProjetos
              isOpen={isSidebarOpen}
              onClose={toggleSidebar}
              onOpenModal={handleOpenModal}
              onProjectSelect={setSelectedProjectId}
            />
          )}
        </div>

        <div className="lg:hidden">
          {!isEquipesPage && (
            <BarraLateralProjetos
              isOpen={isSidebarOpen}
              onClose={toggleSidebar}
              onOpenModal={handleOpenModal}
              onProjectSelect={setSelectedProjectId}
            />
          )}
        </div>

        {!isEquipesPage && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={toggleSidebar}
          ></div>
        )}

        <main className="p-2 md:p-4 flex-1 flex flex-col min-w-0 h-full">
          {!isEquipesPage && !isCalendarioPage && <NavbarProjetos />}
          <Outlet context={{ selectedProjectId }} />
        </main>
      </div>

      {!isEquipesPage && (
        <ModalProjetos
          isOpen={isModalProjetosOpen}
          onClose={handleCloseModal}
          equipeId={targetEquipeId}
        />
      )}
      {!isEquipesPage && <BottomNavbar />}
    </div>
  );
}
