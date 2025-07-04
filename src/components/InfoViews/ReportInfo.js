'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthCookies } from '@/utils/auth';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

export default function ReportInfo({ reportId, onDelete }) {
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  const fetchReport = async () => {
      try {
      setLoading(true);
        const { token } = getAuthCookies();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
        throw new Error('Failed to fetch report');
        }

        const data = await response.json();
        setReport(data);
      setError('');
      } catch (err) {
        console.error('Error in ReportInfo:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
  };

  const handleDelete = async () => {
    try {
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      setShowDeleteModal(false);
      onDelete();
    } catch (err) {
      console.error('Error deleting report:', err);
      setError(err.message);
    }
  };

  const handleDownload = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportId}/download`, '_blank');
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
    <div className="bg-white shadow rounded-lg mt-[50px] lg:mt-0 w-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Report Information</h2>
          <div className="flex space-x-2">
          <Button
            variant="primary"
              onClick={handleDownload}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
          >
              Download
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
        </div>
      </div>
      <div className="p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Title</dt>
            <dd className="mt-1 text-sm text-gray-900">{report.title}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Unit</dt>
            <dd className="mt-1 text-sm text-gray-900">{report.unit?.name || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(report.createdAt).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(report.updatedAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          handleDelete();
          setShowDeleteModal(false);
        }}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
        confirmText="Delete Report"
        confirmColor="red"
      />
    </div>
  );
} 