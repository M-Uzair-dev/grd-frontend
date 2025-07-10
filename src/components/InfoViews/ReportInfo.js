'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthCookies } from '@/utils/auth';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import FormField from '@/components/FormField';

export default function ReportInfo({ reportId, onDelete, isPartnerView = false, onUpdate }) {
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendingToPartner, setSendingToPartner] = useState(false);
  const [partnerNote, setPartnerNote] = useState('');
  const [noteUpdated, setNoteUpdated] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  useEffect(() => {
    if (report?.partnerNote) {
      setPartnerNote(report.partnerNote);
    }
  }, [report]);

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

  const handleDownload = async (fileId) => {
    if (!report?.files?.length) return;
    
    try {
      setDownloading(fileId);
      const { token } = getAuthCookies();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportId}/download/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Get the file info from the report
      const fileInfo = report.files.find(f => f._id === fileId);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and click it
      const link = document.createElement('a');
      link.href = url;
      link.download = fileInfo.originalName;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const handleUpdateNote = async () => {
    try {
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportId}/partner-note`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ partnerNote })
      });

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      const data = await response.json();
      setReport(data.report);
      setNoteUpdated(true);
      setTimeout(() => setNoteUpdated(false), 3000);
    } catch (err) {
      console.error('Error updating note:', err);
      setError(err.message);
    }
  };

  const handleSendToCustomer = async () => {
    try {
      setSending(true);
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportId}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to send report');
      }

      const data = await response.json();
      setError('');
      alert('Report sent successfully to customer');
    } catch (err) {
      console.error('Error sending report:', err);
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      setMarkingAsRead(true);
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportId}/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark report as read');
      }

      const data = await response.json();
      setReport(data.report);
      setError('');
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Error marking report as read:', err);
      setError(err.message);
    } finally {
      setMarkingAsRead(false);
    }
  };

  const handleSendToPartner = async () => {
    try {
      setSendingToPartner(true);
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportId}/send-to-partner`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to send report to partner');
      }

      const data = await response.json();
      setError('');
      alert('Report sent successfully to partner');
    } catch (err) {
      console.error('Error sending report to partner:', err);
      setError(err.message);
    } finally {
      setSendingToPartner(false);
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
    <div className="bg-white shadow rounded-lg w-full h-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center flex-col sm:flex-row gap-4 sm:gap-2">
          <h2 className="text-xl font-semibold text-gray-800 w-full sm:w-auto">Report Information</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {!isPartnerView && (
              <>
                <Button
                  variant="secondary"
                  onClick={handleSendToPartner}
                  disabled={sendingToPartner}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                >
                  {sendingToPartner ? 'Sending...' : 'Send Email'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/admin/reports/edit/${reportId}`)}
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
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Report Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{report.reportNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">VN Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{report.vnNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900">{report.status}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Partner</dt>
            <dd className="mt-1 text-sm text-gray-900">{report.partnerId?.name || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Customer</dt>
            <dd className="mt-1 text-sm text-gray-900">{report.customerId?.name || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Unit</dt>
            <dd className="mt-1 text-sm text-gray-900">{report.unitId?.unitName || 'N/A'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Admin Note</dt>
            <dd className="mt-1 text-sm text-gray-900">{report.adminNote || 'No notes'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Partner Note</dt>
            {isPartnerView ? (
              <div className="mt-1">
                <textarea
                  rows={4}
                  className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                  value={partnerNote}
                  onChange={(e) => setPartnerNote(e.target.value)}
                />
                <div className="mt-2 flex justify-between items-center">
                  <Button
                    variant="primary"
                    onClick={handleUpdateNote}
                    className="text-sm"
                  >
                    Update Note
                  </Button>
                  {noteUpdated && (
                    <span className="text-sm text-green-600">Note updated successfully!</span>
                  )}
                </div>
              </div>
            ) : (
              <dd className="mt-1 text-sm text-gray-900">{report.partnerNote || 'No notes'}</dd>
            )}
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(report.createdAt).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(report.updatedAt).toLocaleString()}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Files</dt>
            <dd className="mt-1">
              {report.files && report.files.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {report.files.map((file) => (
                    <li key={file._id} className="py-2 flex justify-between items-center">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-900">{file.originalName}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => handleDownload(file._id)}
                        disabled={downloading === file._id}
                        size="sm"
                        icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        }
                      >
                        {downloading === file._id ? 'Downloading...' : 'Download'}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No files attached</p>
              )}
            </dd>
          </div>
        </dl>

        {isPartnerView && (
          <div className="mt-6 border-t border-gray-200 pt-6 space-y-4">
            {report.isNew && (
              <Button
                variant="secondary"
                onClick={handleMarkAsRead}
                disabled={markingAsRead}
                className="w-full justify-center"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                }
              >
                {markingAsRead ? 'Marking as Read...' : 'Mark as Read'}
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleSendToCustomer}
              disabled={sending}
              className="w-full justify-center"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            >
              {sending ? 'Sending...' : 'Send Report to Customer'}
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
      />
    </div>
  );
} 