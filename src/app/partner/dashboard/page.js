'use client';

import { useState, useEffect } from 'react';
import { getAuthCookies } from '@/utils/auth';
import TreeView from '@/components/TreeView';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import ReportInfo from '@/components/InfoViews/ReportInfo';
import CustomerInfo from '@/components/InfoViews/CustomerInfo';
import UnitInfo from '@/components/InfoViews/UnitInfo';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

// Helper function to extract all reports from nested data
const extractNewReports = (data) => {
  const reports = [];
  
  data.forEach(partner => {
    partner.customers?.forEach(customer => {
      // Add direct customer reports
      customer.reports?.forEach(report => {
        if (report.isNew) {
          reports.push({
            ...report,
            customerName: customer.name
          });
        }
      });
      
      // Add unit reports
      customer.units?.forEach(unit => {
        unit.reports?.forEach(report => {
          if (report.isNew) {
            reports.push({
              ...report,
              customerName: customer.name,
              unitName: unit.unitName
            });
          }
        });
      });
    });
  });
  
  return reports;
};

const NewReportsChips = ({ reports, onReportClick }) => {
  if (!reports || reports.length === 0) return null;

  return (
    <div className="mb-6 bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        <span className="mr-2">🔔</span>
        New Reports
      </h2>
      <div className="flex flex-wrap gap-2">
        {reports.map(report => (
          <button
            key={report._id}
            onClick={() => onReportClick(report)}
            className="inline-flex items-center px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 
                     text-yellow-800 rounded-full text-sm font-medium transition-colors 
                     duration-150 group relative"
          >
            <span className="flex items-center">
              {report.reportNumber}
              <span className="ml-1 text-yellow-600">→</span>
            </span>
            <span className="absolute bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-md 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-150
                           -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10"
            >
              {report.customerName}
              {report.unitName ? ` → ${report.unitName}` : ''}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default function PartnerDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [newReports, setNewReports] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { token } = getAuthCookies();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/partners/nested/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const responseData = await response.json();
      setData(responseData);
      setNewReports(extractNewReports(responseData));
      setError('');
    } catch (err) {
      console.error('Error in Partner Dashboard:', err);
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

  const handleReportChipClick = (report) => {
    setSelectedItem({ ...report, type: 'report' });
  };

  const handleLogout = () => {
    // Clear cookies by setting them to expire
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Redirect to login
    router.push('/partner-login');
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
    <div className="relative flex h-screen">
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
          transform transition-transform duration-300 ease-in-out h-full
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 flex flex-col
        `}
      >
        {/* Logo Section */}
        <div className="flex-shrink-0 p-3 border-b border-gray-200">
          <div className="flex justify-center mb-3">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={100}
              height={100}
              className="rounded-lg"
              priority={true}
              loading="eager"
            />
          </div>
          <div className="space-y-1.5">
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
        {/* Tree View Container */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4">
            <TreeView data={data} onItemClick={(item, type) => {
              handleItemClick(item, type);
              // Close sidebar on mobile after selection
              if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
              }
            }} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
        {/* New Reports Chips */}
        <NewReportsChips reports={newReports} onReportClick={handleReportChipClick} />

        {selectedItem ? (
          selectedItem.type === 'report' ? (
            <ReportInfo 
              reportId={selectedItem._id} 
              isPartnerView={true}
            />
          ) : selectedItem.type === 'customer' ? (
            <CustomerInfo 
              customerId={selectedItem._id}
              isPartnerView={true}
            />
          ) : selectedItem.type === 'unit' ? (
            <UnitInfo 
              unitId={selectedItem._id}
              isPartnerView={true}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                <p>Select an item from the sidebar to view details</p>
              </div>
            </div>
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