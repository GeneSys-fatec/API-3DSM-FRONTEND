import React, { useState, useEffect, useContext } from "react";
import "@/styles/Navbar.css";
import { ModalPerfil } from "../features/profile/ModalPerfil";
import { ModalContext } from "@/context/ModalContext"; 
import ModalNotificacoes from "../features/notifications/ModalNotificacoes";
import { buscarNotificacoesNaoLidas, marcarTodasComoLidas } from "../features/notifications/notificacaoService";

interface NavbarPrincipalProps {
  onToggleSidebar: () => void;
}

const NavbarPrincipal: React.FC<NavbarPrincipalProps> = ({ onToggleSidebar }) => {

  const modalContextValue = useContext(ModalContext);

  if (!modalContextValue) {
    return null;
  }

  const { isModalOpen, openModal, closeModal } = modalContextValue;

  const [temNaoLidas, setTemNaoLidas] = useState(false);

  const verificarNotificacoesNaoLidas = async () => {
    try {
      const result = await buscarNotificacoesNaoLidas();
      setTemNaoLidas(result);
    } catch (err) {
      console.error("Erro ao verificar notificações não lidas", err);
    }
  };

  useEffect(() => {
    verificarNotificacoesNaoLidas();

    const intervaloNotificacoes = setInterval(() => {
      verificarNotificacoesNaoLidas();
    }, 5000);

    return () => {
      clearInterval(intervaloNotificacoes);
    };
  }, []);

  const abrirModalPerfil = () => {
    if (isModalOpen) {
      closeModal();
    } else {
      openModal(<ModalPerfil />);
    }
  };

  const abrirModalNotificacoes = async () => {
    if (isModalOpen) {
      closeModal();
    } else {
      await marcarTodasComoLidas();
      setTemNaoLidas(false);

      openModal(
        <ModalNotificacoes
          isOpen={true}
          onClose={() => {
            closeModal();
            verificarNotificacoesNaoLidas();
          }}
        />
      );
    }
  };

  return (
    <div className="flex justify-between items-center bg-indigo-950 shadow-md h-17 p-5">
      <div className="flex items-center gap-4">
        <i
          className="fa-solid fa-bars text-2xl text-white cursor-pointer lg:hidden hamburguer"
          onClick={onToggleSidebar}
        ></i>
        <p className="logo text-4xl text-white">GSW</p>
      </div>
      <div className="flex gap-10">
        <button className="" onClick={abrirModalNotificacoes}>
          <div className="relative">
            <i className="fa-solid fa-bell text-2xl text-white cursor-pointer hover:text-indigo-200"></i>
            {temNaoLidas && (
              <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
            )}
          </div>
        </button>
        <button className="" onClick={abrirModalPerfil}>
          <i className="fa-solid fa-user text-2xl text-white cursor-pointer hover:text-indigo-200"></i>
        </button>
      </div>
    </div>
  );
}

export default NavbarPrincipal;
