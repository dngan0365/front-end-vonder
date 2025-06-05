'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import "@/app/globals.css";

export default function AgencyRegister() {
  const t = useTranslations('Auth');
  const router = useRouter();
  
  // Basic fields (required)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Agency-specific fields (optional)
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  
  const [passwordError, setPasswordError] = useState('');

  const { registerAgency, loading, error, isAuthenticated, clearError } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/agency/tours');
    }
  }, [isAuthenticated, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setPasswordError('');

    if (password !== confirmPassword) {
      setPasswordError(t('passwordsDontMatch') || 'Passwords don\'t match');
      return;
    }

    await registerAgency({
      email,
      name,
      password,
      description,
      website,
      phoneNumber,
      address
    });
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
      <div className="flex flex-col justify-center items-center w-full lg:w-3/5 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-4 p-2 rounded-lg">
          <div>
            <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
              {t('registerAgency') || 'Register Your Agency'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {t('agencyRegisterSubtitle') || 'Start offering your travel services on our platform'}
            </p>
          </div>

          {(error || passwordError) && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">{error || passwordError}</p>
            </div>
          )}

          <form className="mt-4 space-y-6 w-full max-w-lg" onSubmit={handleRegister}>
            <div className="rounded-md space-y-4">
              {/* Basic Information - Required */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  {t('basicInfo') || 'Basic Information'}
                </h3>
                <div>
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    {t('agencyName') || 'Agency Name'} *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="appearance-none rounded-[12px] relative block w-full px-3 py-2 mt-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#77DAE6] focus:border-[#77DAE6] focus:z-10 sm:text-sm"
                    placeholder={t('agencyName') || 'Official agency name'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="mt-3">
                  <label htmlFor="email-address" className="text-sm font-medium text-gray-700">
                    {t('email') || 'Email'} *
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-[12px] relative block w-full px-3 py-2 mt-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#77DAE6] focus:border-[#77DAE6] focus:z-10 sm:text-sm"
                    placeholder={t('email') || 'Email address'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Agency Information - Optional */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  {t('agencyInfo') || 'Agency Information'}
                </h3>
                <div>
                  <label htmlFor="description" className="text-sm font-medium text-gray-700">
                    {t('description') || 'Description'}
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="appearance-none rounded-[12px] relative block w-full px-3 py-2 mt-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#77DAE6] focus:border-[#77DAE6] focus:z-10 sm:text-sm"
                    placeholder={t('descriptionPlaceholder') || 'Tell us about your agency...'}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="mt-3">
                  <label htmlFor="website" className="text-sm font-medium text-gray-700">
                    {t('website') || 'Website'}
                  </label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    className="appearance-none rounded-[12px] relative block w-full px-3 py-2 mt-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#77DAE6] focus:border-[#77DAE6] focus:z-10 sm:text-sm"
                    placeholder={t('website') || 'https://www.example.com'}
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <div className="mt-3">
                  <label htmlFor="phone-number" className="text-sm font-medium text-gray-700">
                    {t('phoneNumber') || 'Phone Number'}
                  </label>
                  <input
                    id="phone-number"
                    name="phoneNumber"
                    type="tel"
                    className="appearance-none rounded-[12px] relative block w-full px-3 py-2 mt-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#77DAE6] focus:border-[#77DAE6] focus:z-10 sm:text-sm"
                    placeholder={t('phoneNumber') || 'Business phone number'}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                <div className="mt-3">
                  <label htmlFor="address" className="text-sm font-medium text-gray-700">
                    {t('address') || 'Business Address'}
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    className="appearance-none rounded-[12px] relative block w-full px-3 py-2 mt-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#77DAE6] focus:border-[#77DAE6] focus:z-10 sm:text-sm"
                    placeholder={t('address') || 'Official business address'}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  {t('security') || 'Security'}
                </h3>
                <div>
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    {t('password') || 'Password'} *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none rounded-[12px] relative block w-full px-3 py-2 mt-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#77DAE6] focus:border-[#77DAE6] focus:z-10 sm:text-sm"
                    placeholder={t('password') || 'Password (minimum 8 characters)'}
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="mt-3">
                  <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                    {t('confirmPassword') || 'Confirm Password'} *
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    required
                    className="appearance-none rounded-[12px] relative block w-full px-3 py-2 mt-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#77DAE6] focus:border-[#77DAE6] focus:z-10 sm:text-sm"
                    placeholder={t('confirmPassword') || 'Confirm Password'}
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-4">
                * {t('requiredFields') || 'Required fields'}
              </p>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#4ad4e4] hover:bg-[#77DAE6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#77DAE6]"
              >
                {loading ? (t('registering') || 'Registering...') : (t('register') || 'Register')}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              {t('alreadyHaveAgencyAccount') || 'Already have an agency account?'}{' '}
              <Link href="/auth/agency/login" className="font-medium text-[#4ad4e4] hover:text-[#77DAE6]">
                {t('agencyLogin') || 'Agency Login'}
              </Link>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {t('registerAsUser') || 'Register as a regular user?'}{' '}
              <Link href="/auth/register" className="font-medium text-[#4ad4e4] hover:text-[#77DAE6]">
                {t('userRegister') || 'User Registration'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
