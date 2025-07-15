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
  const [newFiles, setNewFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState(new Set());
  const [fileActionLoading, setFileActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    reportNumber: '',
    vnNumber: '',
    adminNote: '',
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

  const fetchUnits = async (customerId, partnerId) => {
    try {
      const { token } = getAuthCookies();
      let response;
      
      if (customerId) {
        // Fetch customer units
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units/customer/${customerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else if (partnerId) {
        // Fetch partner units
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units/partner/${partnerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        setUnits([]);
        return;
      }
      
      if (!response.ok) throw new Error('Failed to fetch units');
      
      const data = await response.json();
      setUnits(data);
    } catch (err) {
      console.error('Error fetching units:', err);
      setUnits([]);
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
        await fetchUnits(data.customerId._id, data.partnerId?._id);
      }

      setLoading(false);
    } catch (err) {
      setError('Error fetching report');
      setLoading(false);
    }
  };

  const handleFileAdd = (e) => {
    const addedFiles = Array.from(e.target.files);
    setNewFiles(prev => [...prev, ...addedFiles]);
    e.target.value = ''; // Reset input
  };

  const handleFileRemove = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleExistingFileRemove = async (fileId) => {
    const confirmDelete = window.confirm('Are you sure you want to remove this file? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      setFileActionLoading(true);
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${params.id}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      // Update the report state to remove the deleted file
      setReport(prev => ({
        ...prev,
        files: prev.files.filter(f => f._id !== fileId)
      }));
    } catch (err) {
      setError('Failed to delete file. Please try again.');
    } finally {
      setFileActionLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { token } = getAuthCookies();

      // First, update the report details
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update report');
      }

      // If there are new files, upload them
      if (newFiles.length > 0) {
        const formDataFiles = new FormData();
        newFiles.forEach(file => {
          formDataFiles.append('files', file);
        });

        const fileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${params.id}/files`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataFiles
        });

        if (!fileResponse.ok) {
          throw new Error('Failed to upload new files');
        }
      }

      router.push('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        // Also fetch partner units if no customer is selected
        await fetchUnits(null, value);
      }
    } else if (name === 'customerId') {
      setFormData(prev => ({
        ...prev,
        unitId: ''
      }));
      setUnits([]);
      if (value) {
        await fetchUnits(value, null);
      } else if (formData.partnerId) {
        // If customer is cleared but partner is selected, fetch partner units
        await fetchUnits(null, formData.partnerId);
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
      const unitData = {
        unitName: newUnitName
      };

      // Add either customerId or partnerId based on what's selected
      if (formData.customerId) {
        unitData.customerId = formData.customerId;
      } else if (formData.partnerId) {
        unitData.partnerId = formData.partnerId;
      } else {
        setUnitError('Please select either a customer or partner first');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(unitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create unit');
      }

      // Add new unit to the list and select it
      const newUnit = {
        _id: data.unit._id,
        unitName: data.unit.unitName,
        customerId: formData.customerId || null,
        partnerId: formData.partnerId || null
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
                Customer <span className="text-gray-400">(Optional)</span>
              </label>
              <select
                value={formData.customerId}
                onChange={handleChange}
                name="customerId"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                disabled={!formData.partnerId}
              >
                <option value="">Select Customer (or leave blank for direct to partner)</option>
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
                  disabled={!formData.customerId && !formData.partnerId}
                >
                  <option value="">No Unit (Direct to {formData.customerId ? 'Customer' : 'Partner'})</option>
                  {units.map(unit => (
                    <option key={unit._id} value={unit._id}>
                      {unit.unitName}
                    </option>
                  ))}
                </select>
                {(formData.customerId || formData.partnerId) && (
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

          {/* Modal for creating new unit */}
          {showNewUnit && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Create New Unit {formData.customerId ? 'to Customer' : 'to Partner'}
                </h3>
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

          {/* Files Section */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900">Files</h3>
            
            {/* Existing Files */}
            {report?.files && report.files.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700">Current Files:</h4>
                <ul className="mt-2 divide-y divide-gray-200">
                  {report.files.map((file) => (
                    <li key={file._id} className="py-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded on {new Date(file.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleExistingFileRemove(file._id)}
                        disabled={fileActionLoading}
                        icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        }
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Add New Files */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700">Add New Files:</h4>
              <div className="mt-2 space-y-4">
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => document.getElementById('file-upload').click()}
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    }
                  >
                    Add File
                  </Button>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileAdd}
                    multiple
                  />
                </div>

                {newFiles.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">New Files to Upload:</h4>
                    <ul className="space-y-2">
                      {newFiles.map((file, index) => (
                        <li key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-gray-600">{file.name}</span>
                            <span className="ml-2 text-xs text-gray-400">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleFileRemove(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
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
              onClick={handleSubmit}
              disabled={loading || fileActionLoading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}