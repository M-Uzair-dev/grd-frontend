'use client';

import { useState, useEffect } from 'react';
import Button from '../Button';

export default function EmailConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Send Email',
  recipient = '',
  reportDetails = {},
  loading = false
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Animated Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div 
          className={`
            relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl 
            transition-all duration-300 sm:my-8 w-full max-w-lg z-50
            ${isVisible 
              ? 'scale-100 opacity-100 translate-y-0' 
              : 'scale-95 opacity-0 translate-y-4'
            }
          `}
        >
          {/* Decorative Header Background */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl" />
          
          {/* Header */}
          <div className="relative bg-transparent px-6 py-6">
            <div className="flex items-center justify-between">
              {/* Email Icon with Animation */}
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
                  <svg 
                    className={`w-8 h-8 text-white transition-transform duration-500 ${
                      isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-12'
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white drop-shadow-sm">{title}</h3>
                  <p className="text-blue-100 text-sm">Confirm email delivery</p>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                type="button"
                className="rounded-full bg-white bg-opacity-20 backdrop-blur-sm text-white hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 p-2 transition-all duration-200 hover:scale-105"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 pb-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-600 font-medium">Sending email...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Confirmation Message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-blue-800 font-medium">
                        Are you sure you want to send this report via email?
                      </p>
                      <p className="text-blue-700 text-sm mt-1">
                        This action will notify the recipient immediately.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email Details */}
                <div className="space-y-4">
                  {recipient && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Recipient</p>
                        <p className="text-sm text-gray-900">{recipient}</p>
                      </div>
                    </div>
                  )}

                  {reportDetails.reportNumber && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Report Number</p>
                        <p className="text-sm text-gray-900">{reportDetails.reportNumber}</p>
                      </div>
                    </div>
                  )}

                  {reportDetails.vnNumber && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700">VN Number</p>
                        <p className="text-sm text-gray-900">{reportDetails.vnNumber}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    className="px-6 py-2.5 transition-all duration-200 hover:scale-105"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleConfirm}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    }
                  >
                    Send Email
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}