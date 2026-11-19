import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { env } from '../config/env'
import { refreshResponseSchema } from './schemas'

// The single Axios instance for the whole app. Every API call goes through it, so the
// base URL, cookies, timeout and token handling are defined once, here.
export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 10_000,
  withCredentials: true, // send and receive cookies (the httpOnly refresh_token)
})

// The access token lives in memory only (not localStorage), so a script injected into the page
// can't read it from storage. A page reload loses it; the refresh cookie gets a new one.
let accessToken: string | null = null
let onSessionExpired: () => void = () => {}

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

// The auth provider registers what happens when even the refresh fails (back to the login page).
export function setOnSessionExpired(handler: () => void) {
  onSessionExpired = handler
}

// ── Request interceptor: runs BEFORE every request ─────────────────────────────
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// If several requests fail with token_expired at the same time, refresh only ONCE.
let refreshPromise: Promise<string> | null = null
const REFRESH_TIMEOUT_MS = 8_000

export function refreshAccessToken(): Promise<string> {
  // Bare axios on purpose: the refresh call must not pass through the interceptors below.
  refreshPromise ??= axios
    .post<unknown>(`${env.apiUrl}/auth/refresh`, null, {
      timeout: REFRESH_TIMEOUT_MS,
      withCredentials: true,
    })
    .then((res) => {
      const data = refreshResponseSchema.parse(res.data)
      setAccessToken(data.accessToken)
      return data.accessToken
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

export function isRequestTimeout(error: unknown) {
  return axios.isAxiosError(error) && (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT')
}

// ── Response interceptor: runs AFTER every response ────────────────────────────
type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

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
