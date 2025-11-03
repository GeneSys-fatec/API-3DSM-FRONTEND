// utils/taskUtils.ts
import { authFetch } from "@/utils/api";
import { showErrorToastFromResponse } from "@/utils/errorUtils";

export async function uploadTaskAttachments(
  tarId: string | number,
  files: File[]
): Promise<boolean> {
  for (const arquivo of files) {
    const formData = new FormData();
    formData.append("file", arquivo);

    const uploadRes = await authFetch(
      `http://localhost:8080/tarefa/${tarId}/upload`,
      { method: "POST", body: formData }
    );

    if (!uploadRes.ok) {
      await showErrorToastFromResponse(uploadRes, `Falha no upload do anexo "${arquivo.name}"`);
      return false;
    }
  }
  return true;
}

export async function tryDeleteTask(tarId: string | number): Promise<boolean> {
  const id = String(tarId);
  const candidates = [
    `http://localhost:8080/tarefa/${id}`,
    `http://localhost:8080/tarefa/deletar/${id}`,
    `http://localhost:8080/tarefa/${id}/deletar`,
  ];

  for (const url of candidates) {
    try {
      const res = await authFetch(url, { method: "DELETE" });
      if (res.ok) return true;
    } catch {
      // tenta próximo
    }
  }
  return false;
}
