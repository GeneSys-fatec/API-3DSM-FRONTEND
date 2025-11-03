import React, { useEffect, useState, useRef } from 'react';
import CardNotificacao from './CardNotificacao';
import { Notificacao } from '@/types/types';
import { buscarNotificacoes } from './notificacaoService';

interface ModalNotificacaoProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalNotificacoes: React.FC<ModalNotificacaoProps> = ({ isOpen, onClose }) => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickFora = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickFora);
    }
    if (!isOpen) return;

    setCarregando(true);
    buscarNotificacoes()
      .then((dados) => setNotificacoes(dados))
      .catch((err) => console.error(err))
      .finally(() => setCarregando(false));
  }, [isOpen, onClose]);

  const removerNotificacao = (id: string) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 top-14 right-4 w-[90%] sm:w-80 md:w-96 lg:w-[24rem] max-h-[calc(100vh-2rem)]">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Notificações</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {carregando ? (
            <p className="text-center p-4">Carregando...</p>
          ) : notificacoes.length === 0 ? (
            <p className="text-center p-4">Nenhuma notificação</p>
          ) : (
            notificacoes.map((notificacao) => (
              <CardNotificacao key={notificacao.id} notificacao={notificacao} onDelete={removerNotificacao} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalNotificacoes;
