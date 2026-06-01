import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosinstance';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button';
import TextareaField from '../ui/TextareaField';
import { API_BASE_URL, API_PATHS } from '../../utils/apiPaths';

const CreateWithAIModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [invoiceText, setInvoiceText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateInvoice = async () => {
    if (!invoiceText.trim()) {
      toast.error('Please enter invoice text');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AI.PARSE_INVOICE_TEXT, {
        text: invoiceText,
      });

      if (response.data.success) {
        console.log('AI response data:', response.data.data);
        // Navigate to CreateInvoice with the AI-generated data
        navigate('/invoices/new', { 
          state: { 
            aiData: response.data.data,
            fromAI: true 
          } 
        });
        onClose();
        toast.success('Invoice data generated successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to parse invoice text');
      }
    } catch (error) {
      console.error('Error parsing invoice text:', error);
      toast.error(error.response?.data?.message || 'Failed to generate invoice from text');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setInvoiceText('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Create Invoice with AI</h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4">
          Paste any text that contains invoice details (like client name, items, quantities, and prices) and the AI will attempt to create an invoice from it.
        </p>

        {/* Loading Skeleton */}
        {loading && (
          <div className="mb-4 space-y-3">
            <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4"></div>
            <div className="animate-pulse bg-gray-200 h-4 rounded w-1/2"></div>
            <div className="animate-pulse bg-gray-200 h-4 rounded w-2/3"></div>
          </div>
        )}

        {/* Input Field */}
        <div className="mb-6">
          <TextareaField
            label="Paste Invoice Text Here"
            name="invoiceText"
            value={invoiceText}
            onChange={(e) => setInvoiceText(e.target.value)}
            placeholder="e.g., Invoice for ClientCorp: 2 hours of design work at $150/hr and 1 logo for $800"
            rows={6}
            disabled={loading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerateInvoice}
            isLoading={loading}
            disabled={!invoiceText.trim() || loading}
          >
            Generate Invoice
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateWithAIModal;