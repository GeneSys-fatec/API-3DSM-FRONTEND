import { verificarSessao } from "@/components/features/auth/authService";

let cachedUsuarioSessao: { usuId: string; usuEmail: string } | null = null;

const API_BASE = ("http://localhost:8000");
const API_AUDIT = ("http://localhost:8088");

function resolveApiUrl(input: string): string {
    if (input.startsWith("/auditoria/")) {
        return `${API_AUDIT}${input}`;
    }
    const localMatch = input.match(/^https?:\/\/localhost:8000(\/.*)$/);
    if (localMatch) return `${API_BASE}${localMatch[1]}`;
    if (/^https?:\/\//.test(input)) return input;
    if (input.startsWith('/')) return `${API_BASE}${input}`;
    throw new Error("resolveApiUrl: URL inválida ou não tratada: " + input);
}

function safeParseJSON<T = unknown>(value: string | null): T | undefined {
    if (!value) return undefined;
    try { return JSON.parse(value) as T; } catch { return undefined; }
}

function mapMetodoParaCategoria(method: string): string {
    const m = method.toUpperCase();
    if (m === 'POST') return 'CRIACAO';
    if (m === 'DELETE') return 'EXCLUSAO';
    return 'EDICAO';
}

function extrairIdsDaUrl(rawUrl: string, options?: RequestInit): { projetoId?: string; tarefaId?: string } {
    const path = String(rawUrl).split('?')[0];
    const ids: { projetoId?: string; tarefaId?: string } = {};
    
    let m = path.match(/\/tarefa(?:s)?\/([0-9a-fA-F\-]{6,})\b/);
    if (m) ids.tarefaId = m[1];

    m = path.match(/\/tarefa\/por-projeto\/([0-9a-fA-F\-]{6,})\b/);
    if (m) ids.projetoId = m[1];

    m = path.match(/\/projeto\/([0-9a-fA-F\-]{6,})\b/);
    if (m) ids.projetoId = m[1];

    m = path.match(/\/anexos\/tarefa\/(\d+)/);
    if (m) ids.tarefaId = m[1];

    try {
        const urlObj = new URL(String(rawUrl), window.location.origin);
        for (const key of ['tarefaId', 'tarefa', 'tarId', 'id']) {
            const v = urlObj.searchParams.get(key);
            if (v) {
                if (!ids.tarefaId) ids.tarefaId = v;
                break;
            }
        }
    } catch {
    }
    try {
        if (!ids.tarefaId && options?.body) {
            if (options.body instanceof FormData) {
                const fd = options.body as FormData;
                const v = fd.get('tarefaId') || fd.get('id') || fd.get('tarId');
                if (v) ids.tarefaId = String(v);
            } else if (typeof options.body === 'string') {
                const parsed = JSON.parse(options.body);
                if (parsed) {
                    const candidate = parsed.tarefaId || parsed.tarId || parsed.id || parsed.tarefa?.id;
                    if (candidate) ids.tarefaId = String(candidate);
                }
            }
        }
    } catch {
    }

    if (!ids.projetoId) {
        const storedProj =
            safeParseJSON<any>(localStorage.getItem('selectedProject')) ||
            localStorage.getItem('selectedProjectId');
        if (storedProj) {
            if (typeof storedProj === 'object' && storedProj.id) ids.projetoId = String(storedProj.id);
            else if (/([0-9a-zA-Z\-]+)$/.test(String(storedProj))) ids.projetoId = String(storedProj);
        }
    }

    return ids;
}

export async function authFetch(url: string, options: RequestInit = {}, usuarioLogado?: { usuId: string; usuEmail: string }): Promise<Response> {
    const headers = new Headers(options.headers || {});
    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.append('Content-Type', 'application/json');
    }

    try {
        const skipAudit = (options as any).__skipAudit === true || headers.get('X-Audit-Skip') === '1';
        if (!skipAudit) {
            const metodo = (options.method || 'GET').toUpperCase();
            if (['POST','PUT','PATCH','DELETE'].includes(metodo)) {
                const { projetoId, tarefaId } = extrairIdsDaUrl(url, options);
                if (projetoId || tarefaId) {
                    if (!usuarioLogado) {
                        if (cachedUsuarioSessao) {
                            usuarioLogado = cachedUsuarioSessao;
                        } else {
                            try {
                                const sess = await verificarSessao();
                                if (sess?.usuId) {
                                    usuarioLogado = { usuId: String(sess.usuId), usuEmail: sess.usuEmail || "sem-email" };
                                    cachedUsuarioSessao = usuarioLogado;
                                } else {
                                    usuarioLogado = { usuId: "desconhecido", usuEmail: "sem-email" };
                                }
                            } catch {
                                usuarioLogado = { usuId: "desconhecido", usuEmail: "sem-email" };
                            }
                        }
                    }

                    const modificacoes = [
                        {
                            categoria: mapMetodoParaCategoria(metodo),
                            modificacao: `Requisição ${metodo} em '${url}'`
                        }
                    ];

                    const auditPayload = {
                        projetoId: projetoId || null,
                        tarefaId: tarefaId || null,
                        responsavelId: usuarioLogado?.usuId || "desconhecido",
                        responsavelEmail: usuarioLogado?.usuEmail || "sem-email",
                        modificacoes
                    };

                    const auditOptions: any = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Audit-Skip': '1'
                        },
                        body: JSON.stringify(auditPayload),
                        credentials: 'include',
                        __skipAudit: true
                    };
                    await authFetch('/auditoria/logs', auditOptions).catch(err => console.warn('Falha auditoria automática:', err));
                }
            }
        }
    } catch (err) {
        console.warn('Erro auditoria automática:', err);
    }

    const response = await fetch(resolveApiUrl(url), {
        ...options,
        headers,
        credentials: 'include'
    });

    if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }
    return response;
}