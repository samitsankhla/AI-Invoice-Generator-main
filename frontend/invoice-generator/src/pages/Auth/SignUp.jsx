import React, { useState } from 'react'
import { Eye, EyeOff, Loader2, Mail, Lock, FileText, UserCheck } from 'lucide-react';
import { API_BASE_URL, API_PATHS } from '../../utils/apiPaths';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const SignUp = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [agree, setAgree] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ name: null, email: null, password: null, confirmPassword: null });
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirmPassword: false });

  const validate = (name, value) => {
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : 'Please enter a valid email address';
    }
    if (name === 'password') {
      return value && value.length >= 6 ? null : 'Password must be at least 6 characters';
    }
    if (name === 'confirmPassword') {
      return value === formData.password ? null : 'Passwords do not match';
    }
    if (name === 'name') {
      return value && value.trim().length > 1 ? null : 'Please enter your full name';
    }
    return null;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'agree') {
      setAgree(checked);
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
    if (touched[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  const isFormValid = () => {
    return (
      !validate('name', formData.name) &&
      !validate('email', formData.email) &&
      !validate('password', formData.password) &&
      !validate('confirmPassword', formData.confirmPassword) &&
      agree
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!isFormValid()) {
      toast.error('Please fill in all fields correctly and accept the terms.');
      return;
    }
    setLoading(true);
    try {
      const resp = await axios.post(`${API_BASE_URL}/${API_PATHS.AUTH.REGISTER}`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      const data = resp.data;
      // auto-login
      await login({ name: data.name, email: data.email }, data.token);
      toast.success('Account created successfully');
      setTimeout(() => navigate('/dashboard'), 300);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to create account. Please try again.');
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
                  <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create Account</h2>
                  <p className="mt-2 text-sm text-gray-500">Join Invoice Generator today</p>
              </div>
              <form className="mt-8 space-y-6 animate-fade-in-up" onSubmit={handleSubmit} noValidate>
                  <div className="space-y-6">
                      <div>
                          <label htmlFor="name">Full Name</label>
                          <div className={`relative rounded-md border ${fieldErrors.name && touched.name ? 'border-red-400' : 'border-gray-200'} bg-white transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-md`}>
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                  <UserCheck className="w-5 h-5" />
                              </div>
                              <input
                                  id="name"
                                  name="name"
                                  value={formData.name}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className="appearance-none block w-full px-4 py-3 pl-12 border-0 focus:outline-none"
                                  placeholder="Enter your full name"
                              />
                          </div>
                          {fieldErrors.name && touched.name && (
                              <p className="mt-2 text-sm text-red-500 animate-shake">{fieldErrors.name}</p>
                          )}
                      </div>
                      <div>
                          <label htmlFor="email">Email</label>
                          <div className={`relative rounded-md border ${fieldErrors.email && touched.email ? 'border-red-400' : 'border-gray-200'} bg-white transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-md`}>
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                  <Mail className="w-5 h-5" />
                              </div>
                              <input
                                  id="email"
                                  name="email"
                                  type="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className="appearance-none block w-full px-4 py-3 pl-12 border-0 focus:outline-none"
                                  placeholder="Enter your email"
                              />
                          </div>
                          {fieldErrors.email && touched.email && (
                              <p className="mt-2 text-sm text-red-500 animate-shake">{fieldErrors.email}</p>
                          )}
                      </div>
                      <div>
                          <label htmlFor="password">Password</label>
                          <div className={`relative rounded-md border ${fieldErrors.password && touched.password ? 'border-red-400' : 'border-gray-200'} bg-white transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-md`}>
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
                                  placeholder="Create a password"
                              />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-500 transition-colors duration-200">
                                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                          </div>
                          {fieldErrors.password && touched.password && (
                              <p className="mt-2 text-sm text-red-500 animate-shake">{fieldErrors.password}</p>
                          )}
                      </div>
                      <div>
                          <label htmlFor="confirmPassword">Confirm Password</label>
                          <div className={`relative rounded-md border ${fieldErrors.confirmPassword && touched.confirmPassword ? 'border-red-400' : 'border-gray-200'} bg-white transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-md`}>
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                  <Lock className="w-5 h-5" />
                              </div>
                              <input
                                  id="confirmPassword"
                                  name="confirmPassword"
                                  type={showPassword ? 'text' : 'password'}
                                  value={formData.confirmPassword}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className="appearance-none block w-full px-4 py-3 pl-12 border-0 focus:outline-none"
                                  placeholder="Confirm your password"
                              />
                          </div>
                          {fieldErrors.confirmPassword && touched.confirmPassword && (
                              <p className="mt-2 text-sm text-red-500 animate-shake">{fieldErrors.confirmPassword}</p>
                          )}
                      </div>
                      <div className="flex items-center">
                          <input id="agree" name="agree" type="checkbox" checked={agree} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                          <label htmlFor="agree" className="ml-2 block text-sm text-gray-600">I agree to the Terms of Service and Privacy Policy</label>
                      </div>
                  </div>

                  <div>
                      <button
                          type="submit"
                          disabled={loading}
                          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-950 hover:to-blue-900 disabled:opacity-60 transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                      </button>
                  </div>
                  <div className="text-center text-sm text-gray-500">
                      Already have an account? <Link to="/login" className="text-blue-900 font-medium hover:text-blue-700 transition-colors duration-200">Sign in</Link>
                  </div>
              </form>
          </div>
      </div>
  )
}

export default SignUp