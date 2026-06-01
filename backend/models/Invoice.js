// model 
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    taxPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    total: {
        type: Number,
        required: true,
        min: 0
    }
});

const invoiceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    invoiceDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    billingFrom: {
        businessName: { 
            type: String, 
            required: [true, 'Business name is required'] 
        }, 
        address: { 
            type: String, 
            required: [true, 'Business address is required'] 
        },
        email: { 
            type: String, 
            required: [true, 'Business email is required'] 
        },
        phone: { 
            type: String, 
            default: '' 
        }
    },
    billingTo: {
        clientName: { 
            type: String, 
            required: [true, 'Client name is required'] 
        },
        address: { 
            type: String, 
            default: '' // Make this optional since frontend sometimes doesn't provide it
        },
        email: { 
            type: String, 
            default: '' // Make this optional since frontend sometimes doesn't provide it
        },
        phone: { 
            type: String, 
            default: '' 
        }
    },
    items: [itemSchema],
    notes: {
        type: String,
        default: ''
    },
    paymentTerms: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['paid', 'unpaid'],
        default: 'unpaid'
    },
    subTotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
