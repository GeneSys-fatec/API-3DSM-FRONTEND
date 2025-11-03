/* eslint-disable @typescript-eslint/no-unused-vars */
import { authFetch } from "@/utils/api";
import type { EquipeComProjetos } from "@/types/types";

const API_URL = "http://localhost:8080/equipe";

export const getMinhasEquipes = async (): Promise<EquipeComProjetos[]> => {
  const response = await authFetch(`${API_URL}/minhas-equipes`);
  if (!response.ok) {
    throw new Error("Erro ao buscar equipes.");
  }
  return response.json();
};

export const createEquipe = async (payload: { equNome: string; equDescricao: string; membrosEmails: string[] }): Promise<string> => {
  const response = await authFetch(`${API_URL}/cadastrar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const data = await response.text();
  if (!response.ok) {
    try {
      const errorJson = JSON.parse(data);
      throw new Error(errorJson.mensagem || "Erro ao criar equipe.");
    } catch (e) {
      throw new Error(data || "Erro ao criar equipe.");
    }
  }
  return data;
};

export const updateEquipe = async (equipeId: string, payload: { equNome: string; equDescricao: string; membrosEmails: string[] }): Promise<string> => {
  const response = await authFetch(`${API_URL}/atualizar/${equipeId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const data = await response.text();
  if (!response.ok) {
    try {
      const errorJson = JSON.parse(data);
      throw new Error(errorJson.mensagem || "Erro ao atualizar equipe.");
    } catch (e) {
      throw new Error(data || "Erro ao atualizar equipe.");
    }
  }
  return data;
};

export const deleteEquipe = async (equipeId: string): Promise<string> => {
  const response = await authFetch(`${API_URL}/apagar/${equipeId}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await response.text();
  if (!response.ok) {
    try {
      const errorJson = JSON.parse(data);
      throw new Error(errorJson.mensagem || "Erro ao excluir equipe.");
    } catch (e) {
      throw new Error(data || "Erro ao excluir equipe.");
    }
  }
  return data;
};

export const sairDaEquipe = async (equipeId: string): Promise<string> => {
  const response = await authFetch(`${API_URL}/${equipeId}/sair`, {
    method: "POST",
    credentials: "include",
  });
  const data = await response.text();
  if (!response.ok) {
    try {
      const errorJson = JSON.parse(data);
      throw new Error(errorJson.mensagem || "Erro ao sair da equipe.");
    } catch {
      throw new Error(data || "Erro ao sair da equipe.");
    }
  }
  return data;
};
