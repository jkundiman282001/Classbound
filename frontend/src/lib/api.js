const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''
const API_BASE_URL = configuredApiBaseUrl.replace(/\/$/, '')
const AUTH_TOKEN_KEY = 'classbound.auth_token'

async function parseJson(response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    return null
  }

  return response.json()
}

export async function apiRequest(path, options = {}) {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export function getAuthToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function register(payload) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function login(payload) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchCurrentUser() {
  return apiRequest('/api/auth/me')
}

export function logout() {
  return apiRequest('/api/auth/logout', {
    method: 'POST',
  })
}

export function fetchDashboardSummary() {
  return apiRequest('/api/auth/dashboard')
}
