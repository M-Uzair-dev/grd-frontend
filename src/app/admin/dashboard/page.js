'use client';

import { useState, useEffect } from 'react';
import { getAuthCookies } from '@/utils/auth';
import TreeView from '@/components/TreeView';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import AddPartnerModal from '@/components/modals/AddPartnerModal';
import AddCustomerModal from '@/components/modals/AddCustomerModal';
import AddReportModal from '@/components/modals/AddReportModal';
import ChangePasswordModal from '@/components/modals/ChangePasswordModal';
import ReportInfo from '@/components/InfoViews/ReportInfo';
import PartnerInfo from '@/components/InfoViews/PartnerInfo';
import CustomerInfo from '@/components/InfoViews/CustomerInfo';
import UnitInfo from '@/components/InfoViews/UnitInfo';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import AddPartnerUnitModal from '@/components/modals/AddPartnerUnitModal';

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
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAddPartnerUnitModal, setShowAddPartnerUnitModal] = useState(false);
  const [selectedPartnerForUnit, setSelectedPartnerForUnit] = useState(null);

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
    // Always refresh from backend after delete
    fetchData();
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
    router.push('/admin');
  };

  const handleAddUnitToPartner = (partner) => {
    setSelectedPartnerForUnit(partner);
    setShowAddPartnerUnitModal(true);
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
    <div className="flex h-screen overflow-hidden">
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
          fixed lg:relative inset-y-0 left-0 z-40
          w-80 bg-white border-r border-gray-200 
          transform transition-transform duration-300 ease-in-out h-screen
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 flex flex-col
        `}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <h1 className="ml-2 text-xl font-semibold text-gray-800">Admin Dashboard</h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 border-b border-gray-200 space-y-1.5">
            <Button
              onClick={() => setShowPartnerModal(true)}
            className="w-full justify-center py-1.5 text-sm"
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
            >
              Add Partner
            </Button>
            <Button
              onClick={() => setShowCustomerModal(true)}
            className="w-full justify-center py-1.5 text-sm"
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
            >
              Add Customer
            </Button>
            <Button
              onClick={() => setShowReportModal(true)}
            className="w-full justify-center py-1.5 text-sm"
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
            >
              Add Report
            </Button>
            <Button
            onClick={() => setShowChangePasswordModal(true)}
            className="w-full justify-center py-1.5 text-sm"
            variant="secondary"
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            }
          >
            Change Password
          </Button>
          <Button
            onClick={() => setShowLogoutModal(true)}
            className="w-full justify-center py-1.5 text-sm"
              variant="danger"
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            }
            >
              Logout
            </Button>
          </div>

        {/* Tree View */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <TreeView
              data={data}
              onItemClick={(item, type) => {
                handleItemClick(item, type);
                if (window.innerWidth < 1024) {
                  setIsSidebarOpen(false);
                }
              }}
              onAddUnit={handleAddUnitToPartner}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-4 lg:p-6 min-h-full">
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
      </div>

      {/* Modals */}
      <AddPartnerModal
        isOpen={showPartnerModal}
        onClose={() => setShowPartnerModal(false)}
        onSuccess={handleModalSuccess}
      />
      <AddCustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSuccess={handleModalSuccess}
      />
      <AddReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSuccess={handleModalSuccess}
      />
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
      />
      <AddPartnerUnitModal
        isOpen={showAddPartnerUnitModal}
        onClose={() => setShowAddPartnerUnitModal(false)}
        onSuccess={() => {
          setShowAddPartnerUnitModal(false);
          fetchData();
        }}
        partnerId={selectedPartnerForUnit?._id}
      />
    </div>
  );
} 