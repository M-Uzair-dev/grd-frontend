'use client';

import Modal from './Modal';
import Button from '../Button';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?'
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <div className="py-2">
        <p className="text-gray-700">{message}</p>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <Button
          variant="secondary"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
} 