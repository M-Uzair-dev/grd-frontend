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

  const [formData, setFormData] = useState({
    unitName: '',
    customerId: ''
  });

  useEffect(() => {
    fetchUnit();
    fetchCustomers();
  }, []);

  const fetchUnit = async () => {
    try {
      const { token } = getAuthCookies();
      if (!token) {
        setError('Please log in again');
        router.push('/admin-login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        setError('Session expired. Please log in again');
        router.push('/admin-login');
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
      if (!data.unitName || !data.customerId) {
        throw new Error('Invalid unit data received');
      }
      
      setUnit(data);
      setFormData({
        unitName: data.unitName,
        customerId: data.customerId._id
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching unit:', err);
      setError(err.message || 'Error fetching unit. Please try again.');
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { token } = getAuthCookies();
      if (!token) {
        setError('Please log in again');
        router.push('/admin-login');
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        setError('Session expired. Please log in again');
        router.push('/admin-login');
        return;
      }
      
      if (response.status === 403) {
        setError('You do not have permission to access this resource');
        router.push('/admin/dashboard');
        return;
      }
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch customers');
      }
      
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.message || 'Error fetching customers. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});
    
    try {
      const { token } = getAuthCookies();
      if (!token) {
        setError('Please log in again');
        router.push('/admin-login');
        return;
      }

      // Validate form data
      if (!formData.unitName.trim()) {
        setFormErrors({ unitName: 'Unit name is required' });
        return;
      }
      if (!formData.customerId) {
        setFormErrors({ customerId: 'Please select a customer' });
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.status === 401) {
        setError('Session expired. Please log in again');
        router.push('/admin-login');
        return;
      }

      if (response.status === 403) {
        setError('You do not have permission to update this unit');
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update unit');
      }

      const data = await response.json();
      console.log('Unit updated successfully:', data);
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
          <div className="grid grid-cols-1 gap-6">
            <FormField
              label="Unit Name"
              name="unitName"
              value={formData.unitName}
              onChange={handleChange}
              error={formErrors.unitName}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer
              </label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
              {formErrors.customerId && (
                <p className="mt-2 text-sm text-red-600">{formErrors.customerId}</p>
              )}
            </div>
          </div>

          {unit.reports?.length > 0 && (
            <div className="pt-6 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-3">Reports</label>
              <div className="bg-gray-50 rounded-lg divide-y divide-gray-100">
                {unit.reports.map(report => (
                  <div key={report._id} className="p-4 hover:bg-gray-100 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Report #{report.reportNumber}</h3>
                        <p className="text-sm text-gray-600 mt-1">VN: {report.vnNumber}</p>
                      </div>
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full border">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={saving}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 