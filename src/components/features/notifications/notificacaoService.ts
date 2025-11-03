import { Notificacao } from '@/types/types';
import { authFetch } from '@/utils/api';

export const buscarNotificacoes = async (): Promise<Notificacao[]> => {
  const resposta = await authFetch('http://localhost:8080/notificacao/listar', {
    method: 'GET',
    credentials: "include",
  });

  if (!resposta.ok) {
    throw new Error('Erro ao buscar notificações');
  }

  const data = await resposta.json();

  return data.map((backend: any) => {
  let tipo: Notificacao["tipo"];

  switch (backend.notTipo) {
    case "ATRIBUICAO":
      tipo = "atribuido";
      break;
    case "COMENTARIO":
      tipo = "comentario";
      break;
    case "PRAZO":
      tipo = "proximoVencimento";
      break;
    case "EQUIPE_ADICIONADA":
      tipo = "adicaoEquipe";
      break;
    case "EQUIPE_REMOVIDA":
      tipo = "remocaoEquipe";
      break;
    case "TAREFA_EDITADA":
      tipo = "edicaoTarefa";
      break;
    default:
      tipo = "expirado";
  }

  return {
    id: backend.notId,
    tipo,
    tarNome: backend.notMensagem,
    data: new Date(backend.notDataCriacao).toLocaleString(),
    usuNome: backend.notUsuarioNome || "",
    notLida: backend.notLida,
  };
});
};

export const buscarNotificacoesNaoLidas = async (): Promise<boolean> => {
  const resposta = await authFetch('http://localhost:8080/notificacao/listar', { method: 'GET', credentials: "include", });

  if (!resposta.ok) {
    console.error('Erro ao buscar notificações');
    return false;
  }

  const notificacoes: Notificacao[] = await resposta.json();
  return notificacoes.some((n) => !n.notLida);
};

export const marcarTodasComoLidas = async (): Promise<void> => {
  const resposta = await authFetch('http://localhost:8080/notificacao/marcar-todas', {
    method: 'PUT',
    credentials: "include",
  });

  if (!resposta.ok) {
    console.error('Erro ao marcar notificações como lidas');
  }
};

export const deletarNotificacao = async (id: string): Promise<void> => {
  const resposta = await authFetch(`http://localhost:8080/notificacao/${id}`, {
    method: 'DELETE',
    credentials: "include",
  });

  if (!resposta.ok) {
    console.error('Erro ao deletar notificação');
  }
};
