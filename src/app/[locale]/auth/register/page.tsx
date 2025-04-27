'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import "@/app/globals.css";

export default function Register() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { register, loading, error, isAuthenticated, clearError } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setPasswordError('');

    if (password !== confirmPassword) {
      setPasswordError(t('passwordsDontMatch'));
      return;
    }

    await register(email, name, password);
  };

  const handleGoogleLogin = async () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div className="flex">
      {/* Left side - Image */}
      <div className="hidden lg:block w-2/5 relative h-auto">
        <Image
          src="/VietNamLogin.png"
          alt="Vietnam"
          fill
          className="object-cover rounded-r-none rounded-l-lg"
        />
      </div>

      {/* Right side - Register form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-3/5 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-4 p-2 rounded-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {t('createAccount')}
            </h2>
          </div>

          {(error || passwordError) && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">{error || passwordError}</p>
            </div>
          )}

          <form className="mt-8 space-y-8 w-full max-w-lg" onSubmit={handleRegister}>
            <div className="rounded-md space-y-5">
              <div>
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  {t('name')}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-[12px] relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#77DAE6] focus:border-[#77DAE6] focus:z-10 sm:text-sm"
                  placeholder={t('name')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="email-address" className="text-sm font-medium text-gray-700">
                  {t('email')}
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-[12px] relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#77DAE6] focus:border-[#77DAE6] focus:z-10 sm:text-sm"
                  placeholder={t('email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  {t('password')}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-[12px] relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#77DAE6] focus:border-[#77DAE6] focus:z-10 sm:text-sm"
                  placeholder={t('password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                  {t('confirmPassword')}
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  className="appearance-none rounded-[12px] relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#77DAE6] focus:border-[#77DAE6] focus:z-10 sm:text-sm"
                  placeholder={t('confirmPassword')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#4ad4e4] hover:bg-[#77DAE6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#77DAE6]"
              >
                {loading ? t('registering') : t('register')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {t('orContinueWith')}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#77DAE6]"
              >
                <Image src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="Google logo" width={20} height={20} className="mr-2" />
                {t('continueWithGoogle')}
              </button>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              {t('alreadyHaveAccount')}{' '}
              <Link href="/auth/login" className="font-medium text-[#4ad4e4] hover:text-[#77DAE6]">
                {t('login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
