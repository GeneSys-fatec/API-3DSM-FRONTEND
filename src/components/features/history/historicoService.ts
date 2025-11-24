import { authFetch } from "@/utils/api";

export async function registrarAuditoria(dados: {
  projetoId?: number;
  tarefaId?: number;
  tarefaNome: string;
  editor: string;
  acao: string;
  modificacoes?: any;
}) {
  return authFetch("/auditoria/logs", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(dados),
  });
}
