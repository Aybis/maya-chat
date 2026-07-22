import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || 'Login failed')
        return
      }

      setAuth(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError('Network error. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 bg-amber-400 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-warm-900" />
          </div>
          <h1 className="text-3xl font-serif font-semibold text-warm-800">
            Welcome back
          </h1>
          <p className="text-warm-500 mt-2">Sign in to your Maya Chat account</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-warm-200 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-warm-50 border border-warm-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-warm-50 border border-warm-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-500 text-warm-900 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-warm-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-amber-600 hover:text-amber-700 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
