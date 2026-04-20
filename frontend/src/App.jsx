import './App.css'

function App() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

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
              <code>{apiBaseUrl}/api/health</code>
            </li>
          </ul>
        </div>

        <div>
          <p className="section-title">Next backend domains</p>
          <ul className="checklist">
            <li>Authentication and profile bootstrap</li>
            <li>RPG classes, modules, and lesson catalog</li>
            <li>Quizzes, exams, and progression tracking</li>
            <li>Rewards, certificates, and downloadable assets</li>
          </ul>
        </div>
      </section>
    </main>
  )
}

export default App
