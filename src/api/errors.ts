import axios, { AxiosError } from 'axios'

// Turn any error into one short sentence for the user.
export function describeError(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Unexpected error.'

  if (error.code === AxiosError.ECONNABORTED) return 'The server took too long to answer (timeout).'

  // No response at all: server down, wrong URL, or the BROWSER blocked it (CORS).
  if (!error.response) {
    return 'Cannot reach the server. It may be offline, or the browser blocked the request (CORS). Check the Console and Network tab.'
  }

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

// Just the server's own message (e.g. "Wrong email or password."), for forms.
export function serverMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message
    if (message) return message
  }
  return describeError(error)
}
