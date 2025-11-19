const API_BASE = ("http://localhost:8000");

function resolveApiUrl(input: string): string {
    const localMatch = input.match(/^https?:\/\/localhost:8000(\/.*)$/);
    if (localMatch) return `${API_BASE}${localMatch[1]}`;
    if (/^https?:\/\//.test(input)) return input;
    if (input.startsWith('/')) return `${API_BASE}${input}`;
    return `${API_BASE}/${input}`;
}

function safeParseJSON<T = unknown>(value: string | null): T | undefined {
    if (!value) return undefined;
    try { return JSON.parse(value) as T; } catch { return undefined; }
}

function firstDefined<T>(...vals: Array<T | undefined | null>): T | undefined {
    for (const v of vals) {
        if (v !== undefined && v !== null && String(v).trim() !== '') return v as T;
    }
}

function mapMetodoParaCategoria(method: string): string {
    const m = method.toUpperCase();
    if (m === 'POST') return 'CRIACAO';
    if (m === 'DELETE') return 'EXCLUSAO';
    return 'EDICAO';
}

function extrairIdsDaUrl(rawUrl: string): { projetoId?: string; tarefaId?: string } {
    const path = rawUrl.split('?')[0];
    const ids: { projetoId?: string; tarefaId?: string } = {};

    let m = path.match(/\/projeto\/(\d+)/);
    if (m) ids.projetoId = m[1];

    m = path.match(/\/tarefa\/(\d+)/);
    if (m) ids.tarefaId = m[1];

    m = path.match(/\/tarefa\/por-projeto\/(\d+)/);
    if (m) ids.projetoId = m[1];

    m = path.match(/\/anexos\/tarefa\/(\d+)/);
    if (m) ids.tarefaId = m[1];

    // Fallback projeto via storage
    if (!ids.projetoId) {
        const storedProj =
            safeParseJSON<any>(localStorage.getItem('selectedProject')) ||
            localStorage.getItem('selectedProjectId');
        if (storedProj) {
            if (typeof storedProj === 'object' && storedProj.id) ids.projetoId = String(storedProj.id);
            else if (/^\d+$/.test(String(storedProj))) ids.projetoId = String(storedProj);
        }
    }

    return ids;
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers || {});
    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.append('Content-Type', 'application/json');
    }

    try {
        const skipAudit = (options as any).__skipAudit === true || headers.get('X-Audit-Skip') === '1';
        if (!skipAudit) {
            const metodo = (options.method || 'GET').toUpperCase();
            const { projetoId, tarefaId } = extrairIdsDaUrl(url);

            if (projetoId || tarefaId) {
                const rawUser =
                    safeParseJSON<any>(localStorage.getItem('usuario')) ||
                    safeParseJSON<any>(localStorage.getItem('user')) ||
                    safeParseJSON<any>(localStorage.getItem('currentUser'));

                const responsavelId = firstDefined<string>(
                    rawUser?.id,
                    rawUser?.usuId,
                    rawUser?.usuarioId
                ) || 'desconhecido';

                const responsavelEmail = firstDefined<string>(
                    rawUser?.email,
                    rawUser?.usuEmail,
                    rawUser?.mail,
                    rawUser?.nome 
                ) || 'sem-email';

                const modificacoes = [
                    {
                        categoria: mapMetodoParaCategoria(metodo),
                        modificacao: `Requisição ${metodo} em '${url}'`
                    }
                ];

                const auditPayload = {
                    projetoId: projetoId || null,
                    tarefaId: tarefaId || null,
                    responsavelId: responsavelId,
                    responsavelEmail: responsavelEmail,
                    modificacoes
                };

                await authFetch('/auditoria/logs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Audit-Skip': '1'
                    },
                    body: JSON.stringify(auditPayload),
                    ...( { __skipAudit: true } as any )
                }).catch(err => console.warn('Falha auditoria automática:', err));
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