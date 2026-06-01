// Serverless function entry point for Vercel
require('dotenv').config();
const app = require('../server');

// Export the Express app as a serverless function
module.exports = (req, res) => {
    return app(req, res);
};