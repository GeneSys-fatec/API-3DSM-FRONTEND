const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

function resolveApiUrl(input: string): string {
   
    const localMatch = input.match(/^https?:\/\/localhost:8000(\/.*)$/);
    if (localMatch) return `${API_BASE}${localMatch[1]}`;

    // Se já é absoluta para outro host, mantém
    if (/^https?:\/\//.test(input)) return input;

    // Se começa com '/', prefixa com API_BASE
    if (input.startsWith('/')) return `${API_BASE}${input}`;

    // Senão, junta com barra
    return `${API_BASE}/${input}`;
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers || {});

    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.append('Content-Type', 'application/json');
    }

    const response = await fetch(resolveApiUrl(url), {
        ...options,
        headers: headers,
        credentials: 'include',
    });

    if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }

    return response;
}