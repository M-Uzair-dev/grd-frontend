'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthCookies } from '@/utils/auth';
import Button from '@/components/Button';
import FormField from '@/components/FormField';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function EditCustomer({ params }) {
  const [customer, setCustomer] = useState(null);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { token } = getAuthCookies();
        
        // Fetch customer details
        const customerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!customerResponse.ok) {
          throw new Error('Failed to fetch customer');
        }

        const customerData = await customerResponse.json();
        setCustomer(customerData);

        // Fetch partners list
        const partnersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/partners`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!partnersResponse.ok) {
          throw new Error('Failed to fetch partners');
        }

        const partnersData = await partnersResponse.json();
        setPartners(partnersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});

    try {
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: customer.name,
          email: customer.email,
          partnerId: customer.partnerId
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.errors) {
          setFormErrors(data.errors);
        } else {
          throw new Error(data.message || 'Failed to update customer');
        }
        return;
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
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
  if (!customer) return null;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Edit Customer</h1>
          <p className="mt-1 text-sm text-gray-500">Update the customer details below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              label="Name"
              name="name"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              error={formErrors.name}
              required
            />

            <FormField
              label="Email"
              type="email"
              name="email"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              error={formErrors.email}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Partner
            </label>
            <select
              value={customer.partnerId}
              onChange={(e) => setCustomer({ ...customer, partnerId: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Select a partner</option>
              {partners.map(partner => (
                <option key={partner._id} value={partner._id}>
                  {partner.name} ({partner.email})
                </option>
              ))}
            </select>
            {formErrors.partnerId && (
              <p className="mt-2 text-sm text-red-600">{formErrors.partnerId}</p>
            )}
          </div>

          {customer.units?.length > 0 && (
            <div className="pt-6 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-3">Units</label>
              <div className="bg-gray-50 rounded-lg divide-y divide-gray-100">
                {customer.units.map(unit => (
                  <div key={unit._id} className="p-4 hover:bg-gray-100 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{unit.unitName}</h3>
                        {unit.reports?.length > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            {unit.reports.length} Report{unit.reports.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full border">
                        {new Date(unit.createdAt).toLocaleDateString()}
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