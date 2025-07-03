'use client';

import { useState } from 'react';
import { getAuthCookies } from '@/utils/auth';
import Modal from './Modal';
import FormField from '../FormField';
import Button from '../Button';

export default function AddCustomerModal({ show, onClose, onSuccess, partners }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    partnerId: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.errors) {
          setErrors(data.errors);
        } else {
          throw new Error(data.message || 'Failed to create customer');
        }
        return;
      }

      setFormData({ name: '', email: '', partnerId: '' });
      onSuccess();
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Add New Customer"
      loading={loading}
      footer={
        <Button
          type="submit"
          form="add-customer-form"
          variant="primary"
          isLoading={loading}
        >
          Create Customer
        </Button>
      }
    >
      <form id="add-customer-form" onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="bg-red-50 p-4 rounded-lg text-red-600 text-sm">
            {errors.submit}
          </div>
        )}

        <FormField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <FormField
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Partner
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            name="partnerId"
            value={formData.partnerId}
            onChange={handleChange}
            className={`
              block w-full px-4 py-2.5 rounded-lg border-gray-300 shadow-sm
              focus:border-blue-500 focus:ring-blue-500 sm:text-sm
              ${errors.partnerId ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : ''}
            `}
            required
          >
            <option value="">Select a partner</option>
            {partners?.map(partner => (
              <option key={partner._id} value={partner._id}>
                {partner.name}
              </option>
            ))}
          </select>
          {errors.partnerId && (
            <p className="mt-2 text-sm text-red-600">{errors.partnerId}</p>
          )}
        </div>
      </form>
    </Modal>
  );
}