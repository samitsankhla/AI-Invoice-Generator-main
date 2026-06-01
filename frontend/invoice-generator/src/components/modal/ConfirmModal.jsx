import React from 'react';

const ConfirmModal = ({ open, title = 'Are you sure?', description = '', onConfirm, onCancel, confirmText = 'Delete', cancelText = 'Cancel', loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm bg-opacity-30">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-2 text-gray-900">{title}</h2>
        {description && <p className="text-gray-600 mb-4 text-sm">{description}</p>}
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold disabled:opacity-60"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
