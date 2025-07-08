'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from './LoadingSpinner';
import Button from './Button';

// Import pdfjs worker
const setPdfWorker = async () => {
  const pdfjs = await import('pdfjs-dist/build/pdf');
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
};

// Set up the worker
setPdfWorker();

// Dynamically import Document and Page components
const Document = dynamic(() => import('react-pdf').then(module => module.Document), {
  ssr: false,
  loading: () => <LoadingSpinner size="lg" />
});

const Page = dynamic(() => import('react-pdf').then(module => module.Page), {
  ssr: false,
  loading: () => <LoadingSpinner size="lg" />
});

export default function PDFViewer({ url }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setError(false);
  };

  const onDocumentLoadError = (err) => {
    console.error('Error loading PDF:', err);
    setError(true);
  };

  if (error) {
    return (
      <div className="text-center text-red-600 py-4">
        Failed to load PDF preview. You can still download the PDF using the button above.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-[500px]">
      <div className="w-full max-w-3xl overflow-auto">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<LoadingSpinner size="lg" />}
          className="flex justify-center"
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-lg rounded"
            scale={1.2}
          />
        </Document>
      </div>
      
      {numPages && (
        <div className="flex items-center gap-4 mt-4">
          <Button
            variant="secondary"
            onClick={() => setPageNumber(page => Math.max(1, page - 1))}
            disabled={pageNumber <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pageNumber} of {numPages}
          </span>
          <Button
            variant="secondary"
            onClick={() => setPageNumber(page => Math.min(numPages, page + 1))}
            disabled={pageNumber >= numPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
} 