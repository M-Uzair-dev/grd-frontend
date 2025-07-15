'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { setAuthCookies, getAuthCookies } from '@/utils/auth';
import Logo from '../../../public/logo.svg';
import Button from '@/components/Button';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const { token, userRole } = getAuthCookies();
    if (token && userRole) {
      router.push(userRole === 'admin' ? '/admin/dashboard' : '/partner/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store the token in cookies
      setAuthCookies(data.token, 'admin');

      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-md p-10 rounded-2xl shadow-xl flex flex-col items-center">
        <div className="flex flex-col items-center mb-6">
          <Logo className="w-20 h-20 mb-2 drop-shadow-md" />
          <h2 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Admin Login</h2>
          <p className="text-gray-500 text-sm">Sign in to your admin dashboard</p>
        </div>
        <form className="w-full space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <HiOutlineMail className="h-5 w-5" />
              </span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="pl-10 pr-3 py-2 w-full rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-gray-900 transition placeholder-gray-400 text-sm"
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <HiOutlineLockClosed className="h-5 w-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="pl-10 pr-10 py-2 w-full rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-gray-900 transition placeholder-gray-400 text-sm"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-500 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {error && (
            <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-xs font-medium text-center animate-shake">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 rounded-lg shadow font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <LoadingSpinner className="h-5 w-5" />}
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
} 