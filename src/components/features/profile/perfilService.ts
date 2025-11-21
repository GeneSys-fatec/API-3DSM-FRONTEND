import { authFetch } from "@/utils/api";

interface AuthResponseData {
    usuId?: string | number;
    usuNome?: string;
    usuEmail?: string;
    usuCaminhoFoto?: string;
    titulo?: string
    mensagem?: string;
}

const API_URL = "http://localhost:8000/usuario";

export const atualizarNomeEmail = async (usuId: string, nome: string, email: string): Promise<AuthResponseData> => {
    const response = await authFetch(`${API_URL}/${usuId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuNome: nome, usuEmail: email }),
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensagem || data.titulo || "Erro ao atualizar usuário.")
    }

    return data;
}

export const atualizarSenha = async (usuId: string, senhaAtual: string, novaSenha: string): Promise<string> => {
    const response = await authFetch(`${API_URL}/${usuId}/senha`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaAtual, novaSenha }),
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensagem || data.titulo || "Erro ao atualizar senha.")
    }

    return data;
}

export const atualizarFoto = async (usuId: string, foto: File): Promise<AuthResponseData> => {
    const formData = new FormData();
    formData.append("foto", foto);

    const response = await authFetch(`${API_URL}/${usuId}/foto`, {
        method: "POST",
        body: formData,
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensagem || "Erro ao atualizar foto.")
    }

    return data;
}
