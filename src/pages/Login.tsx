import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('aryan@example.com');
  const [password, setPassword] = useState('student123');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) {
      if (result.role === 'admin') navigate('/admin');
      else if (result.role === 'counselor') navigate('/counselor');
      else navigate('/student');
    } else {
      setError('Invalid email or password. Try the demo accounts below.');
    }
  };

  const loginAs = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setSubmitting(true);
    const result = await login(demoEmail, demoPassword);
    setSubmitting(false);
    if (result.success) {
      if (result.role === 'admin') navigate('/admin');
      else if (result.role === 'counselor') navigate('/counselor');
      else navigate('/student');
    } else {
      setError('Login failed. Please make sure the server is running and the database is seeded.');
    }
  };

  const demoAccounts = {
    admin: [
      { email: 'admin@eduabroad.com', password: 'admin123', name: 'Admin', initials: 'AD' },
    ],
    counselors: [
      { email: 'kavitha@eduabroad.com', password: 'counselor123', name: 'Dr. Kavitha Reddy', initials: 'KR' },
      { email: 'rajesh@eduabroad.com', password: 'counselor123', name: 'Mr. Rajesh Kumar', initials: 'RK' },
    ],
    students: [
      { email: 'aryan@example.com', password: 'student123', name: 'Aryan Sharma', initials: 'AS' },
      { email: 'priya@example.com', password: 'student123', name: 'Priya Patel', initials: 'PP' },
      { email: 'rashid@example.com', password: 'student123', name: 'Mohammed Al-Rashid', initials: 'MA' },
      { email: 'lan@example.com', password: 'student123', name: 'Nguyen Thi Lan', initials: 'NL' },
      { email: 'sara@example.com', password: 'student123', name: 'Sara Ahmed', initials: 'SA' },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-500 rounded-2xl shadow-lg mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to GradZest</h1>
            <p className="text-gray-500 mt-2 text-sm">Sign in to access your dashboard</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                placeholder="your@email.com" required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm pr-12"
                  placeholder="••••••••" required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={submitting} className="w-full bg-sky-500 text-white py-3 rounded-xl font-semibold hover:bg-sky-600 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8">
            <p className="text-center text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">Demo Accounts</p>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-purple-600 mb-2">Admin</p>
                <div className="grid grid-cols-1 gap-2">
                  {demoAccounts.admin.map(a => (
                    <button key={a.email} type="button" onClick={() => loginAs(a.email, a.password)} disabled={submitting}
                      className="flex items-center gap-3 p-3 border border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-xs flex-shrink-0">{a.initials}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800">{a.name}</p>
                        <p className="text-xs text-gray-400 truncate">{a.email}</p>
                      </div>
                      <span className="text-xs text-purple-600 font-medium whitespace-nowrap">Click to login →</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-green-600 mb-2">Counselors</p>
                <div className="grid grid-cols-1 gap-2">
                  {demoAccounts.counselors.map(a => (
                    <button key={a.email} type="button" onClick={() => loginAs(a.email, a.password)} disabled={submitting}
                      className="flex items-center gap-3 p-3 border border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs flex-shrink-0">{a.initials}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800">{a.name}</p>
                        <p className="text-xs text-gray-400 truncate">{a.email}</p>
                      </div>
                      <span className="text-xs text-green-600 font-medium whitespace-nowrap">Click to login →</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-sky-600 mb-2">Students</p>
                <div className="grid grid-cols-1 gap-2">
                  {demoAccounts.students.map(a => (
                    <button key={a.email} type="button" onClick={() => loginAs(a.email, a.password)} disabled={submitting}
                      className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sky-600 font-bold text-xs flex-shrink-0">{a.initials}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800">{a.name}</p>
                        <p className="text-xs text-gray-400 truncate">{a.email}</p>
                      </div>
                      <span className="text-xs text-sky-600 font-medium whitespace-nowrap">Click to login →</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/" className="text-sky-600 font-medium hover:underline">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
