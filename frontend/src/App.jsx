import { useEffect, useState } from 'react'
import './App.css'
import { fetchHealth, getApiBaseUrl } from './lib/api'

function App() {
  const [healthState, setHealthState] = useState({
    status: 'loading',
    data: null,
    error: null,
  })
  const apiBaseUrl = getApiBaseUrl()

  useEffect(() => {
    let cancelled = false

    const loadHealth = async () => {
      setHealthState((current) => ({
        ...current,
        status: 'loading',
        error: null,
      }))

      try {
        const data = await fetchHealth()

        if (cancelled) {
          return
        }

        setHealthState({
          status: 'success',
          data,
          error: null,
        })
      } catch (error) {
        if (cancelled) {
          return
        }

        setHealthState({
          status: 'error',
          data: null,
          error: error.message,
        })
      }
    }

    loadHealth()

    return () => {
      cancelled = true
    }
  }, [])

  const connectionLabel = {
    loading: 'Checking backend connection',
    success: 'Backend connected',
    error: 'Backend unreachable',
  }[healthState.status]

  const statusClassName = `connection-pill connection-pill--${healthState.status}`

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">Classbound</p>
        <h1>RPG class progression platform bootstrap</h1>
        <p className="lede">
          React is set up as the player-facing client and Laravel is ready to
          serve the API layer, authentication, progression logic, and reward
          systems.
        </p>

        <div className="connection-banner">
          <span className={statusClassName}>{connectionLabel}</span>
          <p className="connection-copy">
            {healthState.status === 'success' &&
              `API responded from ${healthState.data.service}.`}
            {healthState.status === 'loading' &&
              'Running an initial request from React to Laravel.'}
            {healthState.status === 'error' &&
              (healthState.error ??
                'The frontend could not reach the backend. Make sure Laravel is running on port 8000.')}
          </p>
        </div>

        <div className="status-grid">
          <article>
            <span className="label">Frontend</span>
            <strong>React + Vite</strong>
            <p>Ready for feature slices, routing, and API integration.</p>
          </article>
          <article>
            <span className="label">Backend</span>
            <strong>Laravel API + Sanctum</strong>
            <p>Ready for auth, content management, progression, and rewards.</p>
          </article>
        </div>
      </section>

      <section className="info-panel">
        <div>
          <p className="section-title">Development endpoints</p>
          <ul className="endpoint-list">
            <li>
              <span>Frontend</span>
              <code>http://localhost:5173</code>
            </li>
            <li>
              <span>Backend</span>
              <code>{apiBaseUrl}</code>
            </li>
            <li>
              <span>Health check</span>
              <code>
                {apiBaseUrl === 'Vite proxy (/api -> http://localhost:8000)'
                  ? '/api/health'
                  : `${apiBaseUrl}/api/health`}
              </code>
            </li>
            <li>
              <span>Connection status</span>
              <code>{healthState.status}</code>
            </li>
          </ul>
        </div>

        <div>
          <p className="section-title">Live API response</p>
          <ul className="checklist">
            <li>
              Service: {healthState.data?.service ?? 'Waiting for response'}
            </li>
            <li>Status: {healthState.data?.status ?? 'Pending'}</li>
            <li>Version: {healthState.data?.version ?? 'Pending'}</li>
            <li>Timestamp: {healthState.data?.timestamp ?? 'Pending'}</li>
          </ul>
        </div>
      </section>
    </main>
  )
}

export default App
