import React, { useState, useEffect } from 'react';
import { X, Mail, Copy, Loader2 } from 'lucide-react';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button';
import TextareaField from '../ui/TextareaField';

const ReminderModal = ({ open, invoice, onClose }) => {
  const [reminderText, setReminderText] = useState('');
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');

  useEffect(() => {
    if (open && invoice) {
      generateReminder();
    }
  }, [open, invoice]);

  const generateReminder = async () => {
    if (!invoice) return;
    
    setLoading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AI.GENERATE_REMINDER, {
        invoiceId: invoice._id,
      });

      if (response.data.reminderText) {
        // Replace placeholder values with editable defaults
        let processedText = response.data.reminderText;
        processedText = processedText.replace(/\[Your Name\]/g, 'Your Name');
        processedText = processedText.replace(/\[Your Company Name\]/g, 'Your Company Name');
        processedText = processedText.replace(/Accounting Assistant/g, 'Accounting Assistant');
        
        setReminderText(processedText);
        setSubject(`Friendly Reminder: Invoice ${invoice.invoiceNumber}`);
      } else {
        throw new Error('No reminder text received');
      }
    } catch (error) {
      console.error('Error generating reminder:', error);
      toast.error('Failed to generate reminder email');
      setReminderText('Failed to generate reminder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    const fullText = `Subject: ${subject}\n\n${reminderText}`;
    navigator.clipboard.writeText(fullText).then(() => {
      toast.success('Reminder text copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy text');
    });
  };

  const handleClose = () => {
    setReminderText('');
    setSubject('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI-Generated Reminder</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-gray-600">Generating personalized reminder...</p>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="mb-4 space-y-3">
            <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4"></div>
            <div className="animate-pulse bg-gray-200 h-4 rounded w-1/2"></div>
            <div className="animate-pulse bg-gray-200 h-4 rounded w-2/3"></div>
          </div>
        )}

        {/* Content */}
        {!loading && reminderText && !reminderText.includes('Failed to generate') && (
          <>
            {/* Subject Line */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
              <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium">
                {subject}
              </div>
            </div>

            {/* Email Body - Now editable textarea */}
            <div className="mb-6">
              <TextareaField
                label="Email Content"
                name="reminderText"
                value={reminderText}
                onChange={(e) => setReminderText(e.target.value)}
                placeholder="AI-generated reminder content will appear here..."
                rows={8}
              />
              <p className="text-xs text-gray-500 mt-2">
                You can edit the generated text above. Make sure to replace "Your Name" and "Your Company Name" with your actual details.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={handleClose}
              >
                Close
              </Button>
              <Button
                onClick={handleCopyText}
                icon={Copy}
                disabled={!reminderText.trim()}
              >
                Copy Text
              </Button>
            </div>
          </>
        )}

        {/* Error State */}
        {!loading && reminderText && reminderText.includes('Failed to generate') && (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{reminderText}</p>
            <Button onClick={generateReminder}>
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReminderModal;