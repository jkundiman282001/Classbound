const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''
const API_BASE_URL = configuredApiBaseUrl.replace(/\/$/, '')

async function parseJson(response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    return null
  }

  return response.json()
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...options,
  })

  const data = await parseJson(response)

  if (!response.ok) {
    const error = new Error(data?.message ?? 'API request failed.')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export function getApiBaseUrl() {
  return API_BASE_URL || 'Vite proxy (/api -> http://localhost:8000)'
}

export function fetchHealth() {
  return apiRequest('/api/health')
}
