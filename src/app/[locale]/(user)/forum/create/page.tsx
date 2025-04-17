'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { createBlog } from '@/api/forum';
import { toast } from 'react-toastify';
import data from '@/../data/data.json';
import { useAuth } from '@/context/AuthContext';

// Get categories and provinces from data.json
const { Category: categories, Province: provinces } = data;
const TinyMCEEditor = dynamic(() => import('@/components/TinymceEditor'), { ssr: false });

export default function CreateForumPost() {
  const t = useTranslations('Forum');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{ name: string }[]>([]);
  const [allLocations, setAllLocations] = useState<{ name: string }[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
  });
  const {user} = useAuth();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, title: e.target.value });
  };

  const handleContentChange = (content: string) => {
    setFormData({ ...formData, content });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Store category exactly as provided in the data.json file
    // The API will handle proper formatting (uppercase, etc)
    setFormData({ ...formData, category: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    // Make sure user is authenticated
    if (!user?.id) {
      setError('You must be logged in to create a blog post');
      toast.error('You must be logged in to create a blog post');
      return;
    }

    try {
      setIsSubmitting(true);

      const userId = user.id;

      // Prepare data for API - ensure locationIds is a valid array
      // even if it's empty, as the DTO expects it
      const blogDataToSubmit = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
      };

      const response = await createBlog(userId, blogDataToSubmit);
      console.log('Blog creation response:', response);
      if (response.statusCode && response.statusCode !== 201) {
        setError(response.message || 'Error creating blog post');
        toast.error(response.message || 'Error creating blog post');
        return;
      }

      toast.success('Your blog post has been published successfully!');
      router.push(`/forum/${response.id}`);
    } catch (err) {
      console.error('Blog creation error details:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('createPost') || 'Create New Post'}</h1>
        <Link href="/forum" className="text-blue-600 hover:underline">
          {t('backToList') || 'Back to list'}
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
                {t('title') || 'Title'}*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
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
                onChange={handleCategoryChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('selectCategory') || 'Select a category'}</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="content">
                {t('content') || 'Content'}*
              </label>
              <TinyMCEEditor
                value={formData.content}
                onChange={handleContentChange}
              />
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
                t('createPost') || 'Create Post'
              )}
            </button>
            <Link
              href="/forum"
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
