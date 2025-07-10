'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthCookies } from '@/utils/auth';
import Button from '@/components/Button';
import FormField from '@/components/FormField';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function EditPartner({ params }) {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const { token } = getAuthCookies();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/partners/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch partner');
        }

        const data = await response.json();
        setPartner(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPartner();
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});

    try {
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/partners/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: partner.name,
          email: partner.email,
          personName: partner.personName || '',
          personContact: partner.personContact || ''
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.errors) {
          setFormErrors(data.errors);
        } else {
          throw new Error(data.message || 'Failed to update partner');
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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setFormErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setSaving(true);
    setFormErrors({});

    try {
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/partners/${params.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.errors) {
          setFormErrors(data.errors);
        } else {
          throw new Error(data.message || 'Failed to update password');
        }
        return;
      }

      setShowPasswordForm(false);
      setPassword('');
      setConfirmPassword('');
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
  if (!partner) return null;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Edit Partner</h1>
          <p className="mt-1 text-sm text-gray-500">Update the partner details below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              label="Company Name"
              name="name"
              value={partner.name}
              onChange={(e) => setPartner({ ...partner, name: e.target.value })}
              error={formErrors.name}
              required
            />

            <FormField
              label="Email"
              type="email"
              name="email"
              value={partner.email}
              onChange={(e) => setPartner({ ...partner, email: e.target.value })}
              error={formErrors.email}
              required
            />

            <FormField
              label="Contact Person Name"
              name="personName"
              value={partner.personName || ''}
              onChange={(e) => setPartner({ ...partner, personName: e.target.value })}
              error={formErrors.personName}
              placeholder="Optional"
            />

            <FormField
              label="Contact Number"
              name="personContact"
              value={partner.personContact || ''}
              onChange={(e) => setPartner({ ...partner, personContact: e.target.value })}
              error={formErrors.personContact}
              placeholder="Optional"
            />
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

        <div className="mt-8 pt-6 border-t">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Password Management</h2>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              {showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
            </Button>
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  label="New Password"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={formErrors.password}
                  required
                />

                <FormField
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={formErrors.confirmPassword}
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={saving}
                >
                  Update Password
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}