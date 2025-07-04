'use client';

import { useState, useEffect } from 'react';
import { getAuthCookies } from '@/utils/auth';
import TreeView from '@/components/TreeView';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import AddPartnerModal from '@/components/modals/AddPartnerModal';
import AddCustomerModal from '@/components/modals/AddCustomerModal';
import AddReportModal from '@/components/modals/AddReportModal';
import ReportInfo from '@/components/InfoViews/ReportInfo';
import PartnerInfo from '@/components/InfoViews/PartnerInfo';
import CustomerInfo from '@/components/InfoViews/CustomerInfo';
import UnitInfo from '@/components/InfoViews/UnitInfo';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/partners/nested`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const jsonData = await response.json();
      setData(jsonData);
      setError('');
    } catch (err) {
      console.error('Error in Dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleItemClick = (item, type) => {
    if (selectedItem && selectedItem._id === item._id) {
      fetchData();
    }
    setSelectedItem({ ...item, type });
  };

  const handleDelete = (type, id) => {
    // Remove the item from the data tree
    if (type === 'partner') {
      setData(data.filter(partner => partner._id !== id));
    } else if (type === 'customer') {
      setData(data.map(partner => ({
        ...partner,
        customers: partner.customers?.filter(customer => customer._id !== id) || []
      })));
    } else if (type === 'unit') {
      setData(data.map(partner => ({
        ...partner,
        customers: partner.customers?.map(customer => ({
          ...customer,
          units: customer.units?.filter(unit => unit._id !== id) || []
        })) || []
      })));
    } else if (type === 'report') {
      setData(prevData => {
        // Create a deep copy of the data
        const newData = JSON.parse(JSON.stringify(prevData));
        
        // Traverse through the tree to find and remove the report
        for (const partner of newData) {
          if (partner.customers) {
            for (const customer of partner.customers) {
              if (customer.units) {
                for (const unit of customer.units) {
                  if (unit.reports) {
                    const reportIndex = unit.reports.findIndex(report => report._id === id);
                    if (reportIndex !== -1) {
                      unit.reports.splice(reportIndex, 1);
                      return newData;
                    }
                  }
                }
              }
              // Also check for reports directly under customer
              if (customer.reports) {
                const reportIndex = customer.reports.findIndex(report => report._id === id);
                if (reportIndex !== -1) {
                  customer.reports.splice(reportIndex, 1);
                  return newData;
                }
              }
            }
          }
        }
        return newData;
      });
    }
    
    // Clear the selected item if it was deleted
    if (selectedItem && selectedItem._id === id) {
    setSelectedItem(null);
    }
  };

  const handleModalClose = () => {
    setShowPartnerModal(false);
    setShowCustomerModal(false);
    setShowReportModal(false);
  };

  const handleModalSuccess = () => {
    handleModalClose();
    fetchData();
  };

  const handleLogout = () => {
    // Clear cookies by setting them to expire
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Redirect to admin login
    router.push('/admin-login');
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

  return (
    <div className="relative flex h-[calc(100vh-4rem)]">
      {/* Mobile Sidebar Toggle Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isSidebarOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-80 bg-white border-r border-gray-200 
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:flex lg:flex-col
        `}
      >
        {/* Logo Section */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex justify-center mb-3">
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={100}
              height={100}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Button
              variant="primary"
              className="w-full justify-center py-1.5 text-sm"
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
              onClick={() => setShowPartnerModal(true)}
            >
              Add Partner
            </Button>
            <Button
              variant="primary"
              className="w-full justify-center py-1.5 text-sm"
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              onClick={() => setShowCustomerModal(true)}
            >
              Add Customer
            </Button>
            <Button
              variant="primary"
              className="w-full justify-center py-1.5 text-sm"
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              onClick={() => setShowReportModal(true)}
            >
              Add Report
            </Button>
            <Button
              variant="danger"
              className="w-full justify-center py-1.5 text-sm"
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              }
              onClick={() => setShowLogoutModal(true)}
            >
              Logout
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <TreeView data={data} onItemClick={(item, type) => {
            handleItemClick(item, type);
            // Close sidebar on mobile after selection
            if (window.innerWidth < 1024) {
              setIsSidebarOpen(false);
            }
          }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 ml-0">
        {selectedItem ? (
          selectedItem.type === 'report' ? (
            <ReportInfo 
              reportId={selectedItem._id} 
              onDelete={() => handleDelete('report', selectedItem._id)}
            />
          ) : selectedItem.type === 'partner' ? (
            <PartnerInfo 
              partnerId={selectedItem._id} 
              onDelete={() => handleDelete('partner', selectedItem._id)}
            />
          ) : selectedItem.type === 'unit' ? (
            <UnitInfo 
              unitId={selectedItem._id} 
              onDelete={() => handleDelete('unit', selectedItem._id)}
            />
          ) : (
            <CustomerInfo 
              customerId={selectedItem._id} 
              onDelete={() => handleDelete('customer', selectedItem._id)}
            />
          )
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              <p>Select an item from the sidebar to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddPartnerModal
        show={showPartnerModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
      <AddCustomerModal
        show={showCustomerModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        partners={data}
      />
      <AddReportModal
        show={showReportModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        partners={data}
      />
      <ConfirmationModal
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          handleLogout();
          setShowLogoutModal(false);
        }}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will need to log in again to access the dashboard."
        confirmText="Logout"
        confirmColor="red"
      />
    </div>
  );
} 