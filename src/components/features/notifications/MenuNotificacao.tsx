import React from "react";
import { Notificacao } from "@/types/types";
import { deletarNotificacao } from "./notificacaoService";

export interface MenuNotificacaoProps {
    notificacao: Notificacao;
    onClose: () => void;
    onDelete: (id: string) => void;
}

const MenuNotificacao: React.FC<MenuNotificacaoProps> = ({ notificacao, onClose, onDelete }) => {
    const handleApagar = async () => {
        try {
            await deletarNotificacao(notificacao.id); 
            onDelete(notificacao.id); 
            onClose();
        } catch (err) {
            console.error(err);
        }
    };


    const handleVerDetalhes = () => {
        console.log("Ver detalhes da tarefa", notificacao.tarNome);
        onClose();
    };

    return (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white shadow-lg rounded border border-gray-200 z-50">
            <button
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                onClick={handleApagar}
            >
                Apagar
            </button>
            <button
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                onClick={handleVerDetalhes}
            >
                Ver detalhes
            </button>
        </div>
    );
};

export default MenuNotificacao;