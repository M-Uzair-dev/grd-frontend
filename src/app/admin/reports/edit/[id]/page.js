'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthCookies } from '@/utils/auth';
import Button from '@/components/Button';
import FormField from '@/components/FormField';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function EditReport({ params }) {
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [partners, setPartners] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [units, setUnits] = useState([]);
  const [showNewUnit, setShowNewUnit] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [unitError, setUnitError] = useState('');

  const [formData, setFormData] = useState({
    reportNumber: '',
    vnNumber: '',
    adminNote: '',
    partnerNote: '',
    status: '',
    partnerId: '',
    customerId: '',
    unitId: ''
  });

  useEffect(() => {
    fetchReport();
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/partners`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch partners');
      
      const data = await response.json();
      setPartners(data);
    } catch (err) {
      console.error('Error fetching partners:', err);
    }
  };

  const fetchCustomers = async (partnerId) => {
    try {
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customers/partner/${partnerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch customers');
      
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchUnits = async (customerId) => {
    try {
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units/customer/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch units');
      
      const data = await response.json();
      setUnits(data);
    } catch (err) {
      console.error('Error fetching units:', err);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch report');
      
      const data = await response.json();
      setReport(data);
      setFormData({
        reportNumber: data.reportNumber,
        vnNumber: data.vnNumber,
        adminNote: data.adminNote || '',
        partnerNote: data.partnerNote || '',
        status: data.status,
        partnerId: data.partnerId?._id || '',
        customerId: data.customerId?._id || '',
        unitId: data.unitId?._id || ''
      });

      // Fetch related data if IDs exist
      if (data.partnerId?._id) {
        await fetchCustomers(data.partnerId._id);
      }
      if (data.customerId?._id) {
        await fetchUnits(data.customerId._id);
      }

      setLoading(false);
    } catch (err) {
      setError('Error fetching report');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update report');

      router.push('/admin/dashboard');
    } catch (err) {
      setError('Error updating report');
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Handle cascading selects
    if (name === 'partnerId') {
      setFormData(prev => ({
        ...prev,
        customerId: '',
        unitId: ''
      }));
      setCustomers([]);
      setUnits([]);
      if (value) {
        await fetchCustomers(value);
      }
    } else if (name === 'customerId') {
      setFormData(prev => ({
        ...prev,
        unitId: ''
      }));
      setUnits([]);
      if (value) {
        await fetchUnits(value);
      }
    }
  };

  const handleCreateUnit = async () => {
    setUnitError('');

    if (!newUnitName.trim()) {
      setUnitError('Unit name is required');
      return;
    }

    try {
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          unitName: newUnitName,
          customerId: formData.customerId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create unit');
      }

      // Add new unit to the list and select it
      const newUnit = {
        _id: data.unit._id,
        unitName: data.unit.unitName,
        customerId: formData.customerId
      };

      setUnits(prev => [...prev, newUnit]);
      setFormData(prev => ({ ...prev, unitId: newUnit._id }));
      setShowNewUnit(false);
      setNewUnitName('');
      setUnitError('');
    } catch (err) {
      setUnitError(err.message);
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
  if (!report) return null;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Edit Report</h1>
          <p className="mt-1 text-sm text-gray-500">Update the report details below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              label="Report Number"
              name="reportNumber"
              value={formData.reportNumber}
              onChange={handleChange}
              required
            />

            <FormField
              label="VN Number"
              name="vnNumber"
              value={formData.vnNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partner
              </label>
              <select
                value={formData.partnerId}
                onChange={handleChange}
                name="partnerId"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select Partner</option>
                {partners.map(partner => (
                  <option key={partner._id} value={partner._id}>
                    {partner.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer
              </label>
              <select
                value={formData.customerId}
                onChange={handleChange}
                name="customerId"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
                disabled={!formData.partnerId}
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit (Optional)
              </label>
              <div className="flex space-x-2">
                <select
                  value={formData.unitId}
                  onChange={handleChange}
                  name="unitId"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  disabled={!formData.customerId}
                >
                  <option value="">No Unit (Direct to Customer)</option>
                  {units.map(unit => (
                    <option key={unit._id} value={unit._id}>
                      {unit.unitName}
                    </option>
                  ))}
                </select>
                {formData.customerId && (
                  <button
                    type="button"
                    onClick={() => setShowNewUnit(true)}
                    className="mt-1 px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    +
                  </button>
                )}
              </div>
              {unitError && (
                <p className="mt-1 text-sm text-red-600">{unitError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={handleChange}
                name="status"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="Active">Active</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Note
            </label>
            <textarea
              value={formData.adminNote}
              onChange={handleChange}
              name="adminNote"
              rows={4}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Partner Note
            </label>
            <textarea
              value={formData.partnerNote}
              onChange={handleChange}
              name="partnerNote"
              rows={4}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          {/* Modal for creating new unit */}
          {showNewUnit && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Unit</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Name
                  </label>
                  <input
                    type="text"
                    value={newUnitName}
                    onChange={(e) => setNewUnitName(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    placeholder="Enter unit name"
                  />
                  {unitError && (
                    <p className="mt-1 text-sm text-red-600">{unitError}</p>
                  )}
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewUnit(false);
                      setNewUnitName('');
                      setUnitError('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateUnit}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create
                  </button>
                </div>
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
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}