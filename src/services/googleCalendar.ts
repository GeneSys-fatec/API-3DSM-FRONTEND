// import { authFetch } from "@/utils/api"; // não usar mais

export interface RbcEvent {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
}

// Base da API: usa VITE_API_URL se existir; senão, localhost:8080
const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8080';

function withBase(path: string) {
  return `${API_BASE}${path}`;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Wrapper local para fetch na API do backend
async function apiFetch(path: string, init?: RequestInit) {
  const headers = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
    ...authHeaders(),
  };
  return fetch(withBase(path), { credentials: 'include', ...init, headers });
}

export async function exchangeCode(code: string): Promise<void> {
  await apiFetch(`/google/exchange`, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function getAuthStatus(): Promise<{ loggedIn: boolean }> {
  const res = await apiFetch(`/google/status`);
  if (!res.ok) return { loggedIn: false };
  return res.json();
}

// Converte 'YYYY-MM-DD' para Date local (00:00 local), evitando shift de fuso
function parseDateAsLocal(yyyyMMdd?: string): Date | undefined {
  if (!yyyyMMdd) return undefined;
  const [y, m, d] = yyyyMMdd.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export async function fetchGoogleEvents(params?: {
  timeMin?: string;
  timeMax?: string;
}): Promise<RbcEvent[]> {
  const qs = new URLSearchParams();
  if (params?.timeMin) qs.set('timeMin', params.timeMin);
  if (params?.timeMax) qs.set('timeMax', params.timeMax);
  const res = await apiFetch(`/google/events${qs.toString() ? `?${qs.toString()}` : ''}`);
  if (!res.ok) throw new Error(`Falha ao buscar eventos: ${res.status} ${await res.text()}`);
  const data = await res.json();


  const items = Array.isArray(data?.items) ? data.items : [];
  return items.map((e: any) => {
    const isAllDay = Boolean(e?.start?.date) || Boolean(e?.end?.date);

    const start = isAllDay
      ? parseDateAsLocal(e?.start?.date)
      : e?.start?.dateTime
      ? new Date(e.start.dateTime)
      : undefined;

    const end = isAllDay
      ? parseDateAsLocal(e?.end?.date) 
      : e?.end?.dateTime
      ? new Date(e.end.dateTime)
      : undefined;

      console.log(e?.id)
    return {
      title: e?.summary || '(Sem título)',
      start: start as Date,
      end: end as Date,
      allDay: isAllDay,
      resource: {
        source: 'google',
        googleId: e?.id,
        raw: e,
      },
    };
  });
}

function generateGoogleEventId(): string {
  // Caracteres válidos para base32hex (RFC 4648)
  const chars = '0123456789abcdefghijklmnopqrstuv';
  let result = 'taskmngr'; // Prefixo para evitar colisões
  for (let i = 0; i < 22; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function buildGoogleEventBodyFromTask(tarefa: {
  tarTitulo: string;
  tarDescricao?: string;
  tarPrazo?: string | Date;
  tarPrazoFim?: string | Date;
}) {
  if (!tarefa.tarPrazo) throw new Error('tarPrazo é obrigatório');

  const isDateOnly = (v: unknown): v is string =>
    typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

  const addDays = (dateStr: string, days: number) => {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  let start: any;
  let end: any;

  if (isDateOnly(tarefa.tarPrazo) && !tarefa.tarPrazoFim) {
    start = { date: tarefa.tarPrazo as string };
    end = { date: addDays(tarefa.tarPrazo as string, 1) };
  } else if (
    isDateOnly(tarefa.tarPrazo) &&
    tarefa.tarPrazoFim &&
    isDateOnly(tarefa.tarPrazoFim)
  ) {
    start = { date: tarefa.tarPrazo as string };
    end = { date: addDays(tarefa.tarPrazoFim as string, 1) };
  } else {
    const startDt = tarefa.tarPrazo ? new Date(tarefa.tarPrazo) : undefined;
    const endDt = tarefa.tarPrazoFim
      ? new Date(tarefa.tarPrazoFim)
      : startDt
      ? new Date(startDt.getTime() + 60 * 60 * 1000)
      : undefined;

    start = startDt ? { dateTime: startDt.toISOString() } : undefined;
    end = endDt ? { dateTime: endDt.toISOString() } : undefined;
  }

  return {
    summary: tarefa.tarTitulo,
    description: tarefa.tarDescricao ?? '',
    start,
    end,
  };
}

export async function createGoogleEventFromTask(tarefa: {
  googleId?: string;
  tarTitulo: string;
  tarDescricao?: string;
  tarPrazo?: string | Date;
  tarPrazoFim?: string | Date;
}): Promise<void> {
  const event = buildGoogleEventBodyFromTask(tarefa);

  const body = {
    id: tarefa.googleId || generateGoogleEventId(),
    ...event,
  };

  const res = await apiFetch('/google/create-event', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha ao criar evento no Google: ${res.status} ${text}`);
  }
}

// Remove ?code= e outros params do Google da URL e retorna o que for relevante
export function consumeOAuthCodeFromUrl():
  | { code?: string; error?: string }
  | null {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code') || undefined;
  const error = url.searchParams.get('error') || undefined;

  if (!code && !error) return null;

  const keysToRemove = [
    'code',
    'scope',
    'authuser',
    'prompt',
    'state',
    'hd',
    'session_state',
  ];
  keysToRemove.forEach((k) => url.searchParams.delete(k));

  const cleaned = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, document.title, cleaned);

  return { code, error };

}

export const deleteGoogleEvent = async (eventId:string) =>{
  if(!eventId) return;

  await apiFetch(`/google/events/${encodeURIComponent(eventId)}`, {
    method: 'DELETE',
  });
}

export async function updateGoogleEvent(eventId: string, eventBody: any): Promise<any> {
  if (!eventId) throw new Error('eventId é obrigatório');
  const res = await apiFetch(`/google/events/${encodeURIComponent(eventId)}`, {
    method: 'PUT',
    body: JSON.stringify(eventBody),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha ao atualizar evento no Google: ${res.status} ${text}`);
  }
  return res.json();
}

