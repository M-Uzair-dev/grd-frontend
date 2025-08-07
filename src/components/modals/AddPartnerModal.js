'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthCookies } from '@/utils/auth';
import { fetchWithAuth } from '@/utils/apiHandler';
import Modal from './Modal';
import FormField from '../FormField';

export default function AddPartnerModal({ isOpen, onClose, onSuccess }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    personName: '',
    personContact: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const { token } = getAuthCookies();
      const newPartner = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/partners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          personName: formData.personName,
          personContact: formData.personContact
        })
      }, router);

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        personName: '',
        personContact: ''
      });
      
      onSuccess(newPartner);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Partner"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 p-4 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        <FormField
          label="Company Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <FormField
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <FormField
          label="Contact Person Name"
          name="personName"
          value={formData.personName}
          onChange={handleChange}
          placeholder="Optional"
        />

        <FormField
          label="Contact Number"
          name="personContact"
          value={formData.personContact}
          onChange={handleChange}
          placeholder="Optional"
        />

        <FormField
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <FormField
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`
              px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              ${loading ? 'opacity-75 cursor-not-allowed' : ''}
            `}
          >
            {loading ? 'Creating...' : 'Create Partner'}
          </button>
        </div>
      </form>
    </Modal>
  );
} 