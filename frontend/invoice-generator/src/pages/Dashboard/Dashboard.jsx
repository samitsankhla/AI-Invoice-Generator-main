import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import { Loader2, FileText, DollarSign, Plus, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalInvoices: 0,
        paidInvoices: 0,
        unpaidInvoices: 0,
        totalPaid: 0,
        totalUnpaid: 0,
    });
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [aiInsights, setAiInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [insightsLoading, setInsightsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch invoices and calculate stats
                const invoicesResponse = await axiosInstance.get(API_PATHS.INVOICE.GET_ALL_INVOICES);
                const invoices = invoicesResponse.data || [];
                
                // Calculate stats from invoices
                const totalInvoices = invoices.length;
                const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
                const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid').length;
                const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0);
                const totalUnpaid = invoices.filter(inv => inv.status === 'unpaid').reduce((sum, inv) => sum + (inv.total || 0), 0);
                
                setStats({
                    totalInvoices,
                    paidInvoices,
                    unpaidInvoices,
                    totalPaid,
                    totalUnpaid,
                });
                
                // Set recent invoices (last 5)
                const sortedInvoices = invoices
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5)
                    .map(inv => ({
                        _id: inv._id,
                        clientName: inv.billingTo?.clientName || 'Unknown Client',
                        invoiceNumber: inv.invoiceNumber,
                        total: inv.total,
                        status: inv.status,
                        dueDate: inv.dueDate,
                    }));
                setRecentInvoices(sortedInvoices);
                
                // Fetch AI insights
                try {
                    const aiResponse = await axiosInstance.get(API_PATHS.AI.GET_DASHBOARD_SUMMARY);
                    const insights = aiResponse.data?.insights;
                    // Normalize to array to avoid runtime errors when mapping
                    setAiInsights(Array.isArray(insights) ? insights : insights ? [String(insights)] : []);
                } catch (aiError) {
                    console.log('AI insights not available:', aiError);
                    setAiInsights(['AI insights temporarily unavailable']);
                }
                
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
                setInsightsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const statsData = [
        {
            icon: FileText,
            label: "Total Invoices",
            value: stats.totalInvoices,
            Color: "blue",
        },
        {
            icon: DollarSign,
            label: "Total Paid",
            value: stats.totalPaid?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00',
            Color: "emerald",
        },
        {
            icon: DollarSign,
            label: "Total Unpaid",
            value: stats.totalUnpaid?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00',
            Color: "red",
        },
    ];

    const colorClasses = {
        blue: {bg: "bg-blue-100", text: "text-blue-800"},
        emerald: {bg: "bg-emerald-100", text: "text-emerald-800"},
        red: {bg: "bg-red-100", text: "text-red-800"},
    };

    // Ensure insights is always an array for rendering
    const normalizedInsights = Array.isArray(aiInsights) ? aiInsights : (aiInsights ? [String(aiInsights)] : []);

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-1 mt-2">Dashboard</h1>
            <p className="text-gray-500 mb-8">A quick overview of your business finances.</p>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {loading
                    ? Array(3).fill(0).map((_, i) => (
                        <div key={i} className="rounded-2xl bg-white p-6 shadow flex flex-col items-center animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-gray-200 mb-3" />
                            <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                            <div className="h-6 w-16 bg-gray-200 rounded" />
                        </div>
                    ))
                    : statsData.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="rounded-2xl bg-white p-6 shadow flex flex-col items-center">
                                <div className={`w-10 h-10 flex items-center justify-center rounded-full mb-3 ${colorClasses[stat.Color].bg}`}>
                                    <Icon className={`w-6 h-6 ${colorClasses[stat.Color].text}`} />
                                </div>
                                <div className="text-gray-500 text-sm font-medium mb-1">{stat.label}</div>
                                <div className={`text-2xl font-bold ${colorClasses[stat.Color].text}`}>{stat.value}</div>
                            </div>
                        );
                    })
                }
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-2xl shadow p-6 mb-8">
                <div className="flex items-center mb-3">
                    <Lightbulb className="w-6 h-6 text-yellow-400 mr-2" />
                    <span className="font-semibold text-gray-900 text-lg">AI Insights</span>
                </div>
                {insightsLoading ? (
                    <div className="space-y-2 animate-pulse">
                        <div className="h-4 w-3/4 bg-gray-200 rounded" />
                        <div className="h-4 w-2/3 bg-gray-200 rounded" />
                        <div className="h-4 w-1/2 bg-gray-200 rounded" />
                    </div>
                ) : (
                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                        {normalizedInsights.length === 0 ? (
                            <li>No insights available.</li>
                        ) : (
                            normalizedInsights.map((insight, idx) => (
                                <li key={idx}>{insight}</li>
                            ))
                        )}
                    </ul>
                )}
            </div>

            {/* Recent Invoices Table */}
            <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-gray-900 text-lg">Recent Invoices</span>
                    <button
                        onClick={() => navigate('/invoices')}
                        className="text-blue-900 font-medium hover:underline text-sm"
                    >
                        View All
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading
                                ? Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-4 py-3">
                                            <div className="h-4 w-24 bg-gray-200 rounded" />
                                            <div className="h-3 w-16 bg-gray-100 rounded mt-1" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="h-4 w-20 bg-gray-200 rounded" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="h-6 w-16 bg-gray-200 rounded" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="h-4 w-20 bg-gray-200 rounded" />
                                        </td>
                                    </tr>
                                ))
                                : recentInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-12">
                                            <div className="flex flex-col items-center justify-center">
                                                <FileText className="w-12 h-12 text-gray-300 mb-4" />
                                                <div className="text-lg font-semibold text-gray-700 mb-1">No invoices yet</div>
                                                <div className="text-gray-500 mb-4">You haven't created any invoices yet. Get started by creating your first one.</div>
                                                <button
                                                    onClick={() => navigate('/invoices/new')}
                                                    className="inline-flex items-center px-5 py-2.5 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-950 transition-all duration-200 text-base shadow-sm"
                                                >
                                                    <Plus className="w-5 h-5 mr-2" />
                                                    Create Invoice
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    recentInvoices.map((inv) => (
                                        <tr key={inv._id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900">{inv.clientName}</div>
                                                <div className="text-xs text-gray-500">#{inv.invoiceNumber}</div>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-gray-900">${inv.total?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{inv.status === 'paid' ? 'Paid' : 'Unpaid'}</span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">{moment(inv.dueDate).format('ll')}</td>
                                        </tr>
                                    ))
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Dashboard