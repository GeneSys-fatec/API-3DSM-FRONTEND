import { authFetch } from "@/utils/api";

export async function registrarAuditoria(dados: {
  projetoId?: number;
  tarefaId?: number;
  editor: string;
  acao: string;
  modificacoes?: any;
}) {
  return authFetch("/auditoria/logs", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}
