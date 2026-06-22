import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  withCredentials: true,
  timeout: 90000,
})

let isRefreshing = false
let waitQueue = []   // requests that came in while refresh was in-flight

function flushQueue(error) {
  waitQueue.forEach(p => error ? p.reject(error) : p.resolve())
  waitQueue = []
}

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config

    // Not a 401, or already retried — pass through
    if (err.response?.status !== 401 || original._retried) return Promise.reject(err)

    // The refresh call itself returned 401 — session is truly dead
    if (original.url?.includes('/auth/refresh')) {
      localStorage.removeItem('user')
      window.location.href = '/'
      return Promise.reject(err)
    }

    // Another refresh is already in-flight — wait for it to finish then retry
    if (isRefreshing) {
      return new Promise((resolve, reject) => waitQueue.push({ resolve, reject }))
        .then(() => api(original))
        .catch(e => Promise.reject(e))
    }

    original._retried = true
    isRefreshing = true

    try {
      await api.post('/auth/refresh')   // sets a fresh access_token cookie
      flushQueue(null)
      return api(original)
    } catch (refreshErr) {
      flushQueue(refreshErr)
      localStorage.removeItem('user')
      window.location.href = '/'
      return Promise.reject(refreshErr)
    } finally {
      isRefreshing = false
    }
  }
)

// True when the AI/Python service is unreachable, starting up, or Render returned its own 503
export function aiSleeping(err) {
  return (
    !err.response ||                       // network error, CORS, or Render proxy 503 with no JSON
    err.response?.status === 503 ||        // service unavailable from our server
    !!err.response?.data?.sleeping         // our explicit sleeping flag
  )
}

export default api
