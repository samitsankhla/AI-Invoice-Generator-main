import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, Mail, Check, Loader2, Sparkles, Eye } from 'lucide-react';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import CreateWithAIModal from '../../components/invoices/CreateWithAIModal';
import ReminderModal from '../../components/invoices/ReminderModal';
import ConfirmModal from '../../components/modal/ConfirmModal';
import { toast } from 'react-hot-toast';

const AllInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAIModal, setShowAIModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderInvoice, setReminderInvoice] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(API_PATHS.INVOICE.GET_ALL_INVOICES);
        setInvoices(res.data || []);
      } catch (err) {
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const filtered = invoices.filter(inv => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.billingTo?.clientName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(API_PATHS.INVOICE.DELETE_INVOICE(deleteId));
      setInvoices(invoices => invoices.filter(inv => inv._id !== deleteId));
      setShowConfirm(false);
      setDeleteId(null);
    } catch (error) {
        // handle error
        toast.error('Failed to delete invoice');
        console.error('Failed to delete invoice', error);
    } finally {
      setDeleting(false);
    }
  };

  // Mark invoice as paid/unpaid
const handleMarkStatus = async (id, status) => {
    if (updatingId) return;
    setUpdatingId(id);
    try {
        const res = await axiosInstance.put(API_PATHS.INVOICE.UPDATE_INVOICE(id), { status });
        setInvoices(invoices => invoices.map(inv => inv._id === id ? { ...inv, status } : inv));
        toast.success(`Invoice marked as ${status}`);
    } catch (error) {
        // handle error
        toast.error('Failed to update invoice status');
        console.error('Failed to update invoice status', error);  
    } finally {
        setUpdatingId(null);
    }
};

return (
    <div className="max-w-6xl mx-auto py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">All Invoices</h1>
                <p className="text-gray-500">Manage all your invoices in one place.</p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setShowAIModal(true)} className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 font-medium hover:bg-gray-50">
                    <span className="mr-2"><Sparkles className="w-4 h-4" /></span> Create with AI
                </button>
                <button onClick={() => navigate('/invoices/new')} className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-950">
                    <Plus className="w-4 h-4 mr-2" /> Create Invoice
                </button>
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Search by invoice # or client..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="border border-gray-200 rounded-lg px-3 py-2 text-gray-700"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="pending">Pending</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                {loading ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <tbody>
                            {Array(3).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {Array(6).fill(0).map((_, j) => (
                                        <td key={j} className="px-4 py-3">
                                            <div className="h-4 w-24 bg-gray-200 rounded" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="mb-4">
                            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
                                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="text-gray-400">
                                    <rect x="6" y="3" width="12" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M9 7h6M9 11h6M9 15h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </span>
                        </div>
                        <div className="text-lg font-semibold text-gray-700 mb-1">No invoices found</div>
                        <div className="text-gray-500 text-center max-w-xs">
                            Your search or filter criteria did not match any invoices. Try adjusting your search.
                        </div>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filtered.map(inv => (
                                <tr key={inv._id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        <button
                                            onClick={() => navigate(`/invoices/${inv._id}`)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                        >
                                            {inv.invoiceNumber}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">{inv.billingTo?.clientName || 'Unknown Client'}</td>
                                    <td className="px-4 py-3 font-semibold text-gray-900">${inv.total?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="px-4 py-3 text-gray-700">{moment(inv.dueDate).format('ll')}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{inv.status === 'paid' ? 'Paid' : 'Unpaid'}</span>
                                    </td>
                                    <td className="px-4 py-3 flex gap-2 items-center">
                                        {inv.status === 'unpaid' ? (
                                            updatingId === inv._id ? (
                                                <Loader2 className='animate-spin text-blue-600'/>
                                            ) : (
                                                <button
                                                    className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold hover:bg-emerald-200 flex items-center gap-1"
                                                    onClick={() => handleMarkStatus(inv._id, 'paid')}
                                                >
                                                    <Check className="w-4 h-4" /> Mark Paid
                                                </button>
                                            )
                                        ) : (
                                            updatingId === inv._id ? (
                                                <Loader2 className='animate-spin text-blue-600'/>
                                            ) : (
                                                <button
                                                    className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 flex items-center gap-1"
                                                    onClick={() => handleMarkStatus(inv._id, 'unpaid')}
                                                >
                                                    <Check className="w-4 h-4" /> Mark Unpaid
                                                </button>
                                            )
                                        )}
                                        <button onClick={() => navigate(`/invoices/${inv._id}`)} className="p-2 hover:bg-gray-100 rounded-lg" title="View Invoice"><Eye className="w-4 h-4" /></button>
                                        <button onClick={() => navigate(`/invoices/edit/${inv._id}`)} className="p-2 hover:bg-emerald-100 rounded-lg text-emerald-600" title="Edit Invoice"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => { setShowConfirm(true); setDeleteId(inv._id); }} className="p-2 hover:bg-red-100 rounded-lg text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                        <button
                                            onClick={() => {
                                                if (inv.status === 'paid') return;
                                                setShowReminderModal(true);
                                                setReminderInvoice(inv);
                                            }}
                                            className={`p-2 rounded-lg ${inv.status === 'paid' ? 'text-gray-400 cursor-not-allowed bg-gray-50' : 'text-blue-600 hover:bg-blue-100 cursor-pointer'}`}
                                            title="Send Reminder"
                                            disabled={inv.status === 'paid'}
                                        >
                                            <Mail className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>

        {/* Modals */}
        <CreateWithAIModal open={showAIModal} onClose={() => setShowAIModal(false)} />
        <ReminderModal open={showReminderModal} invoice={reminderInvoice} onClose={() => setShowReminderModal(false)} />
        <ConfirmModal
            open={showConfirm}
            title="Delete Invoice?"
            description="Are you sure you want to delete this invoice? This action cannot be undone."
            onConfirm={handleDelete}
            onCancel={() => setShowConfirm(false)}
            loading={deleting}
            confirmText="Delete"
        />
    </div>
);
};

export default AllInvoices;