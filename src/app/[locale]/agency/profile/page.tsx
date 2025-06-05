'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth, User, AgencyProfile } from '@/context/AuthContext';
import Image from 'next/image';

export default function AgencyProfilePage() {
  const auth = useAuth();
  const user: User | null = auth?.user || null;
  const agencyProfile: AgencyProfile | null = auth?.agencyProfile || null;
  const t = useTranslations('Agency');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    website: '',
    phoneNumber: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    if (user && agencyProfile) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        description: agencyProfile.description || '',
        website: agencyProfile.website || '',
        phoneNumber: agencyProfile.phoneNumber || '',
        address: agencyProfile.address || ''
      }));
    }
  }, [user, agencyProfile]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError(t('passwordsDoNotMatch') || 'Passwords do not match');
      return;
    }
    
    try {
      // Here you would implement the API call to update the profile
      // For now, we'll just simulate a successful update
      console.log('Agency profile update submitted:', formData);
      setSuccess(t('profileUpdatedSuccessfully') || 'Profile updated successfully');
      setIsEditing(false);
      
      // Refresh agency profile data after update
      auth.refreshAgencyProfile();
    } catch (err) {
      setError(t('errorUpdatingProfile') || 'Error updating profile');
      console.error('Error updating profile:', err);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t('profile') || 'Agency Profile'}</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        {/* Agency information card */}
        <div className="flex items-start mb-8">
          <div className="w-24 h-24 relative mr-6">
            {agencyProfile?.logo ? (
              <Image 
                src={agencyProfile.logo} 
                alt={agencyProfile.name || 'Agency logo'}
                width={96} 
                height={96} 
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-2xl text-white">
                {agencyProfile?.name?.charAt(0) || user?.name?.charAt(0) || 'A'}
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold">{agencyProfile?.name || user?.name || 'Agency'}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="mt-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full inline-block text-sm">
              {user?.role || 'AGENCY'}
            </p>
            {agencyProfile?.verified && (
              <p className="mt-1 ml-2 px-3 py-1 bg-green-100 text-green-800 rounded-full inline-block text-sm">
                {t('verified') || 'Verified'}
              </p>
            )}
          </div>
          
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {isEditing ? (t('cancel') || 'Cancel') : (t('editProfile') || 'Edit Profile')}
          </button>
        </div>
        
        {/* Success or error messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <p className="text-green-700">{success}</p>
          </div>
        )}
        
        {/* Profile form */}
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('agencyName') || 'Agency Name'}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('email') || 'Email'}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                {t('description') || 'Agency Description'}
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('website') || 'Website'}
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://"
                />
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('phoneNumber') || 'Phone Number'}
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                {t('address') || 'Address'}
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <hr className="my-6" />
            
            <h3 className="text-lg font-medium">{t('changePassword') || 'Change Password'}</h3>
            
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                {t('currentPassword') || 'Current Password'}
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                {t('newPassword') || 'New Password'}
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                {t('confirmPassword') || 'Confirm Password'}
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {t('saveChanges') || 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">{t('agencyInformation') || 'Agency Information'}</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('name') || 'Name'}</p>
                    <p className="font-medium">{agencyProfile?.name || user?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('email') || 'Email'}</p>
                    <p className="font-medium">{user?.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('status') || 'Status'}</p>
                    <p className="font-medium">
                      {agencyProfile?.verified ? 
                        <span className="text-green-600">{t('verified') || 'Verified'}</span> : 
                        <span className="text-yellow-600">{t('pendingVerification') || 'Pending Verification'}</span>
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('role') || 'Role'}</p>
                    <p className="font-medium">{user?.role || 'AGENCY'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">{t('contactInformation') || 'Contact Information'}</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('phoneNumber') || 'Phone Number'}</p>
                    <p className="font-medium">{agencyProfile?.phoneNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('website') || 'Website'}</p>
                    <p className="font-medium">
                      {agencyProfile?.website ? (
                        <a href={agencyProfile.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                          {agencyProfile.website}
                        </a>
                      ) : '-'}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">{t('address') || 'Address'}</p>
                  <p className="font-medium">{agencyProfile?.address || '-'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">{t('aboutAgency') || 'About Agency'}</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm whitespace-pre-wrap">
                  {agencyProfile?.description || t('noDescriptionProvided') || 'No description provided.'}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">{t('securitySettings') || 'Security Settings'}</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">{t('password') || 'Password'}</p>
                <p className="font-medium">••••••••</p>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  {t('changePassword') || 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
