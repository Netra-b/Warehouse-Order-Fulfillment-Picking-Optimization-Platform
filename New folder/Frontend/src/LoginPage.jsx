import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Warehouse } from 'lucide-react'
import { login } from './api'

function LoginPage({ onLogin, startupError }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      onLogin(await login(username, password))
    } catch (loginError) {
      setError(loginError.message || 'Could not sign in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand">
          <span className="brand-mark"><Warehouse size={20} strokeWidth={2.2} /></span>
          <span>stockroom<span className="brand-period">.</span></span>
        </div>
        <div className="login-heading">
          <span className="login-icon"><LockKeyhole size={18} /></span>
          <p className="eyebrow">WAREHOUSE WORKSPACE</p>
          <h1 id="login-title">Welcome back</h1>
          <p>Sign in to manage your warehouse operations.</p>
        </div>

        {startupError && <p className="login-alert" role="alert">{startupError}</p>}
        {error && <p className="login-alert" role="alert">{error}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            autoFocus
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Your administrator username"
          />

          <label htmlFor="password">Password</label>
          <div className="password-field">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
            />
            <button
              className="password-toggle"
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          <button className="login-submit" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
            {!submitting && <ArrowRight size={17} />}
          </button>
        </form>

        <p className="login-note">Access is limited to authorized warehouse administrators.</p>
      </section>
      <footer className="login-footer">Stockroom <span>·</span> Warehouse operations made clearer</footer>
    </main>
  )
}

export default LoginPage
