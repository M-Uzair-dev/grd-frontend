import { useState } from 'react';
import { getAuthCookies } from '@/utils/auth';
import Modal from './Modal';
import Button from '../Button';

export default function AddPartnerUnitModal({ isOpen, onClose, onSuccess, partnerId }) {
  const [unitName, setUnitName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!unitName.trim()) {
        throw new Error('Unit name is required');
      }

      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units/partner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          unitName: unitName.trim(),
          partnerId: partnerId
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create unit');
      }

      setUnitName('');
      onSuccess && onSuccess(data.unit || data);
      onClose && onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Unit to Partner">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 p-4 rounded-md text-red-600 text-sm">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700">Unit Name</label>
          <input
            type="text"
            value={unitName}
            onChange={e => setUnitName(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
} 