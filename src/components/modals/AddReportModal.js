'use client';

import { useState, useEffect } from 'react';
import { getAuthCookies } from '@/utils/auth';
import Modal from './Modal';
import Button from '../Button';
import FormField from '../FormField';

export default function AddReportModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    reportNumber: '',
    vnNumber: '',
    files: [],
    adminNote: '',
    partnerId: '',
    customerId: '',
    unitId: '',
    status: 'Active'
  });

  const [partners, setPartners] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [units, setUnits] = useState([]);
  const [showNewUnit, setShowNewUnit] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unitError, setUnitError] = useState('');

  // Fetch partners on mount
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { token } = getAuthCookies();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/partners/nested`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });


        if (!response.ok) {
          throw new Error('Failed to fetch partners');
        }

        const data = await response.json();
        setPartners(data);
      } catch (err) {
        console.error('Error fetching partners:', err);
        setError(err.message);
      }
    };

    if (isOpen) {
      fetchPartners();
    }
  }, [isOpen]);

  // Update customers when partner changes
  useEffect(() => {
    if (formData.partnerId) {
      const selectedPartner = partners.find(p => p._id === formData.partnerId);
      setCustomers(selectedPartner?.customers || []);
      setFormData(prev => ({ ...prev, customerId: '', unitId: '' }));
      setUnits([]);
    } else {
      setCustomers([]);
      setUnits([]);
    }
  }, [formData.partnerId, partners]);

  // Update units when customer changes or when partner changes (for partner-level units)
  useEffect(() => {
    const fetchUnits = async () => {
      if (formData.customerId) {
        // Fetch customer units
        try {
          const { token } = getAuthCookies();
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units/customer/${formData.customerId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch units');
          }

          const data = await response.json();
          setUnits(data);
        } catch (err) {
          console.error('Error fetching units:', err);
          setUnits([]);
        }
      } else if (formData.partnerId) {
        // Fetch partner units
        try {
          const { token } = getAuthCookies();
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units/partner/${formData.partnerId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch partner units');
          }

          const data = await response.json();
          setUnits(data);
        } catch (err) {
          console.error('Error fetching partner units:', err);
          setUnits([]);
        }
      } else {
        setUnits([]);
      }
      setFormData(prev => ({ ...prev, unitId: '' }));
    };

    fetchUnits();
  }, [formData.customerId, formData.partnerId]);

  const handleCreateUnit = async (e) => {
    e.preventDefault();
    setUnitError('');

    const cleanedCustomerId = formData.customerId?.trim();
    const cleanedPartnerId = formData.partnerId?.trim();

    const unitData = {
      unitName: newUnitName
    };

    if (cleanedCustomerId) {
      unitData.customerId = cleanedCustomerId;
    } else if (cleanedPartnerId) {
      unitData.partnerId = cleanedPartnerId;
    } else {
      setUnitError('Please select either a customer or partner first');
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
        body: JSON.stringify(unitData),
      });

      const data = await response.json();
      console.log("data", data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create unit');
      }

      // Extract the unit data from the response
      const newUnit = {
        _id: data.unit._id,
        unitName: data.unit.unitName,
        customerId: formData.customerId && formData.customerId !== '' ? formData.customerId : null,
        partnerId: formData.partnerId || null
      };

      // Add new unit to the list and select it
      setUnits(prev => [...prev, newUnit]);
      setFormData(prev => ({ ...prev, unitId: newUnit._id }));
      setShowNewUnit(false);
      setNewUnitName('');
      setUnitError('');

      // Don't call onSuccess here to prevent modal closing
      // Instead, we'll call it when the report is created
    } catch (err) {
      setUnitError(err.message);
    }
  };

  const handleSubmit = async (e, sendEmail = true) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.reportNumber || !formData.vnNumber || !formData.partnerId || formData.files.length === 0) {
        throw new Error('Please fill in all required fields (Report Number, VN Number, Partner, and at least one file)');
      }

      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'files' && formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append all files
      formData.files.forEach(file => {
        formDataToSend.append('files', file);
      });

      // Add sendEmail parameter
      formDataToSend.append('sendEmail', sendEmail);

      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend,
      });

      const data = await response.json();
      console.log(response)

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create report');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.log(err)
      console.error('Report creation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (name === 'reportNumber') {
      // Remove any existing WO prefix and trim whitespace
      let cleanNumber = value.replace(/^WO[-\s]*/, '').trim();
      // Add WO prefix if it's not empty
      const formattedNumber = cleanNumber ? `WO${cleanNumber}` : '';
      setFormData(prev => ({
        ...prev,
        [name]: formattedNumber
      }));
    } else if (name === 'files') {
      setFormData(prev => ({
        ...prev,
        files: Array.from(files)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'file' ? files[0] : value
      }));
    }
  };

  const handleFileAdd = (e) => {
    const newFiles = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
    // Reset the input value so the same file can be selected again if needed
    e.target.value = '';
  };

  const handleFileRemove = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== indexToRemove)
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Report">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 p-4 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="partnerId" className="block text-sm font-medium text-gray-700">
            Partner
          </label>
          <select
            id="partnerId"
            name="partnerId"
            value={formData.partnerId}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a partner</option>
            {partners.map(partner => (
              <option key={partner._id} value={partner._id}>
                {partner.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
            Customer <span className="text-gray-400">(Optional)</span>
          </label>
          <select
            id="customerId"
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
            disabled={!formData.partnerId}
            className="mt-1 block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a customer (or leave blank for direct to partner)</option>
            {customers.map(customer => (
              <option key={customer._id} value={customer._id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        {(formData.customerId || formData.partnerId) && (
          <div>
            <label htmlFor="unitId" className="block text-sm font-medium text-gray-700">
              Unit (Optional)
            </label>
            <div className="mt-1 flex gap-2">
              <select
                id="unitId"
                name="unitId"
                value={formData.unitId}
                onChange={handleChange}
                className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">No unit (Direct to {formData.customerId ? 'customer' : 'partner'})</option>
                {units.map(unit => (
                  <option key={unit._id} value={unit._id}>
                    {unit.unitName}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewUnit(true)}
                className="px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
              >
                +
              </button>
            </div>
          </div>
        )}

        {showNewUnit && (
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Add New Unit {formData.customerId ? 'to Customer' : 'to Partner'}
            </h4>
            <div className="space-y-2">
              <input
                type="text"
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                placeholder="Enter unit name"
                className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {unitError && <div className="text-red-500 text-sm">{unitError}</div>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateUnit}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
                >
                  Add Unit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewUnit(false);
                    setNewUnitName('');
                    setUnitError('');
                  }}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="reportNumber" className="block text-sm font-medium text-gray-700">
            Report Number <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative">
            <input
              type="text"
              id="reportNumber"
              name="reportNumber"
              value={formData.reportNumber}
              onChange={handleChange}
              required
              placeholder="WO will be automatically added"
              className="block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            The prefix "WO" will be automatically added
          </p>
        </div>

        <div>
          <label htmlFor="vnNumber" className="block text-sm font-medium text-gray-700">
            VN Number
          </label>
          <input
            type="text"
            id="vnNumber"
            name="vnNumber"
            value={formData.vnNumber}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Upload Files
          </label>
          <div className="mt-1 space-y-2">
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

            {formData.files.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Files:</h4>
                <ul className="space-y-2">
                  {formData.files.map((file, index) => (
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

        <div>
          <label htmlFor="adminNote" className="block text-sm font-medium text-gray-700">
            Admin Note
          </label>
          <textarea
            id="adminNote"
            name="adminNote"
            value={formData.adminNote}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="Active">Active</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            disabled={loading}
            className={`
              px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md
              hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
              ${loading ? 'opacity-75 cursor-not-allowed' : ''}
            `}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            className={`
              px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              ${loading ? 'opacity-75 cursor-not-allowed' : ''}
            `}
          >
            {loading ? 'Creating...' : 'Create with Email'}
          </button>
        </div>
      </form>
    </Modal>
  );
} 