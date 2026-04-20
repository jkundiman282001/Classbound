import { useEffect, useState } from 'react'
import './App.css'
import {
  clearAuthToken,
  fetchCurrentUser,
  fetchDashboardSummary,
  fetchHealth,
  getApiBaseUrl,
  getAuthToken,
  login,
  logout,
  register,
  setAuthToken,
} from './lib/api'

const initialRegisterForm = {
  name: '',
  email: '',
  password: '',
  passwordConfirmation: '',
}

const initialLoginForm = {
  email: '',
  password: '',
}

const classShowcase = [
  {
    name: 'Pyromancer',
    tagline: 'Flame-focused lessons, trials, and reward path.',
    crest: 'crest crest--pyro',
    rank: 'Flame Discipline',
    purpose: 'Learn a class, clear quizzes, pass the final exam.',
  },
  {
    name: 'Chronomancer',
    tagline: 'Time-based mechanics, rhythm, and precision tests.',
    crest: 'crest crest--chrono',
    rank: 'Temporal Discipline',
    purpose: 'Study a path built around timing, logic, and mastery.',
  },
  {
    name: 'Warden',
    tagline: 'Defense, control, and high-discipline progression.',
    crest: 'crest crest--warden',
    rank: 'Guardian Discipline',
    purpose: 'Advance through structured modules and unlock class rewards.',
  },
]

const platformHighlights = [
  {
    title: 'Lessons',
    body: 'Study a class path step by step.',
  },
  {
    title: 'Exams',
    body: 'Pass quizzes and final class tests.',
  },
  {
    title: 'Rewards',
    body: 'Unlock badges, certificates, and cosmetics.',
  },
]

const commandCenterItems = [
  'Add authenticated navigation and route guards',
  'Build the class catalog API and player dashboard data',
  'Persist profile data beyond the base user record',
  'Move from a single screen to routed player pages',
]

