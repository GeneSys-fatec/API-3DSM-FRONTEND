export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers || {});

    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.append('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
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