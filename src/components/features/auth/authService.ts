interface UsuarioCadastroDTO {
    usuNome: string;
    usuEmail: string;
    usuSenha: string;
    usuConfirmarSenha: string;
}

interface UsuarioLoginDTO {
    usuEmail: string;
    usuSenha: string;
}

interface AuthResponseData {
    usuNome?: string;
    titulo?: string
    mensagem?: string;
}

interface ServiceResponse {
    ok: boolean;
    data: AuthResponseData;
}

export const cadastrar = async (novoUsuario: UsuarioCadastroDTO): Promise<ServiceResponse> => {
    const response = await fetch("http://localhost:8080/auth/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoUsuario),
    });

    return { ok: response.ok, data: await response.json() };
}

export const login = async (usuario: UsuarioLoginDTO): Promise<AuthResponseData> => {
    const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(usuario),
    });

    const data = await response.json();

    return data;
}

export const logout = async () => {
    try {
        await fetch("http://localhost:8080/auth/logout", {
            method: "POST",
            credentials: "include",
        });

    } catch (error) {
        console.error("Erro ao conectar com o servidor.", error);
    }
}

export const verificarSessao = async () => {
  try {
    const response = await fetch("http://localhost:8080/auth/session", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) return null;
    const dados = await response.json();
    return dados;
  } catch (erro) {
    console.error("Erro ao verificar sessão:", erro);
    return null;
  }
}
