import { authFetch } from "@/utils/api";
import type { Projeto } from "@/types/types";

const API_URL = "http://localhost:8080/projeto";

export const getMeusProjetos = async (): Promise<Projeto[]> => {
  const response = await authFetch(`${API_URL}/meus-projetos`);
  if (!response.ok) {

    const errorData = await response.json().catch(() => ({ message: "Erro ao buscar projetos." }));
    throw new Error(errorData.message || "Erro ao buscar projetos.");
  }
  return response.json();
};
