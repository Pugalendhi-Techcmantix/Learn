import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

export const API_URL = 'http://localhost:4000'

// The access token lives in memory only (not localStorage), so a page script attack can't
// steal it from storage. A page reload loses it; the refresh cookie gets a new one.
let accessToken: string | null = null
let onSessionExpired: () => void = () => {}

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

// The UI registers what to do when even the refresh fails (go back to the login form).
export function setOnSessionExpired(handler: () => void) {
  onSessionExpired = handler
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 3000, // /api/slow takes 5s, so it will time out on purpose
  withCredentials: true, // send and receive cookies (the httpOnly refresh_token)
})

// ── Request interceptor: runs BEFORE every request ─────────────────────────────
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// ── Response interceptor: runs AFTER every response ────────────────────────────
type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

// If 3 requests fail with token_expired at the same time, refresh only ONCE.
let refreshPromise: Promise<string> | null = null

export async function refreshAccessToken(): Promise<string> {
  refreshPromise ??= axios
    .post<{ accessToken: string }>(`${API_URL}/auth/refresh`, null, { withCredentials: true })
    .then((res) => {
      setAccessToken(res.data.accessToken)
      return res.data.accessToken
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: string }>) => {
    const original = error.config as RetryableConfig | undefined
    const code = error.response?.data?.error

    // Expired access token → get a new one with the refresh cookie → retry the request once.
    if (error.response?.status === 401 && code === 'token_expired' && original && !original._retried) {
      original._retried = true
      try {
        await refreshAccessToken()
        return api(original)
      } catch (refreshError) {
        setAccessToken(null)
        onSessionExpired()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// Turn any error into one short sentence for the user.
export function describeError(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Unexpected error.'

  if (error.code === AxiosError.ECONNABORTED) return 'The server took too long to answer (timeout).'

  // No response at all: server down, wrong URL, or the BROWSER blocked it (CORS).
  if (!error.response) return 'Network error: server unreachable or blocked by CORS. Check the Console and Network tab.'

  const data = error.response.data as { message?: string } | undefined
  switch (error.response.status) {
    case 401:
      return `401 Unauthorized: ${data?.message ?? 'please log in.'}`
    case 403:
      return `403 Forbidden: ${data?.message ?? 'you are not allowed.'}`
    case 500:
      return `500 Server error: ${data?.message ?? 'something broke on the server.'}`
    default:
      return `${error.response.status}: ${data?.message ?? error.message}`
  }
}
