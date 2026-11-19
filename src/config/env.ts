// The one place that reads environment variables. Everything else imports `env` from here.
const apiUrl: string | undefined = import.meta.env.VITE_API_URL

if (!apiUrl) {
  throw new Error('Missing VITE_API_URL. Copy .env.example to .env and restart `npm run dev`.')
}

export const env = {
  apiUrl: apiUrl.replace(/\/+$/, ''),
}
