import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Activity, Lock, Mail, User, ChevronRight, Stethoscope, ShieldAlert } from 'lucide-react';

const ROLES = ['Admin', 'Hospital Staff'];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', role: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
  }

  function validate() {
    const e = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) { e.email = 'Email is required'; }
    else if (!emailRegex.test(form.email)) { e.email = 'Invalid email format'; }
    if (!form.role) e.role = 'Please select a role';
    if (!form.password.trim()) { e.password = 'Password is required'; }
    else if (form.password.length < 6) { e.password = 'Password must be at least 6 characters'; }
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    try {
      setLoading(true);
      await register(form.name.trim(), form.email.trim(), form.role || 'Admin', form.password);
      navigate('/login');
    } catch (err) {
      setErrors({ form: err.message || 'Registration failed. Please try again.' });
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
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-4xl relative z-10 fade-up">
        <div className="rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
          style={{ border: '1px solid rgba(167,139,250,0.2)', boxShadow: '0 20px 60px rgba(109,40,217,0.15)' }}>

          {/* ── Left: Info panel ── */}
          <div className="w-full md:w-1/2 p-8 sm:p-10 flex flex-col items-center justify-center text-center relative overflow-hidden order-2 md:order-1"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%)' }}>

            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #fff 0%, transparent 60%)' }} />

            <div className="relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-white/15 flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/20">
                <Stethoscope size={36} className="text-white" />
              </div>

              <h2 className="text-3xl font-black text-white mb-3 leading-snug">
                Join the<br />
                <span className="text-violet-200">MediTrack Network</span>
              </h2>
              <p className="text-violet-200 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
                Create your account and start managing hospital beds with the power of AI.
              </p>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { value: '247+', label: 'Beds Tracked' },
                  { value: '98%', label: 'Uptime' },
                  { value: '< 1s', label: 'Response' },
                  { value: 'AI', label: 'Powered' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3 text-center bg-white/10 border border-white/15">
                    <p className="text-white font-black text-lg leading-none">{s.value}</p>
                    <p className="text-violet-200 text-[11px] font-medium mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              <p className="text-violet-300 text-xs mb-3">Already have an account?</p>
              <Link to="/login">
                <button className="px-8 py-3 rounded-xl font-bold text-sm text-white tracking-wide
                  border border-white/40 bg-white/10 hover:bg-white/20 transition-all">
                  Sign In
                </button>
              </Link>
            </div>
          </div>

          {/* ── Right: Form (white) ── */}
          <div className="w-full md:w-1/2 bg-white p-8 sm:p-10 flex flex-col justify-center order-1 md:order-2">
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

            <h1 className="text-3xl font-black text-gray-900 mb-1">Create account</h1>
            <p className="text-gray-500 text-sm mb-8">Fill in your details to get started</p>

            {errors.form && (
              <div className="mb-5 p-3.5 rounded-xl text-sm text-rose-600 flex items-center gap-2 bg-rose-50 border border-rose-200">
                <ShieldAlert size={14} className="shrink-0" /> {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
                  <input name="name" placeholder="Full name" value={form.name} onChange={handleChange}
                    className={inputCls(errors.name)} autoComplete="name" />
                </div>
                {errors.name && <p className="text-rose-500 text-[11px] mt-1 pl-1">{errors.name}</p>}
              </div>

              <div>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
                  <input name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange}
                    className={inputCls(errors.email)} autoComplete="email" />
                </div>
                {errors.email && <p className="text-rose-500 text-[11px] mt-1 pl-1">{errors.email}</p>}
              </div>

              <div>
                <div className="relative">
                  <Stethoscope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
                  <select name="role" value={form.role} onChange={handleChange} className={inputCls(errors.role)}>
                    <option value="">Select Role</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                {errors.role && <p className="text-rose-500 text-[11px] mt-1 pl-1">{errors.role}</p>}
              </div>

              <div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
                  <input name="password" type={showPass ? 'text' : 'password'} placeholder="Password (min. 6 chars)"
                    value={form.password} onChange={handleChange}
                    className={inputCls(errors.password)} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-500 transition-colors" tabIndex={-1}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-rose-500 text-[11px] mt-1 pl-1">{errors.password}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white tracking-wide
                  transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 20px rgba(109,40,217,0.35)' }}>
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating…</>
                ) : (
                  <>Create Account <ChevronRight size={16} /></>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
