import React, { useRef, useEffect } from 'react';
import { AlertTriangle, MessageSquare, ClipboardList, Users, UserMinus, Edit3, MoreVertical } from "lucide-react";
import { Notificacao } from '@/types/types';
import MenuNotificacao from './MenuNotificacao';


const IconeExpirado = () => (
  <div className="p-2 rounded-full bg-red-100 text-red-600">
    <AlertTriangle />
  </div>
);

const IconeComentario = () => (
  <div className="p-2 rounded-full bg-gray-100 text-gray-600">
    <MessageSquare />
  </div>
);

const IconDesignado = () => (
  <div className="p-2 rounded-full bg-blue-100 text-blue-600">
    <ClipboardList />
  </div>
);

const IconEquipeAdd = () => (
  <div className="p-2 rounded-full bg-green-100 text-green-600">
    <Users />
  </div>
);

const IconEquipeRemove = () => (
  <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
    <UserMinus />
  </div>
);

const IconEdicaoTarefa = () => (
  <div className="p-2 rounded-full bg-purple-100 text-purple-600">
    <Edit3 />
  </div>
);



interface CardNotificacaoProps {
  notificacao: Notificacao;
  onDelete: (id: string) => void;
}


const CardNotificacao: React.FC<CardNotificacaoProps> = ({ notificacao, onDelete }) => {

  const [menuAberto, setMenuAberto] = React.useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickFora = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAberto(false);
      }
    };

    if (menuAberto) {
      document.addEventListener('mousedown', handleClickFora);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickFora);
    };
  }, [menuAberto]);


  const getIcon = () => {
    switch (notificacao.tipo) {
      case "comentario":
        return <IconeComentario />;
      case "atribuido":
        return <IconDesignado />;
      case "adicaoEquipe":
        return <IconEquipeAdd />;
      case "remocaoEquipe":
        return <IconEquipeRemove />;
      case "edicaoTarefa":
        return <IconEdicaoTarefa />;
      default:
        return <IconeExpirado />;
    }
  };

  const getMessageContent = () => {
    const { tipo, tarNome } = notificacao;

    switch (tipo) {
      case "expirado":
        return <span className="font-semibold text-red-600">{tarNome}</span>;
      case "comentario":
        return <span className="font-semibold text-gray-700">{tarNome}</span>;
      case "atribuido":
        return <span className="font-semibold text-blue-700">{tarNome}</span>;
      case "adicaoEquipe":
        return <span className="font-semibold text-green-700">{tarNome}</span>;
      case "remocaoEquipe":
        return <span className="font-semibold text-yellow-700">{tarNome}</span>;
      case "edicaoTarefa":
        return <span className="font-semibold text-purple-700">{tarNome}</span>;
      default:
        return <span className="font-semibold text-gray-700">{tarNome}</span>;
    }
  };

  const getSubtitle = () => {
    switch (notificacao.tipo) {
      case "expirado":
        return "Tarefa em atraso";
      case "comentario":
        return "Novo comentário";
      case "atribuido":
        return "Nova tarefa atribuída";
      case "adicaoEquipe":
        return "Adicionado a uma equipe";
      case "remocaoEquipe":
        return "Removido de uma equipe";
      case "edicaoTarefa":
        return "Tarefa atualizada";
      default:
        return "Notificação";
    }
  };

  return (
    <div className="flex justify-between items-start p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
      <div className="flex items-start space-x-3 min-w-0">
        {getIcon()}
        <div className="px-4 text-sm flex-grow">
          <p className="text-gray-800 leading-snug break-words">
            {getMessageContent()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {getSubtitle()} • {notificacao.data}
          </p>
        </div>
      </div>
      <div className="ml-2 sm:ml-4 flex-shrink-0">
        <div
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors relative"
          onClick={(e) => {
            e.stopPropagation();
            setMenuAberto(!menuAberto);
          }}
        >
          <MoreVertical />
          {menuAberto && (
            <div ref={menuRef}>
              <MenuNotificacao
                notificacao={notificacao}
                onClose={() => setMenuAberto(false)}
                onDelete={onDelete}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardNotificacao;