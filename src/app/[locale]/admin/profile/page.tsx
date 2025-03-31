'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth, User } from '@/context/AuthContext';

export default function AdminProfile() {
  const auth = useAuth();
  const user: User | null = auth?.user || null;
  const t = useTranslations('Admin');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      console.log('Profile update submitted:', formData);
      setSuccess(t('profileUpdatedSuccessfully') || 'Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(t('errorUpdatingProfile') || 'Error updating profile');
      console.error('Error updating profile:', err);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t('profile') || 'Admin Profile'}</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        {/* User information card */}
        <div className="flex items-start mb-8">
          <div className="w-24 h-24 relative mr-6">
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-2xl">
                {user && (user.name?.charAt(0) || user.email?.charAt(0)) || 'A'}
              </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold">{user?.name || 'Admin User'}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="mt-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full inline-block text-sm">
              {user?.role || 'ADMIN'}
            </p>
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
                {t('name') || 'Name'}
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
              <h3 className="text-lg font-medium mb-2">{t('accountInformation') || 'Account Information'}</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('name') || 'Name'}</p>
                    <p className="font-medium">{user?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('email') || 'Email'}</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('role') || 'Role'}</p>
                    <p className="font-medium">{user?.role || 'ADMIN'}</p>
                  </div>
                </div>
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