function App() {
  const [publicView, setPublicView] = useState('landing')
  const [activeClass, setActiveClass] = useState(classShowcase[0])
  const [healthState, setHealthState] = useState({
    status: 'loading',
    data: null,
    error: null,
  })
  const [authMode, setAuthMode] = useState('login')
  const [registerForm, setRegisterForm] = useState(initialRegisterForm)
  const [loginForm, setLoginForm] = useState(initialLoginForm)
  const [dashboardState, setDashboardState] = useState({
    status: 'idle',
    data: null,
    error: null,
  })
  const [authState, setAuthState] = useState({
    status: getAuthToken() ? 'loading' : 'idle',
    user: null,
    token: getAuthToken(),
    message: getAuthToken()
      ? 'Restoring saved session.'
      : 'Register a new account or log in with an existing one.',
    errors: {},
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

        if (cancelled) return

        setHealthState({
          status: 'success',
          data,
          error: null,
        })
      } catch (error) {
        if (cancelled) return

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

  useEffect(() => {
    const token = getAuthToken()

    if (!token) return

    let cancelled = false

    const loadCurrentUser = async () => {
      try {
        const response = await fetchCurrentUser()

        if (cancelled) return

        setAuthState({
          status: 'authenticated',
          user: response.user,
          token,
          message: `Signed in as ${response.user.name}.`,
          errors: {},
        })
      } catch (error) {
        clearAuthToken()

        if (cancelled) return

        setAuthState({
          status: 'idle',
          user: null,
          token: null,
          message: error.message ?? 'Saved session is no longer valid.',
          errors: {},
        })
      }
    }

    loadCurrentUser()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (authState.status !== 'authenticated') {
      setDashboardState({
        status: 'idle',
        data: null,
        error: null,
      })

      return
    }

    let cancelled = false

    const loadDashboard = async () => {
      setDashboardState({
        status: 'loading',
        data: null,
        error: null,
      })

      try {
        const data = await fetchDashboardSummary()

        if (cancelled) return

        setDashboardState({
          status: 'success',
          data,
          error: null,
        })
      } catch (error) {
        if (cancelled) return

        setDashboardState({
          status: 'error',
          data: null,
          error: error.message ?? 'Failed to load dashboard summary.',
        })
      }
    }

    loadDashboard()

    return () => {
      cancelled = true
    }
  }, [authState.status])

  const connectionLabel = {
    loading: 'Checking backend connection',
    success: 'Backend connected',
    error: 'Backend unreachable',
  }[healthState.status]

  const statusClassName = `connection-pill connection-pill--${healthState.status}`
  const isBusy = authState.status === 'submitting' || authState.status === 'loading'
  const authErrors = Object.values(authState.errors).flat()

  const handleRegisterChange = (event) => {
    const { name, value } = event.target

    setRegisterForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleLoginChange = (event) => {
    const { name, value } = event.target

    setLoginForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const openAuthPage = (mode = 'login') => {
    setAuthMode(mode)
    setPublicView('auth')
  }

  const submitRegister = async (event) => {
    event.preventDefault()

    setAuthState((current) => ({
      ...current,
      status: 'submitting',
      message: 'Creating your account.',
      errors: {},
    }))

    try {
      const response = await register({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        password_confirmation: registerForm.passwordConfirmation,
      })

      setAuthToken(response.token)
      setRegisterForm(initialRegisterForm)

      setAuthState({
        status: 'authenticated',
        user: response.user,
        token: response.token,
        message: response.message,
        errors: {},
      })
    } catch (error) {
      setAuthState({
        status: 'idle',
        user: null,
        token: null,
        message: error.message ?? 'Registration failed.',
        errors: error.data?.errors ?? {},
      })
    }
  }

  const submitLogin = async (event) => {
    event.preventDefault()

    setAuthState((current) => ({
      ...current,
      status: 'submitting',
      message: 'Signing you in.',
      errors: {},
    }))

    try {
      const response = await login(loginForm)

      setAuthToken(response.token)
      setLoginForm(initialLoginForm)

      setAuthState({
        status: 'authenticated',
        user: response.user,
        token: response.token,
        message: response.message,
        errors: {},
      })
    } catch (error) {
      clearAuthToken()

      setAuthState({
        status: 'idle',
        user: null,
        token: null,
        message: error.message ?? 'Login failed.',
        errors: error.data?.errors ?? {},
      })
    }
  }

  const handleLogout = async () => {
    setAuthState((current) => ({
      ...current,
      status: 'submitting',
      message: 'Signing you out.',
      errors: {},
    }))

    try {
      await logout()
    } finally {
      clearAuthToken()
      setPublicView('landing')
      setAuthState({
        status: 'idle',
        user: null,
        token: null,
        message: 'You have been signed out.',
        errors: {},
      })
    }
  }

  if (authState.status === 'authenticated' && authState.user) {
    const dashboard = dashboardState.data

    return (
      <main className="app-shell app-shell--dashboard">
        <section className="dashboard-shell">
          <header className="dashboard-topbar">
            <div>
              <p className="eyebrow">Classbound Command Deck</p>
              <h1 className="dashboard-title">
                Welcome back, {dashboard?.profile.name ?? authState.user.name}
              </h1>
            </div>

            <div className="dashboard-topbar__actions">
              <span className={statusClassName}>{connectionLabel}</span>
              <button type="button" className="secondary-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>

          <section className="dashboard-hero">
            <div className="dashboard-hero__copy">
              <p className="section-title">Authenticated app shell</p>
              <h2>Player dashboard summary is now coming from Laravel.</h2>
              <p>
                This view is reading authenticated player data from the backend
                and gives us a stable place to plug in real classes,
                progression, and rewards as those domains are built.
              </p>
              {dashboardState.status === 'error' ? (
                <p className="dashboard-error">
                  {dashboardState.error ?? 'Dashboard summary failed to load.'}
                </p>
              ) : null}
            </div>

            <div className="dashboard-profile">
              <span className="label">Player Profile</span>
              <strong>{dashboard?.profile.email ?? authState.user.email}</strong>
              <p>Member since: {dashboard?.profile.member_since ?? 'Pending'}</p>
              <p>Active API tokens: {dashboard?.account.active_api_tokens ?? 'Pending'}</p>
            </div>
          </section>

          <section className="dashboard-stats">
            <article className="stat-card">
              <span className="label">Classes completed</span>
              <strong>{dashboard?.progress.classes_completed ?? '0'}</strong>
            </article>
            <article className="stat-card">
              <span className="label">Lessons completed</span>
              <strong>{dashboard?.progress.lessons_completed ?? '0'}</strong>
            </article>
            <article className="stat-card">
              <span className="label">Rewards earned</span>
              <strong>{dashboard?.rewards.badges_unlocked ?? '0'}</strong>
            </article>
            <article className="stat-card">
              <span className="label">Certificates</span>
              <strong>{dashboard?.rewards.certificates_earned ?? '0'}</strong>
            </article>
          </section>

          <section className="dashboard-grid">
            {(dashboard?.build_status ?? []).map((card) => (
              <article key={card.key} className="dashboard-card">
                <span className="label">{card.key}</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <strong>{card.status}</strong>
              </article>
            ))}
          </section>

          <section className="dashboard-lower">
            <div className="command-center">
              <p className="section-title">Next Build Targets</p>
              <ul className="checklist">
                {commandCenterItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="command-center">
              <p className="section-title">Live System Status</p>
              <ul className="endpoint-list">
                <li>
                  <span>API status</span>
                  <code>{healthState.data?.status ?? healthState.status}</code>
                </li>
                <li>
                  <span>Backend service</span>
                  <code>{healthState.data?.service ?? 'Unavailable'}</code>
                </li>
                <li>
                  <span>Auth session</span>
                  <code>authenticated</code>
                </li>
                <li>
                  <span>Dashboard fetch</span>
                  <code>{dashboardState.status}</code>
                </li>
              </ul>
            </div>
          </section>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <button type="button" className="brand-mark" onClick={() => setPublicView('landing')}>
          <span>Classbound</span>
        </button>

        <nav className="site-nav">
          <button type="button" onClick={() => setPublicView('landing')}>
            Home
          </button>
          <button type="button" onClick={() => openAuthPage('login')}>
            Login
          </button>
          <button type="button" className="site-nav__cta" onClick={() => openAuthPage('register')}>
            Start Learning
          </button>
        </nav>
      </header>

      {publicView === 'landing' ? (
        <>
          <section className="landing-shell">
            <div className="landing-backdrop landing-backdrop--left" aria-hidden="true" />
            <div className="landing-backdrop landing-backdrop--right" aria-hidden="true" />

            <section className="landing-hero landing-hero--centered">
              <div className="announcement-pill">
                <span className="announcement-pill__dot" />
                New way to learn RPG classes
              </div>

              <p className="eyebrow">Classbound</p>
              <h1>Master RPG classes through lessons, exams, and rewards.</h1>
              <p className="landing-lede landing-lede--centered">
                Learn a class path, pass its tests, and unlock badges,
                certificates, and cosmetics.
              </p>

              <div className="hero-actions hero-actions--centered">
                <button type="button" className="primary-button" onClick={() => openAuthPage('register')}>
                  Start learning
                </button>
                <button type="button" className="secondary-button" onClick={() => openAuthPage('login')}>
                  Login
                </button>
              </div>

              <div className="landing-status landing-status--centered">
                <span className={statusClassName}>{connectionLabel}</span>
                <p>
                  {healthState.status === 'success'
                    ? `Backend live: ${healthState.data.service}`
                    : 'Connect the backend to enable live content.'}
                </p>
              </div>

              <div className="trust-strip">
                <span>Lessons</span>
                <span>Quizzes</span>
                <span>Final Exams</span>
                <span>Rewards</span>
              </div>
            </section>

            <section className="landing-interactive">
              <div className="landing-interactive__preview">
                <p className="section-title">Featured Class</p>
                <div className={activeClass.crest} aria-hidden="true" />
                <h3>{activeClass.name}</h3>
                <p className="showcase-rank">{activeClass.rank}</p>
                <p>{activeClass.purpose}</p>
              </div>

              <div className="landing-interactive__list">
                {classShowcase.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    className={`showcase-card showcase-card--interactive ${
                      activeClass.name === item.name ? 'is-active' : ''
                    }`}
                    onClick={() => setActiveClass(item)}
                  >
                    <div className={item.crest} aria-hidden="true" />
                    <div className="showcase-copy">
                      <h3>{item.name}</h3>
                      <p>{item.tagline}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="landing-features">
              {platformHighlights.map((highlight) => (
                <article key={highlight.title} className="highlight-card">
                  <h3>{highlight.title}</h3>
                  <p>{highlight.body}</p>
                </article>
              ))}
            </section>
          </section>
        </>
      ) : (
        <section className="auth-layout">
          <aside className="auth-rail">
            <div className="auth-rail__intro">
              <p className="eyebrow">Player access</p>
              <h1>Enter the academy.</h1>
              <p className="landing-lede">
                Create your player identity, track future class progression, and
                prepare for a system built around exams, unlocks, and collectible rewards.
              </p>
            </div>

            <div className="auth-rail__stack">
              <div className="auth-story-card">
                <div className="crest crest--gate" aria-hidden="true" />
                <span className="label">Connected backend</span>
                <strong>{connectionLabel}</strong>
                <p>
                  {healthState.status === 'success'
                    ? `Health endpoint responding from ${apiBaseUrl}.`
                    : 'API connection is not live yet, but the auth UI is ready.'}
                </p>
              </div>

              <div className="gate-rules">
                <p className="section-title">Before entry</p>
                <ul className="timeline-list">
                  <li>Claim your player identity.</li>
                  <li>Choose your first class discipline.</li>
                  <li>Return to unlock your dashboard and progression log.</li>
                </ul>
              </div>
            </div>
          </aside>

          <section className="auth-page auth-page--focused">
            <div className="auth-page__panel">
              <div className="auth-card">
                <div className="auth-card__header">
                  <div>
                    <p className="section-title">Authentication</p>
                    <h2>{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
                  </div>

                  <div className="auth-toggle" role="tablist" aria-label="Auth mode">
                    <button
                      type="button"
                      className={authMode === 'login' ? 'is-active' : ''}
                      onClick={() => setAuthMode('login')}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      className={authMode === 'register' ? 'is-active' : ''}
                      onClick={() => setAuthMode('register')}
                    >
                      Register
                    </button>
                  </div>
                </div>

                <p className="auth-copy">{authState.message}</p>

                {authErrors.length > 0 ? (
                  <ul className="error-list">
                    {authErrors.map((errorMessage) => (
                      <li key={errorMessage}>{errorMessage}</li>
                    ))}
                  </ul>
                ) : null}

                {authMode === 'login' ? (
                  <form className="auth-form auth-form--single" onSubmit={submitLogin}>
                    <label>
                      <span>Email</span>
                      <input
                        type="email"
                        name="email"
                        value={loginForm.email}
                        onChange={handleLoginChange}
                        autoComplete="email"
                        required
                      />
                    </label>

                    <label>
                      <span>Password</span>
                      <input
                        type="password"
                        name="password"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        autoComplete="current-password"
                        required
                      />
                    </label>

                    <button type="submit" className="primary-button" disabled={isBusy}>
                      {isBusy ? 'Processing...' : 'Login'}
                    </button>
                  </form>
                ) : (
                  <form className="auth-form" onSubmit={submitRegister}>
                    <label>
                      <span>Name</span>
                      <input
                        type="text"
                        name="name"
                        value={registerForm.name}
                        onChange={handleRegisterChange}
                        autoComplete="name"
                        required
                      />
                    </label>

                    <label>
                      <span>Email</span>
                      <input
                        type="email"
                        name="email"
                        value={registerForm.email}
                        onChange={handleRegisterChange}
                        autoComplete="email"
                        required
                      />
                    </label>

                    <label>
                      <span>Password</span>
                      <input
                        type="password"
                        name="password"
                        value={registerForm.password}
                        onChange={handleRegisterChange}
                        autoComplete="new-password"
                        required
                      />
                    </label>

                    <label>
                      <span>Confirm password</span>
                      <input
                        type="password"
                        name="passwordConfirmation"
                        value={registerForm.passwordConfirmation}
                        onChange={handleRegisterChange}
                        autoComplete="new-password"
                        required
                      />
                    </label>

                    <button type="submit" className="primary-button" disabled={isBusy}>
                      {isBusy ? 'Processing...' : 'Create account'}
                    </button>
                  </form>
                )}

                <button type="button" className="auth-backlink" onClick={() => setPublicView('landing')}>
                  Back to landing page
                </button>
              </div>
            </div>
          </section>
        </section>
      )}
    </main>
  )
}

export default App
