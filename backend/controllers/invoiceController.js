const Invoice = require('../models/Invoice');

// @desc    Check if invoice number exists
// @route   GET /api/invoices/exists/:invoiceNumber
// @access  Public (for form validation)
exports.checkInvoiceNumberExists = async (req, res) => {
    try {
        const { invoiceNumber } = req.params;
        const exists = await Invoice.exists({ invoiceNumber });
        res.json({ exists: !!exists });
    } catch (err) {
        console.error('Check invoice exists error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = async (req, res) => {
    try {
        console.log('Creating invoice - User:', req.user);
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        // Ensure authenticated user exists (use consistent ID format)
        if (!req.user || !req.user._id) {
            console.log('Auth check failed:', { user: req.user });
            return res.status(401).json({ message: 'Not authorized' });
        }

        const user = req.user;
        const {
            invoiceNumber,
            invoiceDate,
            dueDate,
            billingFrom: billingFromBody,
            billingTo: billingToBody,
            billFrom,
            billTo,
            items = [],
            notes = '',
            paymentTerms = '',
            status = 'unpaid',
            subTotal: subTotalBody,
            taxTotal: taxTotalBody,
            total: totalBody,
        } = req.body;

        // Validate required fields
        if (!invoiceNumber || !invoiceDate || !dueDate) {
            return res.status(400).json({ 
                message: 'Missing required fields', 
                missing: {
                    invoiceNumber: !invoiceNumber,
                    invoiceDate: !invoiceDate,
                    dueDate: !dueDate
                }
            });
        }

        // Normalize billingFrom/billingTo shape (support both old and new frontend payloads)
        const billingFrom = billingFromBody ?? {
            businessName: billFrom?.businessName || '',
            address: billFrom?.address || '',
            email: billFrom?.email || '',
            phone: billFrom?.phone || ''
        };

        const billingTo = billingToBody ?? {
            clientName: billTo?.clientName || '',
            address: billTo?.clientAddress || billTo?.address || '',
            email: billTo?.clientEmail || billTo?.email || '',
            phone: billTo?.clientPhone || billTo?.phone || ''
        };

        console.log('Normalized billing info:', { billingFrom, billingTo });

        // Validate billing info - only check for required fields
        if (!billingFrom.businessName || !billingFrom.email || !billingFrom.address) {
            return res.status(400).json({ 
                message: 'Missing required billing from information',
                missing: {
                    businessName: !billingFrom.businessName,
                    email: !billingFrom.email,
                    address: !billingFrom.address
                }
            });
        }

        if (!billingTo.clientName) {
            return res.status(400).json({ 
                message: 'Missing required billing to information',
                missing: {
                    clientName: !billingTo.clientName
                }
            });
        }

        // Normalize items and compute totals
        let computedSubTotal = 0;
        let computedTaxTotal = 0;

        const normalizedItems = (items || []).map((item, index) => {
            console.log(`Processing item ${index}:`, item);
            
            const quantity = Number(item.quantity) || 0;
            const unitPrice = item.unitPrice != null ? Number(item.unitPrice) : Number(item.price) || 0;
            const taxPercent = item.taxPercent != null ? Number(item.taxPercent) : Number(item.tax) || 0;

            if (!item.name) {
                throw new Error(`Item ${index + 1} is missing a name`);
            }

            const itemSubtotal = quantity * unitPrice;
            const itemTax = (itemSubtotal * taxPercent) / 100;
            const itemTotal = item.total != null ? Number(item.total) : itemSubtotal + itemTax;

            computedSubTotal += itemSubtotal;
            computedTaxTotal += itemTax;

            return {
                name: item.name,
                quantity,
                unitPrice,
                taxPercent,
                total: itemTotal,
            };
        });

        console.log('Normalized items:', normalizedItems);

        const subTotal = subTotalBody != null ? Number(subTotalBody) : computedSubTotal;
        const taxTotal = taxTotalBody != null ? Number(taxTotalBody) : computedTaxTotal;
        const total = totalBody != null ? Number(totalBody) : subTotal + taxTotal;

        console.log('Calculated totals:', { subTotal, taxTotal, total });

        const invoiceData = {
            user: user._id,
            invoiceNumber,
            invoiceDate: new Date(invoiceDate),
            dueDate: new Date(dueDate),
            billingFrom,
            billingTo,
            items: normalizedItems,
            notes,
            paymentTerms,
            status,
            subTotal,
            taxTotal,
            total,
        };

        console.log('Final invoice data:', JSON.stringify(invoiceData, null, 2));

        const newInvoice = new Invoice(invoiceData);
        const savedInvoice = await newInvoice.save();
        
        console.log('Invoice saved successfully:', savedInvoice._id);
        res.status(201).json(savedInvoice);
    } catch (error) {
        console.error('Error creating invoice:', error);
        console.error('Error stack:', error.stack);
        console.error('Request body:', JSON.stringify(req.body, null, 2));

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ 
                message: 'Validation error', 
                errors,
                details: error.errors
            });
        }

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'Invoice number already exists',
                duplicateField: Object.keys(error.keyPattern)[0]
            });
        }

        // Handle custom validation errors
        if (error.message && error.message.includes('missing')) {
            return res.status(400).json({
                message: error.message,
                requestBody: req.body
            });
        }

        // Generic server error
        res.status(500).json({
            message: 'Server error while creating invoice',
            error: error.message,
            // Only include stack trace in development
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
};

// @desc    Get all invoices for a user
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
    try {
        // Use consistent ID format
        const invoices = await Invoice.find({ user: req.user._id }).populate('user', 'name email');
        res.json(invoices);
    } catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id).populate('user', 'name email');
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Check if the invoice belongs to the authenticated user (use consistent ID format)
        if (invoice.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to access this invoice' });
        }
        res.json(invoice);
    } catch (error) {
        console.error('Get invoice by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
exports.updateInvoice = async (req, res) => {
    try {
        console.log('Updating invoice:', req.params.id);
        console.log('Update data:', JSON.stringify(req.body, null, 2));

        const {
            invoiceNumber,
            invoiceDate,
            dueDate,
            billingFrom,
            billingTo,
            items,
            notes,
            paymentTerms,
            status, 
        } = req.body;

        // Find the invoice first to check ownership
        const existingInvoice = await Invoice.findById(req.params.id);
        if (!existingInvoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Check ownership
        if (existingInvoice.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this invoice' });
        }

        // Recalculate totals
        let subTotal = 0;
        let taxTotal = 0;
        let normalizedItems = [];

        if (items && items.length > 0) {
            normalizedItems = items.map(item => {
                const quantity = Number(item.quantity) || 0;
                const unitPrice = item.unitPrice != null ? Number(item.unitPrice) : Number(item.price) || 0;
                const taxPercent = item.taxPercent != null ? Number(item.taxPercent) : Number(item.tax) || 0;

                const itemSubtotal = quantity * unitPrice;
                const itemTax = (itemSubtotal * taxPercent) / 100;
                const itemTotal = itemSubtotal + itemTax;

                subTotal += itemSubtotal;
                taxTotal += itemTax;

                return {
                    name: item.name,
                    quantity,
                    unitPrice,
                    taxPercent,
                    total: itemTotal
                };
            });
        }

        const total = subTotal + taxTotal;

        const updateData = {
            invoiceNumber,
            invoiceDate: invoiceDate ? new Date(invoiceDate) : existingInvoice.invoiceDate,
            dueDate: dueDate ? new Date(dueDate) : existingInvoice.dueDate,
            billingFrom: billingFrom || existingInvoice.billingFrom,
            billingTo: billingTo || existingInvoice.billingTo,
            items: normalizedItems,
            notes: notes !== undefined ? notes : existingInvoice.notes,
            paymentTerms: paymentTerms || existingInvoice.paymentTerms,
            status: status || existingInvoice.status,
            subTotal,
            taxTotal,
            total,
        };

        console.log('Final update data:', JSON.stringify(updateData, null, 2));

        const updatedInvoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        console.log('Invoice updated successfully');
        res.json(updatedInvoice);
    } catch (error) {
        console.error('Update invoice error:', error);
        console.error('Error stack:', error.stack);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ 
                message: 'Validation error', 
                errors,
                details: error.errors
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'Invoice number already exists',
                duplicateField: Object.keys(error.keyPattern)[0]
            });
        }

        res.status(500).json({ 
            message: 'Server error while updating invoice',
            error: error.message
        });
    }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
exports.deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Check ownership
        if (invoice.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this invoice' });
        }

        await Invoice.findByIdAndDelete(req.params.id);
        res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        console.error('Delete invoice error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};