import React, { useRef, useEffect } from "react";
import { useModal } from "@/context/ModalContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ModalEditarPerfil } from "./ModalEditarPerfil";

export const ModalPerfil: React.FC = () => {
  const { openModal, closeModal } = useModal();
  const modalRef = useRef<HTMLDivElement>(null);

  const { usuNome: nome, deslogarUsuario } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeModal]);

  const inicialUsuario = nome?.charAt(0)?.toUpperCase() || "?";

  const handleAbrirEditarPerfil = () => {
    closeModal();
    openModal(<ModalEditarPerfil />);
  };

  return (
    <div ref={modalRef}
      className="fixed right-12 top-12 w-full max-w-2xs flex flex-col items-center justify-center gap-2 py-4 bg-white rounded shadow-md">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
          {inicialUsuario}
        </div>
        <div className="text-lg font-semibold text-gray-800">
          {nome || "Nome do UsuÃ¡rio"}
        </div>
      </div>
      <div className="flex flex-col gap-3 pt-4 pb-2">
        <button
          onClick={handleAbrirEditarPerfil}
          className="hover:text-indigo-800 font-semibold rounded cursor-pointer mt-2 flex items-center gap-2">
          <i className="fa-solid fa-user"></i>
          Personalizar perfil
        </button>
        <button className="hover:text-indigo-800 font-semibold rounded cursor-pointer mt-2 flex items-center gap-2">
          <i className="fa-solid fa-moon"></i>
          Alternar modo
        </button>
        <button
          onClick={() => { closeModal(); deslogarUsuario(navigate) }}
          className="hover:text-indigo-800 font-semibold rounded cursor-pointer mt-2 flex items-center gap-2">
          <i className="fa-solid fa-right-from-bracket"></i>
          Sair
        </button>
      </div>
    </div>
  );
};
