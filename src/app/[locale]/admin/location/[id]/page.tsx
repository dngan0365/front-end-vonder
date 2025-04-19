'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
<<<<<<< HEAD
import { getLocationById, updateLocation, Location } from '@/api/location';
import data from '@/../data/data.json';
=======
import { getLocationById, updateLocation, Location } from '@/api/location';
import data from '@/data/data.json';
>>>>>>> a5c877a92c572eba7f5a564795b882fd4b0e2073
import ImageUploader from '@/components/ImageUploader';

// Get categories and provinces from data.json
const { Category: categories, Province: provinces } = data;
const TinyMCEEditor = dynamic(() => import('@/components/TinymceEditor'), { ssr: false })

export default function EditLocation({ params }: { params: { id: string } }) {
  const t = useTranslations('Admin');
  const router = useRouter();
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Form state - updated to handle single coverImage instead of image array
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    province: '',
    district: '',
    latitude: 0,
    longitude: 0,
    coverImage: ''
  });
  
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Fetch location data using the API
        const locationData = await getLocationById(params.id);
        setLocation(locationData);
        
        // Set form data from fetched location
        setFormData({
          name: locationData.name,
          description: locationData.description,
          category: locationData.category,
          province: locationData.province,
          district: locationData.district || '',
          latitude: locationData.latitude || 0,
          longitude: locationData.longitude || 0,
          coverImage: locationData.coverImage || ''
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching location:', err);
        setError('Failed to load location data');
        setIsLoading(false);
      }
    };
    
    fetchLocation();
  }, [params.id]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Use the formData directly since we're now tracking coverImage properly
      await updateLocation(params.id, formData);
      
      // Redirect back to locations list after successful update
      alert(t('locationUpdated') || 'Location updated successfully!');
      router.push('/admin/location');
    } catch (err) {
      setError('Failed to update location. Please try again.');
      console.error('Error updating location:', err);
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  if (!location) {
    return <div className="text-center text-red-500 p-4">Location not found</div>;
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('editLocation') || 'Edit Location'}</h1>
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
            
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="coverImage">
                {t('coverImage') || 'Cover Image'}*
              </label>
              <ImageUploader
                currentImage={formData.coverImage}
                onImageChange={(url) => setFormData({...formData, coverImage: url})}
                label={t('coverImage') || 'Cover Image'}
              />
            </div>
          </div>
          
          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t('saveChanges') || 'Save Changes'}
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
