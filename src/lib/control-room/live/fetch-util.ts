/**
 * Fail-soft fetch helpers for live-source modules.
 *
 * `fetchJsonSoft` / `fetchTextSoft` never throw — they return `null` on any
 * failure (network reject, non-2xx, parse error, timeout). Callers translate
 * `null` into a `degradedResult`. A default 6s timeout keeps one slow source
 * from blocking a server render past the gather budget.
 *
 * SERVER-ONLY.
 */

export interface SoftFetchOptions {
  headers?: Record<string, string>;
  method?: string;
  body?: string;
  /** Per-request timeout in ms (default 6000). */
  timeoutMs?: number;
  /** Next.js cache hint, e.g. `{ revalidate: 300 }`. */
  next?: { revalidate?: number };
}

async function rawFetch(url: string, opts: SoftFetchOptions): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 6000);
  try {
    const res = await fetch(url, {
      method: opts.method ?? 'GET',
      headers: opts.headers,
      body: opts.body,
      signal: controller.signal,
      // `next` is honored by the Next.js fetch wrapper; harmless under plain fetch.
      ...(opts.next ? { next: opts.next } : {}),
    } as RequestInit);
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** GET/POST returning parsed JSON, or `null` on any failure. */
export async function fetchJsonSoft<T = unknown>(
  url: string,
  opts: SoftFetchOptions = {},
): Promise<T | null> {
  const res = await rawFetch(url, opts);
  if (!res || !res.ok) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** GET returning raw text, or `null` on any failure. */
export async function fetchTextSoft(
  url: string,
  opts: SoftFetchOptions = {},
): Promise<string | null> {
  const res = await rawFetch(url, opts);
  if (!res || !res.ok) return null;
  try {
    return await res.text();
  } catch {
    return null;
  }
}

/** Reachability probe: returns true on any 2xx/3xx/4xx (server answered), false on network/timeout. */
export async function probeReachable(
  url: string,
  opts: SoftFetchOptions = {},
): Promise<boolean> {
  const res = await rawFetch(url, { ...opts, method: opts.method ?? 'GET' });
  // Any HTTP response (even 401/404) means the host is reachable; only a
  // null (network error / timeout) counts as unreachable.
  return res !== null;
}
