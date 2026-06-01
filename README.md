# AI Invoice Generator

<div align="center">
  <img src="frontend/invoice-generator/public/app-logo.png" alt="AI Invoice Generator Logo" width="150"/>
  <h3>Modern Invoicing Powered by AI</h3>
</div>

## 📋 Overview

AI Invoice Generator is a comprehensive full-stack application designed to streamline the invoice creation and management process for freelancers, small businesses, and professionals. The application combines modern UI design with AI assistance to provide a seamless invoicing experience.

With features like AI-powered invoice generation from text descriptions, intelligent dashboard analytics, customizable invoice templates, and automated payment reminders, AI Invoice Generator helps users save time and maintain professional invoicing standards.

## ✨ Features

### 🔐 User Authentication & Profile Management
- Secure signup and login system
- Profile completion requirements
- Business information management
- JWT-based authentication

### 📊 Dashboard & Analytics
- Invoice overview statistics
- Payment status tracking
- Recent invoice activity
- AI-generated insights

### 📝 Invoice Management
- Create invoices with automatic calculations
- Edit and update existing invoices
- AI-powered invoice creation from text descriptions
- Professional invoice templates
- PDF export functionality

### 💬 AI Features
- Text-to-invoice generation
- AI-generated payment reminder emails
- Smart invoice data parsing
- Business insights

### 📱 Responsive Design
- Mobile-friendly interface
- Optimized for all device sizes
- Animated transitions and loading states

## 🛠️ Technology Stack

### Frontend
- **React** (v19) - Modern UI library
- **React Router** - Navigation and routing
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Beautiful icons
- **Moment.js** - Date formatting

### Backend
- **Express.js** - Web server framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Google Generative AI** - AI capabilities

### Development Tools
- **Vite** - Frontend build tool
- **ESLint** - Code quality
- **Node.js** - JavaScript runtime

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB database
- Google AI API key

### Installation

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend/invoice-generator

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your environment variables to .env
```

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your environment variables to .env including:
# - MongoDB connection string
# - JWT secret
# - Google AI API key
```

### Running the Application

#### Development Mode
```bash
# Run backend (from backend directory)
npm run dev

# Run frontend (from frontend/invoice-generator directory)
npm run dev
```

#### Production Build
```bash
# Build frontend
cd frontend/invoice-generator
npm run build

# Start backend in production mode
cd ../../backend
npm start
```

## 📝 Usage Guide

### Creating an Account
1. Navigate to the signup page
2. Fill in your email and password
3. Complete your profile with business information
4. You'll be redirected to the dashboard

### Creating an Invoice
1. Click "Create Invoice" on the dashboard
2. Fill in invoice details manually or use AI assistance
3. Add items with quantities, prices, and tax rates
4. Review the generated invoice
5. Save or send the invoice

### Using AI Features
1. Click "Create with AI" on the invoice page
2. Describe the invoice details in natural language
3. Review and edit the AI-generated invoice
4. Save or make additional changes

### Managing Invoices
1. View all invoices on the "Invoices" page
2. Filter by status (paid, unpaid, overdue)
3. Click on an invoice to view details
4. Use the action menu to edit, delete, or send reminders

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Google Generative AI](https://ai.google.dev/)
- And all other open source libraries used in this project

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/samitsankhla">Samit Sankhla</a></p>
</div># AI-Invoice-Generator
# AI-Invoice-Generator
# AI-Invoice-Generator
# AI-Invoice-Generator
