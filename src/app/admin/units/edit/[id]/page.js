'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthCookies } from '@/utils/auth';
import FormField from '@/components/FormField';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function EditUnit({ params }) {
  const router = useRouter();
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [partners, setPartners] = useState([]);

  const [formData, setFormData] = useState({
    unitName: '',
    customerId: '',
    partnerId: ''
  });

  useEffect(() => {
    fetchUnit();
    fetchPartners();
  }, []);

  const fetchUnit = async () => {
    try {
      const { token } = getAuthCookies();
      if (!token) {
        setError('Please log in again');
        router.push('/admin');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        setError('Session expired. Please log in again');
        router.push('/admin');
        return;
      }
      
      if (response.status === 403) {
        setError('You do not have permission to access this resource');
        router.push('/admin/dashboard');
        return;
      }
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch unit');
      }
      
      const data = await response.json();
      if (!data.unitName || (!data.customerId && !data.partnerId)) {
        throw new Error('Invalid unit data received');
      }
      setUnit(data);
      setFormData({
        unitName: data.unitName,
        customerId: data.customerId?._id || '',
        partnerId: data.partnerId?._id || ''
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching unit:', err);
      setError(err.message || 'Error fetching unit. Please try again.');
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const { token } = getAuthCookies();
      if (!token) return;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/partners/nested`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPartners(data);
      }
    } catch (err) {
      console.error('Error fetching partners:', err);
    }
  };

  // Update customers when partner changes
  useEffect(() => {
    if (formData.partnerId) {
      const selectedPartner = partners.find(p => p._id === formData.partnerId);
      setCustomers(selectedPartner?.customers || []);
      // Clear customer selection when partner changes
      setFormData(prev => ({ ...prev, customerId: '' }));
    } else {
      setCustomers([]);
      setFormData(prev => ({ ...prev, customerId: '' }));
    }
  }, [formData.partnerId, partners]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});
    try {
      const { token } = getAuthCookies();
      if (!token) {
        setError('Please log in again');
        router.push('/admin');
        return;
      }
      // Validate form data
      if (!formData.unitName.trim()) {
        setFormErrors({ unitName: 'Unit name is required' });
        setSaving(false);
        return;
      }
      if (!formData.partnerId) {
        setFormErrors({ partnerId: 'Partner selection is required' });
        setSaving(false);
        return;
      }
      // Prepare payload
      const payload = {
        unitName: formData.unitName,
        customerId: formData.customerId || undefined,
        partnerId: formData.partnerId
      };
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (response.status === 401) {
        setError('Session expired. Please log in again');
        router.push('/admin');
        return;
      }
      if (response.status === 403) {
        setError('You do not have permission to update this unit');
        setSaving(false);
        return;
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update unit');
      }
      const data = await response.json();
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Error updating unit:', err);
      setError(err.message || 'Error updating unit. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div className="h-full flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (error) return (
    <div className="bg-red-50 p-4 rounded-lg text-red-600 flex items-center">
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
      </svg>
      {error}
    </div>
  );
  if (!unit) return null;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Edit Unit</h1>
          <p className="mt-1 text-sm text-gray-500">Update the unit details below.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="Unit Name"
            name="unitName"
            value={formData.unitName}
            onChange={handleChange}
            required
            error={formErrors.unitName}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partner <span className="text-red-500">*</span>
              </label>
              <select
                name="partnerId"
                value={formData.partnerId}
                onChange={handleChange}
                required
                className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a partner</option>
                {partners.map(partner => (
                  <option key={partner._id} value={partner._id}>{partner.name}</option>
                ))}
              </select>
              {formErrors.partnerId && <div className="text-red-500 text-sm mt-1">{formErrors.partnerId}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer <span className="text-gray-400">(Optional)</span>
              </label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                disabled={!formData.partnerId}
                className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a customer (or leave blank for direct to partner)</option>
                {customers.map(customer => (
                  <option key={customer._id} value={customer._id}>{customer.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 