import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Activity, Lock, Mail, ChevronRight, Stethoscope } from 'lucide-react';

export default function Login() {
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  function validate() {
    const e = {};
    if (!role) e.role = 'Please select a role';
    if (!email.trim()) e.email = 'Email is required';
    if (!password.trim()) e.password = 'Password is required';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    try {
      setLoading(true);
      await login(email.trim(), password, role);
      navigate('/dashboard');
    } catch (err) {
      setErrors({ form: err.message || 'Invalid credentials. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  const inputCls = (err) =>
    `w-full pl-10 pr-4 py-3 rounded-xl text-sm text-gray-800 bg-white border placeholder:text-gray-400
     focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition-all
     ${err ? 'border-rose-300 ring-2 ring-rose-200' : 'border-gray-200'}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #eef2ff 50%, #f0f9ff 100%)' }}>

      {/* Decorative background shapes */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #c4b5fd, transparent 60%)' }} />
      </div>

      <div className="w-full max-w-4xl relative z-10 fade-up">
        <div className="rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
          style={{ border: '1px solid rgba(167,139,250,0.2)', boxShadow: '0 20px 60px rgba(109,40,217,0.15)' }}>

          {/* ── Left: Form (white) ── */}
          <div className="w-full md:w-1/2 bg-white p-8 sm:p-10 flex flex-col justify-center">
            {/* Brand */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                <Activity size={20} className="text-white" />
              </div>
              <div>
                <p className="text-gray-800 font-extrabold text-base uppercase tracking-wide">MediTrack AI</p>
                <p className="text-violet-400 text-[10px] font-semibold uppercase tracking-widest">Bed Tracking System</p>
              </div>
            </div>

            <h1 className="text-3xl font-black text-gray-900 mb-1">Welcome back</h1>
            <p className="text-gray-500 text-sm mb-8">Sign in to continue to your dashboard</p>

            {errors.form && (
              <div className="mb-5 p-3.5 rounded-xl text-sm text-rose-600 flex items-center gap-2 bg-rose-50 border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Role */}
              <div>
                <div className="relative">
                  <Stethoscope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
                  <select value={role}
                    onChange={e => { setRole(e.target.value); setErrors(p => ({ ...p, role: '' })); }}
                    className={inputCls(errors.role)}>
                    <option value="">Select Role</option>
                    <option value="Admin">Admin</option>
                    <option value="Hospital Staff">Hospital Staff</option>
                  </select>
                </div>
                {errors.role && <p className="text-rose-500 text-[11px] mt-1 pl-1">{errors.role}</p>}
              </div>

              {/* Email */}
              <div>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
                  <input type="email" placeholder="Email address" value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                    className={inputCls(errors.email)} autoComplete="email" />
                </div>
                {errors.email && <p className="text-rose-500 text-[11px] mt-1 pl-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
                  <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                    className={inputCls(errors.password)} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-500 transition-colors" tabIndex={-1}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-rose-500 text-[11px] mt-1 pl-1">{errors.password}</p>}
              </div>

              <div className="flex justify-end">
                <a href="#" className="text-xs text-violet-500 hover:text-violet-700 font-semibold transition-colors">
                  Forgot your password?
                </a>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white tracking-wide
                  transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 20px rgba(109,40,217,0.35)' }}>
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
                ) : (
                  <>Sign In <ChevronRight size={16} /></>
                )}
              </button>
            </form>
          </div>

          {/* ── Right: Info (gradient) ── */}
          <div className="w-full md:w-1/2 p-8 sm:p-10 flex flex-col items-center justify-center text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #6366f1 100%)' }}>

            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, #fff 0%, transparent 60%), radial-gradient(circle at 80% 80%, #a78bfa 0%, transparent 50%)' }} />

            <div className="relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-white/15 flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/20">
                <Activity size={36} className="text-white" />
              </div>

              <h2 className="text-3xl font-black text-white mb-3 leading-snug">
                AI-Powered<br />
                <span className="text-violet-200">Healthcare</span>
              </h2>
              <p className="text-violet-200 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
                Real-time bed tracking with AI predictions. Manage your hospital intelligently.
              </p>

              <div className="space-y-2.5 text-left mb-8">
                {['Real-time bed availability', 'AI demand forecasting', 'Smart patient queuing', 'INR billing & invoices'].map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
                      <ChevronRight size={10} className="text-white" />
                    </div>
                    <span className="text-violet-100 text-sm">{f}</span>
                  </div>
                ))}
              </div>

              <p className="text-violet-300 text-xs mb-3">Don't have an account?</p>
              <Link to="/register">
                <button className="px-8 py-3 rounded-xl font-bold text-sm text-white tracking-wide
                  border border-white/40 bg-white/10 hover:bg-white/20 transition-all">
                  Create Account
                </button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
