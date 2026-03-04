'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowLeft, LogIn, ShieldCheck, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // CONNECTED: Loading state for button
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // CONNECTED: Asli Login Logic Yahan Hai
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5064/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Token aur Role save karein
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);

        alert("Login Successful!");

        // 2. Role check karein aur sahi dashboard bhejein
        if (data.role === 'Admin') {
          router.push('/admin-dashboard'); 
        } else {
          router.push('/dashboard'); 
        }
      } else {
        alert(data.message || "Invalid Email or Password!");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Server is offline. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen text-black bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-semibold transition-colors group self-start"
        >
          <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-emerald-50 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Back to Home
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-2xl mb-4">
                <ShieldCheck size={32} className="text-emerald-600" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
              <p className="text-slate-500 font-medium mt-1">Access your BTS portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Mail size={16} className="text-emerald-600" /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
                  placeholder="name@example.com"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Lock size={16} className="text-emerald-600" /> Password
                  </label>
                  <Link href="#" className="text-xs font-bold text-emerald-600 hover:underline">
                    Forgot?
                  </Link>
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                />
              </div>

              {/* Submit Button (CONNECTED: Loading UI) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="animate-spin" size={18} /> Authenticating...</>
                ) : (
                  <><LogIn size={18} /> Sign In</>
                )}
              </button>
            </form>

            {/* Registration Footer */}
            <div className="mt-10 pt-8 border-t border-slate-50 text-center">
              <p className="text-slate-500 font-medium text-sm">
                New to the system?{' '}
                <Link href="/register" className="text-emerald-600 font-bold hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}