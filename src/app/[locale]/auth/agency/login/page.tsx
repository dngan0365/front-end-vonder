'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import "@/app/globals.css";

export default function AgencyLogin() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Use the auth context instead of local state
  const { agencyLogin, loading, error, isAuthenticated, clearError, user } = useAuth();

  // Redirect if agency is already authenticated
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'agency') {
      console.log('User is authenticated and is an agency');
      router.push('/agency/dashboard');
    }
  }, [isAuthenticated, router, user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); // Clear any previous errors
    await agencyLogin(email, password);
  };

  return (
    <div className="flex h-full">
      {/* Left side - Image */}
      <div className="hidden lg:block w-3/5 relative h-auto">
        <Image
          src='/VietNamLogin.png'
          alt="Vietnam"
          fill
          className="object-cover rounded-r-none rounded-l-lg"
        />
      </div>

      {/* Right side - Login form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-3/5 py-12 px-2 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 p-2 rounded-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {t('agencyLogin') || 'Agency Login'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {t('agencyLoginSubtitle') || 'Access your travel agency dashboard'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form className="mt-8 space-y-8 w-full max-w-lg" onSubmit={handleLogin}>
            <div className="rounded-md space-y-px">
              <div>
                <label htmlFor="email-address" className="text-sm font-medium text-gray-700">
                  {t('email') || 'Email address'}
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-[10px] relative block w-full px-3 py-3 mb-5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#77DAE6] focus:border-[#77DAE6] focus:z-10 sm:text-sm"
                  placeholder={t('email') || 'Email address'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  {t('password') || 'Password'}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-[10px] relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#77DAE6] focus:border-[#77DAE6] focus:z-10 sm:text-sm"
                  placeholder={t('password') || 'Password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#77DAE6] focus:ring-[#77DAE6] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  {t('rememberMe') || 'Remember me'}
                </label>
              </div>

              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-[#4ad4e4] hover:text-[#77DAE6]">
                  {t('forgotPassword') || 'Forgot your password?'}
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#4ad4e4] hover:bg-[#77DAE6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#77DAE6]"
              >
                {loading ? (t('loggingIn') || 'Logging in...') : (t('login') || 'Log in')}
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              {t('noAgencyAccount') || 'Don\'t have an agency account?'}{' '}
              <Link href="/auth/agency/register" className="font-medium text-[#4ad4e4] hover:text-[#77DAE6]">
                {t('agencyRegister') || 'Register your agency'}
              </Link>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {t('loginAsUser') || 'Login as a regular user?'}{' '}
              <Link href="/auth/login" className="font-medium text-[#4ad4e4] hover:text-[#77DAE6]">
                {t('userLogin') || 'User Login'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
