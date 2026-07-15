const API_URL = import.meta.env.VITE_API_URL as string;

class ApiClientError extends Error {}

// Nota: nunca se agregan headers custom (Authorization, Content-Type: application/json) a propósito.
// Así el navegador clasifica estas llamadas como "petición simple" y no dispara un preflight OPTIONS,
// que Google Apps Script no maneja. El token viaja dentro del body/querystring en su lugar.

async function apiGet<T>(action: string, params: Record<string, string | undefined> = {}): Promise<T> {
  // "_" evita que el navegador sirva una respuesta GET vieja del caché HTTP: Apps Script
  // no manda cabeceras de no-cache, así que sin esto se puede ver data desactualizada
  // justo después de guardar un cambio.
  const query = new URLSearchParams({ action, ...cleanParams(params), _: Date.now().toString() });
  const res = await fetch(`${API_URL}?${query.toString()}`, { cache: 'no-store' });
  return parseResponse<T>(res);
}

async function apiPost<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ action, ...payload }),
  });
  return parseResponse<T>(res);
}

function cleanParams(params: Record<string, string | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key in params) {
    const value = params[key];
    if (value !== undefined) out[key] = value;
  }
  return out;
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) throw new ApiClientError('No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.');
  const body = await res.json();
  if (!body.ok) throw new ApiClientError(body.error || 'Ocurrió un error inesperado.');
  return body as T;
}

export const api = { get: apiGet, post: apiPost };
export { ApiClientError };
