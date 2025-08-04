'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthCookies } from '@/utils/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const { token, userRole } = getAuthCookies();
    
    if (token && userRole) {
      // User is logged in, redirect to appropriate dashboard
      router.push(userRole === 'admin' ? '/admin/dashboard' : '/partner/dashboard');
    } else {
      // User is not logged in, redirect to partner login by default
      router.push('/partner');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Redirecting...</p>
      </div>
    </div>
  );
}