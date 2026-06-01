import React, { useState } from 'react'
import { Eye, EyeOff, Loader2, Mail, Lock, FileText, ArrowRight } from 'lucide-react';

import { API_BASE_URL, API_PATHS } from '../../utils/apiPaths';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';


const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({ email: null, password: null });
  const [touched, setTouched] = useState({ email: false, password: false });

  const validate = (name, value) => {
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : 'Please enter a valid email address';
    }
    if (name === 'password') {
      return value && value.length >= 6 ? null : 'Password must be at least 6 characters';
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // clear server messages when user edits
    setError(null);
    setSuccess(null);
    if (touched[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const isFormValid = () => {
    return !validate('email', formData.email) && !validate('password', formData.password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setFieldErrors({ email: validate('email', formData.email), password: validate('password', formData.password) });
    setError(null);

    if (!isFormValid()) return;

    setLoading(true);
    try {
      const resp = await axios.post(`${API_BASE_URL}/${API_PATHS.AUTH.LOGIN}`, formData, { headers: { 'Content-Type': 'application/json' } });
      const data = resp.data;
      // call context login
      await login({ 
        name: data.name, 
        email: data.email,
        businessName: data.businessName,
        businessAddress: data.businessAddress,
        address: data.address,
        phone: data.phone
      }, data.token);
      toast.success('Login successful!');
      // small delay so users can see success message (optional)
      setTimeout(() => navigate('/dashboard'), 250);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 animate-fade-in">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105">
            <div className="text-center animate-slide-down">
                <div className="mx-auto w-12 h-12 bg-blue-900 rounded-md flex items-center justify-center animate-pulse">
                    <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Login to Your Account</h2>
                <p className="mt-2 text-sm text-gray-500">Welcome back to Invoice Generator</p>
            </div>
            <form className="mt-8 space-y-6 animate-fade-in-up" onSubmit={handleSubmit} noValidate>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="email">Email</label>
                        <div className={`relative rounded-md border ${fieldErrors.email && touched.email ? 'border-red-400' : 'border-gray-200'} bg-white transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-md` }>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="appearance-none block w-full px-4 py-3 pl-12 border-0 focus:outline-none"
                                placeholder="you@example.com"
                            />
                        </div>
                        {fieldErrors.email && touched.email && (
                            <p className="mt-2 text-sm text-red-500 animate-shake">{fieldErrors.email}</p>
                        )}
                    </div>
                    <div className="mt-4">
                        <label htmlFor="password">Password</label>
                        <div className={`relative rounded-md border ${fieldErrors.password && touched.password ? 'border-red-400' : 'border-gray-200'} bg-white transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-md` }>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="appearance-none block w-full px-4 py-3 pl-12 border-0 focus:outline-none"
                                placeholder="Enter your password"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-500 transition-colors duration-200">
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {fieldErrors.password && touched.password && (
                            <p className="mt-2 text-sm text-red-500 animate-shake">{fieldErrors.password}</p>
                        )}
                    </div>
                </div>

                {error && <div className="text-red-600 text-sm animate-bounce">{error}</div>}
                {success && <div className="text-green-600 text-sm animate-bounce">{success}</div>}

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-950 hover:to-blue-900 disabled:opacity-60 transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                </div>
                <div className="text-center text-sm text-gray-500">
                    Don't have an account? <Link to="/signup" className="text-blue-900 font-medium hover:text-blue-700 transition-colors duration-200">Sign up</Link>
                </div>
            </form>
        </div>
    </div>
)
}

export default Login