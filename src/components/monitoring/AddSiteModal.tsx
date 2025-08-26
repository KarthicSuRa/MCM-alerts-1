import React, { useState, useEffect } from 'react';
import { COUNTRY_NAMES } from '../../types';

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (siteData: {
    name: string;
    url: string;
    description: string;
    country: string;
    check_interval: number;
    timeout_seconds: number;
    expected_status_code: number;
    tags: string[];
  }) => Promise<void>;
}

export const AddSiteModal: React.FC<AddSiteModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    country: '',
    check_interval: 300,
    timeout_seconds: 30,
    expected_status_code: 200,
    tags: [] as string[]
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        url: '',
        description: '',
        country: '',
        check_interval: 300,
        timeout_seconds: 30,
        expected_status_code: 200,
        tags: []
      });
      setTagInput('');
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Site name is required';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = 'Please enter a valid URL';
      }
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    if (formData.check_interval < 60) {
      newErrors.check_interval = 'Check interval must be at least 60 seconds';
    }

    if (formData.timeout_seconds < 5 || formData.timeout_seconds > 300) {
      newErrors.timeout_seconds = 'Timeout must be between 5 and 300 seconds';
    }

    if (formData.expected_status_code < 100 || formData.expected_status_code > 599) {
      newErrors.expected_status_code = 'Status code must be between 100 and 599';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to add site:', error);
      setErrors({ submit: 'Failed to add site. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add New Site to Monitor
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Site Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  placeholder="My Website"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  placeholder="https://example.com"
                />
                {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                rows={3}
                placeholder="Optional description of the site"
              />
            </div>

            {/* Geographic Information */}
            <div className="border-t border-gray-200 dark:border-slate-600 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Location
              </h3>
              
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                >
                  <option value="">Select Country</option>
                  {Object.entries(COUNTRY_NAMES).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
                {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
              </div>
            </div>

            {/* Monitoring Configuration */}
            <div className="border-t border-gray-200 dark:border-slate-600 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Monitoring Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Check Interval
                  </label>
                  <select
                    value={formData.check_interval}
                    onChange={(e) => setFormData(prev => ({ ...prev, check_interval: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value={60}>1 minute</option>
                    <option value={300}>5 minutes</option>
                    <option value={600}>10 minutes</option>
                    <option value={1800}>30 minutes</option>
                    <option value={3600}>1 hour</option>
                  </select>
                  {errors.check_interval && <p className="text-red-500 text-sm mt-1">{errors.check_interval}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={formData.timeout_seconds}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeout_seconds: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                  {errors.timeout_seconds && <p className="text-red-500 text-sm mt-1">{errors.timeout_seconds}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expected Status Code
                  </label>
                  <select
                    value={formData.expected_status_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, expected_status_code: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value={200}>200 (OK)</option>
                    <option value={201}>201 (Created)</option>
                    <option value={202}>202 (Accepted)</option>
                    <option value={301}>301 (Moved Permanently)</option>
                    <option value={302}>302 (Found)</option>
                  </select>
                  {errors.expected_status_code && <p className="text-red-500 text-sm mt-1">{errors.expected_status_code}</p>}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="border-t border-gray-200 dark:border-slate-600 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Tags (Optional)
              </h3>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">{errors.submit}</p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-slate-600">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding Site...' : 'Add Site'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
