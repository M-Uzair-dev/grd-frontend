'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthCookies } from '@/utils/auth';
import Button from '../Button';
import LoadingSpinner from '../LoadingSpinner';

export default function ReportInfo({ reportId, onDelete }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        const { token } = getAuthCookies();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch report details');
        }

        const data = await response.json();
        setReport(data);
      } catch (err) {
        console.error('Error in ReportInfo:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReportDetails();
    }
  }, [reportId]);

  const handleEdit = () => {
    router.push(`/admin/reports/edit/${reportId}`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    setIsDeleting(true);
    setError('');

    try {
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete report');
      }

      onDelete();
    } catch (err) {
      console.error('Error deleting report:', err);
      setError(err.message || 'Failed to delete report. Please try again.');
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
  if (!report) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Report Details</h2>
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
            disabled={isDeleting}
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
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Report Number</label>
            <p className="mt-1 text-gray-900 font-medium">{report.reportNumber}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">VN Number</label>
            <p className="mt-1 text-gray-900 font-medium">{report.vnNumber}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <span className={`
                inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${report.status === 'Active' ? 'bg-green-100 text-green-800' :
                  report.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'}
              `}>
                <span className={`
                  w-2 h-2 rounded-full mr-2
                  ${report.status === 'Active' ? 'bg-green-400' :
                    report.status === 'Rejected' ? 'bg-red-400' :
                    'bg-blue-400'}
                `}></span>
                {report.status}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Partner</label>
            <p className="mt-1 text-gray-900">{report.partnerId?.name} ({report.partnerId?.email})</p>
          </div>
          {report.unitId && (
            <div>
              <label className="text-sm font-medium text-gray-500">Unit</label>
              <p className="mt-1 text-gray-900">{report.unitId.unitName}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-500">Created At</label>
            <p className="mt-1 text-gray-900">{new Date(report.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t">
        <div>
          <label className="text-sm font-medium text-gray-500">Admin Note</label>
          <p className="mt-1 text-gray-900 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
            {report.adminNote || 'No admin note'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Partner Note</label>
          <p className="mt-1 text-gray-900 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
            {report.partnerNote || 'No partner note'}
          </p>
        </div>
      </div>

      <div className="pt-6 border-t">
        <label className="text-sm font-medium text-gray-500">PDF File</label>
        <div className="mt-2">
          <Button
            variant="outline"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/${report.pdfFile}`, '_blank')}
          >
            View PDF
          </Button>
        </div>
      </div>
    </div>
  );
} 