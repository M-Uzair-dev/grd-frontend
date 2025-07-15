'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthCookies } from '@/utils/auth';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

export default function UnitInfo({ unitId, onDelete, isPartnerView = false }) {
  const router = useRouter();
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchUnit();
  }, [unitId]);

  const fetchUnit = async () => {
      try {
      setLoading(true);
        const { token } = getAuthCookies();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units/${unitId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
        throw new Error('Failed to fetch unit');
        }

        const data = await response.json();
        setUnit(data);
        console.log("data", data)
      setError('');
      } catch (err) {
        console.error('Error in UnitInfo:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
  };

  const handleDelete = async () => {
    try {
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/units/${unitId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete unit');
      }

      onDelete();
    } catch (err) {
      console.error('Error deleting unit:', err);
      setError(err.message);
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
  if (!unit) return null;

  return (
    <div className="bg-white shadow rounded-lg mt-[50px] lg:mt-0 w-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center flex-col sm:flex-row gap-4 sm:gap-2">
          <h2 className="text-xl font-semibold text-gray-800 w-full sm:w-auto">Unit Information</h2>
          {!isPartnerView && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="primary"
                onClick={() => router.push(`/admin/units/edit/${unitId}`)}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                }
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                }
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Unit Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{unit.unitName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              {unit.customerId ? 'Customer' : 'Partner'}
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {unit.customerId ? (
                <>
                  <div>{unit.customerId.name}</div>
                  <div className="text-gray-500 text-xs">{unit.customerId.email}</div>
                </>
              ) : unit.partnerId ? (
                <>
                  <div>{unit.partnerId.name}</div>
                  <div className="text-gray-500 text-xs">{unit.partnerId.email}</div>
                </>
              ) : (
                <span className="text-gray-500">N/A</span>
              )}
            </dd>
          </div>
          {unit.customerId && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Partner</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div>{unit.customerId.partnerId?.name || 'N/A'}</div>
                <div className="text-gray-500 text-xs">{unit.customerId.partnerId?.email || ''}</div>
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">Reports</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {unit.reports?.length > 0 ? (
                <ul className="space-y-1">
                  {unit.reports.map(report => (
                    <li key={report._id} className="flex items-center space-x-2">
                      <span className="font-medium">{report.reportNumber}</span>
                      <span className="text-gray-500">|</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        report.status === 'Active' ? 'bg-green-100 text-green-800' :
                        report.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status}
                      </span>
                      <span className="text-gray-500">|</span>
                      <span className="text-xs text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-500">No reports</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(unit.createdAt).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(unit.updatedAt).toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Unit"
        message="Are you sure you want to delete this unit? This action cannot be undone."
      />
    </div>
  );
}