'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { createLocation } from '@/api/location';
import data from '@/../data/data.json';
import ImageUploader from '@/components/ImageUploader';

// Get categories and provinces from data.json
const { Category: categories, Province: provinces } = data;
const TinyMCEEditor = dynamic(() => import('@/components/TinymceEditor'), { ssr: false })

export default function AddLocation() {
  const t = useTranslations('Admin');
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state - updated to handle single coverImage instead of image array
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverImage: '',
    category: '',
    province: '',
    district: '',
    latitude: 0,
    longitude: 0
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Use the formData directly since we're now tracking coverImage properly
      await createLocation(formData);
      
      // Redirect back to locations list after successful creation
      alert(t('locationCreated') || 'Location created successfully!');
      router.push('/admin/location');
    } catch (err) {
      setError('Failed to create location. Please try again.');
      console.error('Error creating location:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('addLocation') || 'Add New Location'}</h1>
        <Link href="/admin/location" className="text-blue-600 hover:underline">
          {t('backToList') || 'Back to list'}
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                {t('name') || 'Name'}*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
                {t('category') || 'Category'}*
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('selectCategory') || 'Select a category'}</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="province">
                {t('province') || 'Province'}*
              </label>
              <select
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('selectProvince') || 'Select a province'}</option>
                {provinces.map(prov => (
                  <option key={prov} value={prov}>{prov.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="district">
                {t('district') || 'District'}
              </label>
              <input
                type="text"
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="latitude">
                {t('latitude') || 'Latitude'}*
              </label>
              <input
                type="number"
                step="any"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="longitude">
                {t('longitude') || 'Longitude'}*
              </label>
              <input
                type="number"
                step="any"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                {t('description') || 'Description'}*
              </label>
              <TinyMCEEditor
                value={formData.description}
                onChange={(value: string) =>
                  setFormData((prev) => ({ ...prev, description: value }))
                }
              />
            </div>
            
            {/* Replace the image array section with single coverImage input */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="coverImage">
                {t('coverImage') || 'Cover Image'}*
              </label>
              <div className="flex flex-col gap-3">
                {formData.coverImage && (
                  <div className="relative inline-block">
                    <img 
                      src={formData.coverImage} 
                      alt="Location cover" 
                      className="h-40 object-cover rounded border" 
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      onClick={() => setFormData({...formData, coverImage: ''})}
                    >
                      &times;
                    </button>
                  </div>
                )}
                
                {!formData.coverImage && (
                  <div className="col-span-1 md:col-span-2">
                    <ImageUploader
                      currentImage={formData.coverImage}
                      onImageChange={(url) => setFormData({...formData, coverImage: url})}
                      label={t('coverImage') || 'Cover Image'}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('creating') || 'Creating...'}
                </span>
              ) : (
                t('createLocation') || 'Create Location'
              )}
            </button>
            <Link
              href="/admin/location"
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {t('cancel') || 'Cancel'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
