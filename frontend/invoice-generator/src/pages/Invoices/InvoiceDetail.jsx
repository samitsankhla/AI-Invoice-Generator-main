import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Edit, Printer, Download, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import ReminderModal from '../../components/invoices/ReminderModal';
import moment from 'moment';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReminderModal, setShowReminderModal] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(API_PATHS.INVOICE.GET_INVOICES_BY_ID(id));
      setInvoice(response.data);
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError(err);
      toast.error('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement PDF download functionality
    toast.info('Download functionality coming soon');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="h-8 w-48 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-36 bg-gray-200 rounded-lg"></div>
              <div className="h-10 w-20 bg-gray-200 rounded-lg"></div>
              <div className="h-10 w-40 bg-gray-200 rounded-lg"></div>
            </div>
          </div>

          {/* Invoice Content Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Invoice Header Skeleton */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="h-10 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-5 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="text-right">
                <div className="h-4 w-12 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
              </div>
            </div>

            {/* Bill From / Bill To Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <div className="h-4 w-20 bg-gray-200 rounded mb-3"></div>
                <div className="space-y-2">
                  <div className="h-5 w-40 bg-gray-200 rounded"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded"></div>
                  <div className="h-4 w-44 bg-gray-200 rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div>
                <div className="h-4 w-16 bg-gray-200 rounded mb-3 ml-auto"></div>
                <div className="space-y-2 text-right">
                  <div className="h-5 w-36 bg-gray-200 rounded ml-auto"></div>
                  <div className="h-4 w-44 bg-gray-200 rounded ml-auto"></div>
                  <div className="h-4 w-40 bg-gray-200 rounded ml-auto"></div>
                </div>
              </div>
            </div>

            {/* Invoice Meta Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {Array(3).fill(0).map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-5 w-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>

            {/* Items Table Skeleton */}
            <div className="mb-8">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 grid grid-cols-4 gap-4 p-4">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="h-4 w-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 p-4 border-t border-gray-100">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-4 w-8 bg-gray-200 rounded mx-auto"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded ml-auto"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded ml-auto"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Skeleton */}
            <div className="flex justify-end mb-8">
              <div className="w-full max-w-sm space-y-3">
                <div className="flex justify-between py-2">
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between py-2">
                  <div className="h-4 w-8 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <div className="h-6 w-12 bg-gray-200 rounded"></div>
                    <div className="h-6 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Skeleton */}
            <div>
              <div className="h-4 w-16 bg-gray-200 rounded mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">Invoice Not Found</h3>
        <p className="text-slate-500 mb-6 max-w-md">
          The invoice you are looking for does not exist or could not be loaded.
        </p>
        <Button onClick={() => navigate('/invoices')}>
          Back to All Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/invoices')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice {invoice.invoiceNumber}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowReminderModal(true)}
            icon={Mail}
            disabled={invoice.status === 'paid'}
          >
            Generate Reminder
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/invoices/edit/${invoice._id}`)}
            icon={Edit}
          >
            Edit
          </Button>
          <Button
            onClick={handlePrint}
            icon={Printer}
          >
            Print or Download
          </Button>
        </div>
      </div>

      <div id="invoice-detail">
        {/* Invoice Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 print:shadow-none print:p-0">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
              <p className="text-gray-600">#{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-500">Status</span>
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${invoice.status === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                  }`}
              >
                {invoice.status === 'paid' ? 'Paid' : 'Unpaid'}
              </span>
            </div>
          </div>

          {/* Bill From / Bill To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                BILL FROM
              </h3>
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">
                  {invoice.billFrom?.businessName || invoice.billingFrom?.businessName}
                </p>
                <p className="text-gray-600">
                  {invoice.billFrom?.address || invoice.billingFrom?.address}
                </p>
                <p className="text-gray-600">
                  {invoice.billFrom?.email || invoice.billingFrom?.email}
                </p>
                <p className="text-gray-600">
                  {invoice.billFrom?.phone || invoice.billingFrom?.phone}
                </p>
              </div>
            </div>

            <div className="text-right">
              <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                BILL TO
              </h3>
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">
                  {invoice.billTo?.clientName || invoice.billingTo?.clientName}
                </p>
                <p className="text-gray-600">
                  {invoice.billTo?.clientAddress || invoice.billingTo?.clientAddress}
                </p>
                <p className="text-gray-600">
                  {invoice.billTo?.clientEmail || invoice.billingTo?.clientEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                INVOICE DATE
              </h4>
              <p className="text-gray-900">{moment(invoice.invoiceDate).format('DD/MM/YYYY')}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                DUE DATE
              </h4>
              <p className="text-gray-900">{moment(invoice.dueDate).format('DD/MM/YYYY')}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                PAYMENT TERMS
              </h4>
              <p className="text-gray-900">{invoice.paymentTerms}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 grid grid-cols-4 gap-4 p-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                <div>ITEM</div>
                <div className="text-center">QTY</div>
                <div className="text-right">PRICE</div>
                <div className="text-right">TOTAL</div>
              </div>
              {invoice.items?.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-4 p-4 border-t border-gray-100 hover:bg-gray-25"
                >
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-center text-gray-600">{item.quantity}</div>
                  <div className="text-right text-gray-600">
                    ${(item.price || item.unitPrice || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-right font-semibold text-gray-900">
                    ${((item.price || item.unitPrice || 0) * item.quantity).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">
                  ${(invoice.subtotal || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold text-gray-900">
                  ${(invoice.tax || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${(invoice.total || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                NOTES
              </h4>
              <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reminder Modal */}
      <ReminderModal
        open={showReminderModal}
        invoice={invoice}
        onClose={() => setShowReminderModal(false)}
      />

      <style>
        {`
          @page { 
            padding: 10px;
          }
          @media print {
            body {
              visibility: hidden;
            }
            #invoice-detail, #invoice-detail * {
              visibility: visible;
            }
            #invoice-detail {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
};

export default InvoiceDetail;