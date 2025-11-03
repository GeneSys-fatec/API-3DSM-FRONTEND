import React, { useRef, useEffect } from "react";
import { useModal } from "@/context/ModalContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export const ModalPerfil: React.FC = () => {
  const { closeModal } = useModal();
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

  return (
    <div
      ref={modalRef}
      className="fixed right-12 top-12 w-48 flex flex-col items-center justify-center gap-2 py-4 bg-white rounded shadow-md"
    >
      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
        {inicialUsuario}
      </div>
      <div className="text-lg font-medium text-gray-800">
        {nome || "Nome do Usuário"}
      </div>
      <button
        onClick={() => {
          closeModal();
          deslogarUsuario(navigate);
        }}
        className="w-full text-indigo-600 hover:text-indigo-800 font-semibold rounded cursor-pointer mt-2"
      >
        Deslogar
      </button>
    </div>
  );
};
