'use client';

import { useState } from 'react';
import { getAuthCookies } from '@/utils/auth';
import Modal from './Modal';
import FormField from '../FormField';
import Button from '../Button';

export default function AddPartnerModal({ show, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/partners`, {
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
          throw new Error(data.message || 'Failed to create partner');
        }
        return;
      }

      setFormData({ name: '', email: '', password: '' });
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
      title="Add New Partner"
      loading={loading}
      footer={
        <Button
          type="submit"
          form="add-partner-form"
          variant="primary"
          isLoading={loading}
        >
          Create Partner
        </Button>
      }
    >
      <form id="add-partner-form" onSubmit={handleSubmit} className="space-y-4">
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

        <FormField
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />
      </form>
    </Modal>
  );
} 