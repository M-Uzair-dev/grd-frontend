'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthCookies } from '@/utils/auth';
import Button from '../Button';
import LoadingSpinner from '../LoadingSpinner';

export default function CustomerInfo({ customerId, onDelete }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const { token } = getAuthCookies();
        
        // Get customer details with units
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/${customerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch customer details');
        }

        const data = await response.json();
        setCustomer(data);
      } catch (err) {
        console.error('Error in CustomerInfo:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomerDetails();
    }
  }, [customerId]);

  const handleEdit = () => {
    router.push(`/admin/customers/edit/${customerId}`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this customer? This will also delete all associated units and reports.')) return;

    setIsDeleting(true);
    setError('');

    try {
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete customer');
      }

      onDelete();
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError(err.message || 'Failed to delete customer. Please try again.');
    } finally {
      setIsDeleting(false);
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
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Customer Details</h2>
        <div className="space-x-3">
          <Button
            variant="primary"
            size="sm"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
            onClick={handleEdit}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            }
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Name</label>
            <p className="mt-1 text-gray-900 font-medium">{customer.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="mt-1 text-gray-900">{customer.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Partner</label>
            <p className="mt-1 text-gray-900">{customer.partnerId?.name}</p>
          </div>
        </div>

        <div>
          <div>
            <label className="text-sm font-medium text-gray-500">Total Units</label>
            <p className="mt-1 text-gray-900 font-medium">{customer.units?.length || 0}</p>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-500">Created At</label>
            <p className="mt-1 text-gray-900">{new Date(customer.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {customer.units?.length > 0 && (
        <div className="pt-6 border-t">
          <label className="text-sm font-medium text-gray-500 block mb-3">Units</label>
          <div className="bg-gray-50 rounded-lg divide-y divide-gray-100">
            {customer.units.map(unit => (
              <div key={unit._id || unit.id} className="p-4 hover:bg-gray-100 transition-colors duration-150">
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
    </div>
  );
} 