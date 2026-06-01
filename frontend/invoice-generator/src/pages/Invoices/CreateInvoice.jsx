import React, { useState, useEffect } from 'react';
import InputField from '../../components/ui/InputField';
import SelectField from '../../components/ui/SelectField';
import TextareaField from '../../components/ui/TextareaField';
import Button from '../../components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const emptyItem = { name: '', quantity: 1, price: '', tax: 0 };

const paymentTermsOptions = [
    { value: 'Net 15', label: 'Net 15' },
    { value: 'Net 30', label: 'Net 30' },
    { value: 'Net 45', label: 'Net 45' },
    { value: 'Due on Receipt', label: 'Due on Receipt' },
];


const CreateInvoice = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { invoiceId } = useParams();
    const isEdit = Boolean(invoiceId);
    const { user, loading: authLoading } = useAuth();

    // Check if we have AI-generated data from location state
    const aiData = location.state?.aiData;
    const fromAI = location.state?.fromAI;

    // Main form state
    const [form, setForm] = useState({
        invoiceNumber: '',
        invoiceDate: '',
        dueDate: '',
        billFrom: {
            businessName: '',
            email: '',
            address: '',
            phone: '',
        },
        billTo: {
            clientName: '',
            clientEmail: '',
            clientAddress: '',
            clientPhone: '',
        },
        items: [{ ...emptyItem }],
        notes: '',
        paymentTerms: 'Net 15',
    });
    const [loading, setLoading] = useState(false);
    const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);

    // Field-level validation state
    const [fieldErrors, setFieldErrors] = useState({});
    const [touched, setTouched] = useState({
        invoiceNumber: false,
        invoiceDate: false,
        dueDate: false,
        businessName: false,
        email: false,
        address: false,
        clientName: false,
        clientEmail: false,
        clientAddress: false,
        // Items handled separately
    });

    // Set today's date for invoiceDate on mount (create mode only)
    useEffect(() => {
        if (!isEdit) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const todayStr = `${yyyy}-${mm}-${dd}`;
            setForm(f => ({ ...f, invoiceDate: todayStr }));
        }
    }, [isEdit]);

    // Fetch billFrom data from user profile (if available)
    useEffect(() => {
        if (!isEdit && user && !authLoading) {
            setForm(f => ({
                ...f,
                billFrom: {
                    businessName: user?.businessName || '',
                    email: user?.email || '',
                    address: user?.address || '',
                    phone: user?.phone || '',
                }
            }));
        }
    }, [isEdit, user, authLoading]);

    // Auto-generate unique invoice number on mount (create mode only)
    useEffect(() => {
        const generateInvoiceNumber = async () => {
            setIsGeneratingNumber(true);
            let unique = false;
            let newNumber = '';
            while (!unique) {
                const num = Math.floor(10000 + Math.random() * 90000);
                newNumber = `INV-${num}`;
                try {
                    const resp = await axiosInstance.get(`api/invoices/exists/${newNumber}`);
                    if (!resp.data.exists) unique = true;
                } catch {
                    unique = true;
                }
            }
            setIsGeneratingNumber(false);
            setForm(f => ({ ...f, invoiceNumber: newNumber }));
        };
        if (!isEdit) generateInvoiceNumber();
    }, [isEdit]);

    // Prefill for edit mode
    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            axiosInstance.get(API_PATHS.INVOICE.GET_INVOICES_BY_ID(invoiceId))
                .then(res => {
                    const invoiceData = res.data;
                    // Map API data to form structure, handle possible field name differences
                    setForm({
                        invoiceNumber: invoiceData.invoiceNumber || '',
                        invoiceDate: invoiceData.invoiceDate ? invoiceData.invoiceDate.split('T')[0] : '',
                        dueDate: invoiceData.dueDate ? invoiceData.dueDate.split('T')[0] : '',
                        billFrom: {
                            businessName: invoiceData.billingFrom?.businessName || '',
                            email: invoiceData.billingFrom?.email || '',
                            address: invoiceData.billingFrom?.address || '',
                            phone: invoiceData.billingFrom?.phone || '',
                        },
                        billTo: {
                            clientName: invoiceData.billingTo?.clientName || '',
                            clientEmail: invoiceData.billingTo?.email || '',
                            clientAddress: invoiceData.billingTo?.address || '',
                            clientPhone: invoiceData.billingTo?.phone || '',
                        },
                        items: invoiceData.items?.map(item => ({
                            name: item.name || '',
                            quantity: item.quantity || 1,
                            price: item.unitPrice || 0,
                            tax: item.taxPercent || 0,
                        })) || [{ ...emptyItem }],
                        notes: invoiceData.notes || '',
                        paymentTerms: invoiceData.paymentTerms || 'Net 15',
                    });
                })
                .catch((err) => {
                    console.error("Error fetching invoice:", err);
                    toast.error('Failed to load invoice');
                })
                .finally(() => setLoading(false));
        }
    }, [isEdit, invoiceId]);

    // Handle AI-generated data
    useEffect(() => {
        if (fromAI && aiData && !isEdit) {
            console.log('Received AI data:', aiData);
            setForm(prevForm => {
                const updatedForm = {
                    ...prevForm,
                    // Override with AI data while preserving existing values
                    invoiceNumber: aiData.invoiceNumber || prevForm.invoiceNumber,
                    invoiceDate: aiData.invoiceDate || prevForm.invoiceDate,
                    dueDate: aiData.dueDate || prevForm.dueDate,
                    billFrom: {
                        ...prevForm.billFrom,
                        ...aiData.billFrom
                    },
                    billTo: {
                        ...prevForm.billTo,
                        ...aiData.billTo
                    },
                    items: aiData.items && aiData.items.length > 0 ? aiData.items : prevForm.items,
                    notes: aiData.notes || prevForm.notes,
                    paymentTerms: aiData.paymentTerms || prevForm.paymentTerms,
                };
                console.log('Updated form with AI data:', updatedForm);
                return updatedForm;
            });
            
            // Show success message
            toast.success('Invoice populated with AI-generated data!');
        }
    }, [fromAI, aiData, isEdit]);

    // Validation logic (field-level, similar to Login.jsx)
    const validateField = (name, value) => {
        if (name === 'invoiceNumber') return value ? null : 'Invoice number is required';
        if (name === 'invoiceDate') return value ? null : 'Invoice date is required';
        if (name === 'dueDate') return value ? null : 'Due date is required';
        if (name === 'businessName') return value ? null : 'Business name is required';
        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value) ? null : 'Please enter a valid email address';
        }
        if (name === 'address') return value ? null : 'Address is required';
        if (name === 'clientName') return value ? null : 'Client name is required';
        if (name === 'clientEmail') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value) ? null : 'Please enter a valid email address';
        }
        if (name === 'clientAddress') return value ? null : 'Client address is required';
        return null;
    };

    // Validate all fields for submit
    const validate = () => {
        const errors = {};
        errors.invoiceNumber = validateField('invoiceNumber', form.invoiceNumber);
        errors.invoiceDate = validateField('invoiceDate', form.invoiceDate);
        errors.dueDate = validateField('dueDate', form.dueDate);
        errors.businessName = validateField('businessName', form.billFrom?.businessName);
        errors.email = validateField('email', form.billFrom?.email);
        errors.address = validateField('address', form.billFrom?.address);
        errors.clientName = validateField('clientName', form.billTo?.clientName);
        errors.clientEmail = validateField('clientEmail', form.billTo?.clientEmail);
        errors.clientAddress = validateField('clientAddress', form.billTo?.clientAddress);
        // Items
        if (!form.items.length) errors.items = 'At least one item is required';
        form.items.forEach((item, idx) => {
            if (!item.name) errors[`item_name_${idx}`] = 'Item name required';
            if (!item.quantity || item.quantity < 1) errors[`item_quantity_${idx}`] = 'Quantity required';
            if (!item.price || item.price < 0) errors[`item_price_${idx}`] = 'Price required';
        });
        return errors;
    };

    // Handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        if (touched[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
    };
    const handleBillFromChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ 
            ...f, 
            billFrom: { 
                ...(f.billFrom || {}), 
                [name]: value 
            } 
        }));
        if (touched[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
    };
    const handleBillToChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ 
            ...f, 
            billTo: { 
                ...(f.billTo || {}), 
                [name]: value 
            } 
        }));
        if (touched[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
    };
    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    };
    const handleItemChange = (idx, e) => {
        const { name, value } = e.target;
        setForm(f => {
            const items = [...f.items];
            items[idx][name] = name === 'quantity' || name === 'tax' ? Number(value) : value;
            return { ...f, items };
        });
        // Validate item fields on change if touched
        if (touched[`item_${name}_${idx}`]) {
            setFieldErrors(prev => ({ ...prev, [`item_${name}_${idx}`]: validateField(`item_${name}_${idx}`, value) }));
        }
    };
    const handleItemBlur = (idx, e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [`item_${name}_${idx}`]: true }));
        // Only validate name, quantity, price
        if (['name', 'quantity', 'price'].includes(name)) {
            let error = null;
            if (name === 'name') error = value ? null : 'Item name required';
            if (name === 'quantity') error = value && Number(value) >= 1 ? null : 'Quantity required';
            if (name === 'price') error = value && Number(value) >= 0 ? null : 'Price required';
            setFieldErrors(prev => ({ ...prev, [`item_${name}_${idx}`]: error }));
        }
    };
    const addItem = () => setForm(f => ({ ...f, items: [...f.items, { ...emptyItem }] }));
    const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

    // Totals
    const subtotal = form.items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity) || 0), 0);
    const totalTax = form.items.reduce((sum, item) => sum + ((Number(item.price) * Number(item.quantity) * (Number(item.tax) || 0)) / 100), 0);
    const total = subtotal + totalTax;

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Mark all fields as touched
        setTouched(prev => ({
            ...prev,
            invoiceNumber: true,
            invoiceDate: true,
            dueDate: true,
            businessName: true,
            email: true,
            address: true,
            clientName: true,
            clientEmail: true,
            clientAddress: true,
        }));
        // Validate all fields
        const errors = validate();
        setFieldErrors(errors);
        if (Object.values(errors).some(Boolean)) return;
        setLoading(true);
        try {
            console.log('Submitting form data:', form);
            
            // Transform form data to match the expected API structure
            const transformedData = {
                invoiceNumber: form.invoiceNumber,
                invoiceDate: form.invoiceDate,
                dueDate: form.dueDate,
                billingFrom: { // Convert billFrom to billingFrom
                    businessName: form.billFrom?.businessName || '',
                    email: form.billFrom?.email || '',
                    address: form.billFrom?.address || '',
                    phone: form.billFrom?.phone || ''
                },
                billingTo: { // Convert billTo to billingTo
                    clientName: form.billTo?.clientName || '',
                    email: form.billTo?.clientEmail || '', // Adjust the field name
                    address: form.billTo?.clientAddress || '', // Adjust the field name
                    phone: form.billTo?.clientPhone || '' // Adjust the field name
                },
                items: form.items.map(item => ({
                    name: item.name,
                    quantity: Number(item.quantity) || 1,
                    unitPrice: Number(item.price) || 0, // Adjust field name to unitPrice
                    taxPercent: Number(item.tax) || 0, // Adjust field name to taxPercent
                    total: (Number(item.price) * Number(item.quantity) * (1 + (Number(item.tax) || 0) / 100)) || 0 // Calculate total
                })),
                notes: form.notes,
                paymentTerms: form.paymentTerms,
                subTotal: subtotal, // Add calculated subtotal
                taxTotal: totalTax, // Add calculated taxTotal
                total: total, // Add calculated total
                status: 'unpaid' // Add status since it might be required
            };

            console.log('Transformed data:', transformedData);
            
            if (isEdit) {
                await axiosInstance.put(API_PATHS.INVOICE.UPDATE_INVOICE(invoiceId), transformedData);
                toast.success('Invoice updated successfully');
            } else {
                await axiosInstance.post(API_PATHS.INVOICE.CREATE, transformedData);
                toast.success('Invoice created successfully');
            }
            navigate('/invoices');
        } catch (error) {
            console.error('Invoice submission error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Full error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                headers: error.response?.headers,
                config: error.config
            });
            
            let errorMessage = 'Unknown error occurred';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            // More specific error handling based on status codes
            if (error.response?.status === 500) {
                errorMessage = 'Server error. There might be a problem with the data format. Please try again.';
            } else if (error.response?.status === 400) {
                errorMessage = 'Invalid invoice data. Please check all fields and try again.';
            } else if (error.response?.status === 401 || error.response?.status === 403) {
                errorMessage = 'Authentication error. Please log in again.';
                // Might want to redirect to login or refresh token here
            }
            
            toast.error('Failed to save invoice: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            {(loading || authLoading) ? (
                // Loading skeleton with animate-pulse
                <div className="animate-pulse">
                    <div className="flex justify-between items-center mb-6">
                        <div className="h-8 w-48 bg-gray-200 rounded"></div>
                        <div className="h-12 w-32 bg-gray-200 rounded-xl"></div>
                    </div>
                    
                    {/* Invoice meta skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {Array(3).fill(0).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                <div className="h-10 w-full bg-gray-200 rounded-md"></div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Bill From / Bill To skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {Array(2).fill(0).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl shadow p-6">
                                <div className="h-6 w-20 bg-gray-200 rounded mb-4"></div>
                                {Array(4).fill(0).map((_, j) => (
                                    <div key={j} className="space-y-2 mb-4">
                                        <div className="h-4 w-20 bg-gray-200 rounded"></div>
                                        <div className="h-10 w-full bg-gray-200 rounded-md"></div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    
                    {/* Items skeleton */}
                    <div className="bg-white rounded-2xl shadow p-6 mb-8">
                        <div className="h-6 w-16 bg-gray-200 rounded mb-4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                            {Array(5).fill(0).map((_, i) => (
                                <div key={i} className="h-4 w-12 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                        {Array(2).fill(0).map((_, i) => (
                            <div key={i} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-2">
                                {Array(5).fill(0).map((_, j) => (
                                    <div key={j} className="h-10 w-full bg-gray-200 rounded-md"></div>
                                ))}
                            </div>
                        ))}
                        <div className="h-10 w-28 bg-gray-200 rounded-md mt-4"></div>
                    </div>
                    
                    {/* Notes & Summary skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-2xl shadow p-6">
                            <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
                            <div className="space-y-4">
                                <div className="h-20 w-full bg-gray-200 rounded-md"></div>
                                <div className="h-10 w-full bg-gray-200 rounded-md"></div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow p-6">
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="h-4 w-12 bg-gray-200 rounded"></div>
                                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                                </div>
                                <div className="border-t pt-4">
                                    <div className="flex justify-between">
                                        <div className="h-6 w-16 bg-gray-200 rounded"></div>
                                        <div className="h-6 w-24 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
        <form className="max-w-6xl mx-auto" onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 mt-2">{isEdit ? 'Edit Invoice' : 'Create Invoice'}</h1>

                <div className="flex justify-end">
                    <Button type="submit" isLoading={loading || isGeneratingNumber} size="large">{isEdit ? 'Update Invoice' : 'Create Invoice'}</Button>
                </div>
            </div>

            {/* Invoice meta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <InputField label="Invoice Number" name="invoiceNumber" value={form.invoiceNumber} onChange={handleChange} onBlur={handleBlur} placeholder={isGeneratingNumber ? 'Generating...' : ''} required disabled />
                {fieldErrors.invoiceNumber && touched.invoiceNumber && <div className="text-red-500 text-xs mt-1">{fieldErrors.invoiceNumber}</div>}
                <InputField label="Invoice Date" name="invoiceDate" type="date" value={form.invoiceDate} onChange={handleChange} onBlur={handleBlur} required />
                {fieldErrors.invoiceDate && touched.invoiceDate && <div className="text-red-500 text-xs mt-1">{fieldErrors.invoiceDate}</div>}
                <InputField label="Due Date" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} onBlur={handleBlur} required />
                {fieldErrors.dueDate && touched.dueDate && <div className="text-red-500 text-xs mt-1">{fieldErrors.dueDate}</div>}
            </div>

            {/* Bill From / Bill To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="font-semibold text-lg mb-4">Bill From</h2>
                    <InputField label="Business Name" name="businessName" value={form.billFrom?.businessName || ''} onChange={handleBillFromChange} onBlur={handleBlur} required />
                    {fieldErrors.businessName && touched.businessName && <div className="text-red-500 text-xs mt-1">{fieldErrors.businessName}</div>}
                    <InputField label="Email" name="email" type="email" value={form.billFrom?.email || ''} onChange={handleBillFromChange} onBlur={handleBlur} required />
                    {fieldErrors.email && touched.email && <div className="text-red-500 text-xs mt-1">{fieldErrors.email}</div>}
                    <TextareaField label="Address" name="address" value={form.billFrom?.address || ''} onChange={handleBillFromChange} onBlur={handleBlur} required />
                    {fieldErrors.address && touched.address && <div className="text-red-500 text-xs mt-1">{fieldErrors.address}</div>}
                    <InputField label="Phone" name="phone" value={form.billFrom?.phone || ''} onChange={handleBillFromChange} />
                </div>
                <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="font-semibold text-lg mb-4">Bill To</h2>
                    <InputField label="Client Name" name="clientName" value={form.billTo?.clientName || ''} onChange={handleBillToChange} onBlur={handleBlur} required />
                    {fieldErrors.clientName && touched.clientName && <div className="text-red-500 text-xs mt-1">{fieldErrors.clientName}</div>}
                    <InputField label="Client Email" name="clientEmail" type="email" value={form.billTo?.clientEmail || ''} onChange={handleBillToChange} onBlur={handleBlur} required />
                    {fieldErrors.clientEmail && touched.clientEmail && <div className="text-red-500 text-xs mt-1">{fieldErrors.clientEmail}</div>}
                    <TextareaField label="Client Address" name="clientAddress" value={form.billTo?.clientAddress || ''} onChange={handleBillToChange} onBlur={handleBlur} required />
                    {fieldErrors.clientAddress && touched.clientAddress && <div className="text-red-500 text-xs mt-1">{fieldErrors.clientAddress}</div>}
                    <InputField label="Client Phone" name="clientPhone" value={form.billTo?.clientPhone || ''} onChange={handleBillToChange} />
                </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl shadow p-6 mb-8">
                <h2 className="font-semibold text-lg mb-4">Items</h2>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-2 font-semibold text-gray-500 text-xs uppercase">
                    <div>Item</div>
                    <div>Qty</div>
                    <div>Price</div>
                    <div>Tax (%)</div>
                    <div>Total</div>
                </div>
                {form.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-2 items-center">
                        <div>
                            <InputField name="name" value={item.name} onChange={e => handleItemChange(idx, e)} onBlur={e => handleItemBlur(idx, e)} required />
                            {fieldErrors[`item_name_${idx}`] && (touched[`item_name_${idx}`] || touched[`item_name_${idx}`] === undefined) && <div className="text-red-500 text-xs mt-1">{fieldErrors[`item_name_${idx}`]}</div>}
                        </div>
                        <div>
                            <InputField name="quantity" type="number" min={1} value={item.quantity} onChange={e => handleItemChange(idx, e)} onBlur={e => handleItemBlur(idx, e)} required />
                            {fieldErrors[`item_quantity_${idx}`] && (touched[`item_quantity_${idx}`] || touched[`item_quantity_${idx}`] === undefined) && <div className="text-red-500 text-xs mt-1">{fieldErrors[`item_quantity_${idx}`]}</div>}
                        </div>
                        <div>
                            <InputField name="price" type="number" min={0} value={item.price} onChange={e => handleItemChange(idx, e)} onBlur={e => handleItemBlur(idx, e)} required />
                            {fieldErrors[`item_price_${idx}`] && (touched[`item_price_${idx}`] || touched[`item_price_${idx}`] === undefined) && <div className="text-red-500 text-xs mt-1">{fieldErrors[`item_price_${idx}`]}</div>}
                        </div>
                        <InputField name="tax" type="number" min={0} value={item.tax} onChange={e => handleItemChange(idx, e)} />
                        <div className="font-semibold text-gray-900">${((Number(item.price) * Number(item.quantity) * (1 + (Number(item.tax) || 0) / 100)) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        {form.items.length > 1 && (
                            <button type="button" onClick={() => removeItem(idx)} className="ml-2 text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                        )}
                    </div>
                ))}
                {fieldErrors.items && <div className="text-red-500 text-xs mt-1">{fieldErrors.items}</div>}
                <Button type="button" variant="secondary" icon={Plus} className="mt-2 flex items-center border border-slate-300 rounded-md px-3 py-2" onClick={addItem}>Add Item</Button>
            </div>

            {/* Notes & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="font-semibold text-lg mb-4">Notes & Terms</h2>
                    <TextareaField label="Notes" name="notes" value={form.notes} onChange={handleChange} />
                    <SelectField label="Payment Terms" name="paymentTerms" value={form.paymentTerms} onChange={handleChange} options={paymentTermsOptions} />
                </div>
                <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between mb-2 text-gray-700"><span>Subtotal:</span> <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                        <div className="flex justify-between mb-2 text-gray-700"><span>Tax:</span> <span>${totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                    </div>
                    <div className="flex justify-between items-center mt-4 text-lg font-bold text-gray-900 border-t pt-4"><span>Total:</span> <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                </div>
            </div>
        </form>
            )}
        </div>
    );
};

export default CreateInvoice;