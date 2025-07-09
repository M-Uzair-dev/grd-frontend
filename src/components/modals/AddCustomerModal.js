'use client';

import { useState } from 'react';
import { getAuthCookies } from '@/utils/auth';
import Modal from './Modal';
import FormField from '../FormField';

export default function AddCustomerModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create customer');
      }

      onSuccess();
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
      title="Add New Customer"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 p-4 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        <FormField
          label="Name"
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
          label="Phone"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />

        <FormField
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          multiline
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
            {loading ? 'Creating...' : 'Create Customer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}