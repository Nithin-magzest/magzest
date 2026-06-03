import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { api } from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.auth.forgotPassword(email.trim().toLowerCase());
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex flex-col items-center justify-center bg-[#0d1b4b] rounded-xl shadow-md px-8 py-5 mb-4">
              <GraduationCap className="w-10 h-10 text-white mb-1.5" />
              <span className="font-bold text-white text-xl tracking-tight">GradZest</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
            <p className="text-gray-500 mt-2 text-sm">Enter your email and we'll send you a reset link</p>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 w-full">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-green-700 text-sm">
                  If an account exists for <strong>{email}</strong>, a password reset link has been sent. Check your inbox (and spam folder).
                </p>
              </div>
              <Link to="/login" className="flex items-center gap-2 text-sm text-[#0d1b4b] font-medium hover:underline mt-2">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          ) : (
            <>
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
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d1b4b] text-sm"
                    placeholder="your@email.com"
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#0d1b4b] text-white py-3 rounded-xl font-semibold hover:bg-[#152258] transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-[#0d1b4b]">
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
