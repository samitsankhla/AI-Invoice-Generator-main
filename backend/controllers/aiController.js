const Invoice = require('../models/Invoice.js');
const User = require('../models/User.js');

// Use @google/genai for Gemini API
let ai = null;
try {
    const { GoogleGenAI } = require('@google/genai');
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch (err) {
    console.warn('Google GenAI client not found or not configured: AI routes will return 501 until configured.');
}

const parseInvoiceFromText = async (req, res) => {
    if (!ai) {
        return res.status(501).json({ message: 'AI client not configured. Install and configure a Google GenAI client (e.g. @google/genai) and set GEMINI_API_KEY.' });
    }

    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ message: 'Please provide text to parse' });
    }

    try {
        const prompt = `
            Analyze the following text and extract relevant information to create an invoice.
            The output MUST be a valid JSON object with the following structure:
            {
                "billTo": {
                    "clientName": "string",
                    "clientEmail": "string (if available)",
                    "clientAddress": "string (if available)",
                    "clientPhone": "string (if available)"
                },
                "items": [
                    {
                        "name": "string",
                        "quantity": number,
                        "price": number,
                        "tax": number (percentage, default 0)
                    }
                ],
                "notes": "string (if any additional notes mentioned)",
                "paymentTerms": "Net 30" (or other terms if mentioned)
            }
            
            Here is the text to parse:
            -- TEXT START --
            ${text}
            -- TEXT END --

            Extract the data and provide only the JSON object as output.
        `;

        // Use the correct API for @google/genai
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const responseText = response.text;
        const cleanedJSON = responseText.replace(/```json|```/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(cleanedJSON);
        
        // Return in the expected format
        res.status(200).json({
            success: true,
            data: parsedData,
            message: 'Invoice data parsed successfully'
        });
    } catch (error) {
        console.error('Error parsing invoice text:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to parse invoice text',
            error: error.message 
        });
    }
};

const generateReminderEmail = async (req, res) => {
    const { invoiceId } = req.body;

    if (!ai) {
        return res.status(501).json({ message: 'AI client not configured. Install and configure a Google GenAI client (e.g. @google/genai) and set GEMINI_API_KEY.' });
    }

    if (!invoiceId) {
        return res.status(400).json({ message: 'Please provide an invoice ID' });
    }

    try {
        const invoice = await Invoice.findById(invoiceId);
        
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Handle both billingTo and billTo field names for compatibility
        const clientName = invoice.billingTo?.clientName || invoice.billTo?.clientName || 'Valued Client';
        const invoiceNumber = invoice.invoiceNumber || 'N/A';
        const total = invoice.total || 0;
        const dueDate = invoice.dueDate || new Date();

        const prompt = `
            You are a professional and polite accounting assistant. Write a friendly payment reminder email to a client about an overdue or upcoming invoice payment.

            Use the following details to personalize the email:
            - Client Name: ${clientName}
            - Invoice Number: ${invoiceNumber}
            - Amount Due: $${total.toFixed(2)}
            - Due Date: ${new Date(dueDate).toLocaleDateString()}
            
            The tone should be courteous and understanding, while clearly requesting payment. Include a call to action for the client to contact us if they have any questions or need assistance.
            
            Start the email with a proper greeting and end with a professional closing. Make it personal and friendly but professional.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        res.status(200).json({ 
            success: true,
            reminderText: response.text,
            invoice: {
                number: invoiceNumber,
                clientName: clientName,
                amount: total,
                dueDate: dueDate
            }
        });
    } catch (error) {
        console.error('Error generating reminder email:', error);
        return res.status(500).json({ message: 'Failed to generate reminder email' });
    }
};

const getDashboardSummary = async (req, res) => {
    if (!ai) {
        return res.status(501).json({ message: 'AI client not configured. Install and configure a Google GenAI client (e.g. @google/genai) and set GEMINI_API_KEY.' });
    }

    try {
        const invoices = await Invoice.find({ user: req.user.id });

        if (invoices.length === 0) {
            return res.status(200).json({ insights: 'No invoices found to analyze.' });
        }

        // proceed and summarize
        const totalInvoices = invoices.length;
        const paidInvoices = invoices.filter(inv => inv.status === 'paid');
        const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid');
        const totalRevenue = paidInvoices.reduce((acc, inv) => acc + inv.total, 0);
        const totalOutstanding = unpaidInvoices.reduce((acc, inv) => acc + inv.total, 0);

        const dataSummary = `
            Total number of invoices: ${totalInvoices}
            Total paid invoices: ${paidInvoices.length}
            Total unpaid/pending invoices: ${unpaidInvoices.length}
            Total revenue from paid invoices: ${totalRevenue.toFixed(2)}
            Total outstanding amount from unpaid/pending invoices: ${totalOutstanding.toFixed(2)}
            Recent invoices (last 5): ${invoices.slice(0, 5).map(inv => `Invoice #${inv.invoiceNumber} for ${inv.total.toFixed(2)} with status: ${inv.status}`).join('; ')}
        `;

        const prompt = `
            You are a friendly and insightful financial analyst for small business owner.
            Based on the following invoice data summary, provide 5 key insights about the user's business finances. Highlight trends, potential issues, or opportunities for improvement.
            Each insight should be concise and actionable string in JSON array.
            The insights should be encouraging and helpful. Do not just repeat the data points.
            For example, if there are many unpaid invoices, suggest strategies to improve collections. If revenue is growing, be encouraging.

            Data Summary:
            ${dataSummary}

            Provide the insights as a JSON object with a single key "insights" containing an array of strings.
            Example format: { "insights": ["Your revenue is growing steadily, consider investing in marketing to capitalize on this trend."] }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const responseText = response.text;
        const cleanedJSON = responseText.replace(/```json|```/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(cleanedJSON);
        return res.status(200).json(parsedData);
    } catch (error) {
        console.error('Error generating dashboard summary:', error);
        return res.status(500).json({ message: 'Failed to generate dashboard summary', error: error });
    }
};

module.exports = {
    parseInvoiceFromText,
    generateReminderEmail,
    getDashboardSummary,
};
