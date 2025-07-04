'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthCookies } from '@/utils/auth';
import Button from '@/components/Button';
import FormField from '@/components/FormField';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function EditReport({ params }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { token } = getAuthCookies();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch report');
        }

        const data = await response.json();
        setReport(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});

    try {
      const { token } = getAuthCookies();
      const formData = new FormData();
      
      // Add all fields to formData
      formData.append('reportNumber', report.reportNumber);
      formData.append('vnNumber', report.vnNumber);
      formData.append('adminNote', report.adminNote || '');
      formData.append('status', report.status);
      formData.append('partnerId', report.partnerId._id);
      formData.append('customerId', report.customerId._id);
      if (report.unitId) {
        formData.append('unitId', report.unitId._id);
      }

      // Add PDF file if it exists
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput.files[0]) {
        formData.append('pdfFile', fileInput.files[0]);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.errors) {
          setFormErrors(data.errors);
        } else {
          throw new Error(data.message || 'Failed to update report');
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
              value={report.reportNumber}
              onChange={(e) => setReport({ ...report, reportNumber: e.target.value })}
              error={formErrors.reportNumber}
              required
            />

            <FormField
              label="VN Number"
              name="vnNumber"
              value={report.vnNumber}
              onChange={(e) => setReport({ ...report, vnNumber: e.target.value })}
              error={formErrors.vnNumber}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={report.status}
              onChange={(e) => setReport({ ...report, status: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="Active">Active</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Note
            </label>
            <textarea
              value={report.adminNote || ''}
              onChange={(e) => setReport({ ...report, adminNote: e.target.value })}
              rows={4}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PDF File
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                accept=".pdf"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                "
              />
            </div>
            {report.pdfFile && (
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  }
                  onClick={() => window.open(report.pdfFile, '_blank')}
                >
                  View Current PDF
                </Button>
              </div>
            )}
          </div>

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