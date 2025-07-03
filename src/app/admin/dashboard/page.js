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

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

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
      setData(data.map(partner => ({
        ...partner,
        customers: partner.customers?.map(customer => ({
          ...customer,
          units: customer.units?.map(unit => ({
            ...unit,
            reports: unit.reports?.filter(report => report._id !== id) || []
          })) || []
        })) || []
      })));
    }
    
    // Clear the selected item
    setSelectedItem(null);
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
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="space-y-2">
            <Button
              variant="primary"
              className="w-full justify-center"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
              onClick={() => setShowPartnerModal(true)}
            >
              Add Partner
            </Button>
            <Button
              variant="primary"
              className="w-full justify-center"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              onClick={() => setShowCustomerModal(true)}
            >
              Add Customer
            </Button>
            <Button
              variant="primary"
              className="w-full justify-center"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              onClick={() => setShowReportModal(true)}
            >
              Add Report
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <TreeView data={data} onItemClick={handleItemClick} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
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
    </div>
  );
} 