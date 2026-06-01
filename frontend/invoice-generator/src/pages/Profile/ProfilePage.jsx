import React, { useState, useEffect } from 'react';
import { User, Mail, Building, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import InputField from '../../components/ui/InputField';
import TextareaField from '../../components/ui/TextareaField';
import Button from '../../components/ui/Button';

const ProfilePage = () => {
  const { user, updateUser, isProfileComplete, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessName: '',
    businessAddress: '', // New field for business address
    address: '', // Now for home address
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        businessName: user.businessName || '',
        businessAddress: user.businessAddress || '', // Map to businessAddress
        address: user.address || '', // Home address
        phone: user.phone || '',
      });
    }
  }, [user]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return !value.trim() ? 'Full name is required' : '';
      case 'businessName':
        return !value.trim() ? 'Business name is required' : '';
      case 'businessAddress':
        return !value.trim() ? 'Business address is required' : '';
      case 'address':
        // Home address is optional
        return '';
      case 'phone':
        return !value.trim() ? 'Phone number is required' : 
               !/^\+?[\d\s\-\(\)]+$/.test(value) ? 'Please enter a valid phone number' : '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'email') { // Skip email validation as it's disabled
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (touched[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    setLoading(true);

    try {
      const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, formData);
      
      if (response.data) {
        updateUser(response.data);
        toast.success('Profile updated successfully!');
        
        // If this was the first time completing profile, redirect to dashboard
        if (!isProfileComplete()) {
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {authLoading ? (
          // Loading skeleton
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            
            <div className="space-y-8">
              {/* Personal Information Skeleton */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
              
              {/* Business Information Skeleton */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-44"></div>
                  <div className="h-4 bg-gray-200 rounded w-96"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div> {/* New for business address */}
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div> {/* Updated for home address */}
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
              
              {/* Button Skeleton */}
              <div className="flex justify-end pt-6">
                <div className="h-12 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">My Profile</h1>
            
            {/* Profile completion notice */}
            {!isProfileComplete() && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Complete Your Profile
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Please fill in your business information to start creating invoices.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="space-y-6">
            <div>
              <InputField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                icon={Mail}
                placeholder="Enter your email"
                fieldErrors={errors}
                touched={touched}
              />
            </div>            <div>
              <InputField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                icon={User}
                placeholder="Enter your full name"
                fieldErrors={errors}
                touched={touched}
              />
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Business Information</h2>
              <p className="text-sm text-gray-600 mb-6">
                This will be used to pre-fill the "Bill From" section of your invoices
              </p>
            </div>

            <div>
              <InputField
                label="Business Name"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                onBlur={handleBlur}
                icon={Building}
                placeholder="Enter your business name"
                fieldErrors={errors}
                touched={touched}
              />
            </div>

            <div>
              <TextareaField
                label="Business Address"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleChange}
                onBlur={handleBlur}
                icon={MapPin}
                placeholder="Enter your business address"
                rows={4}
                fieldErrors={errors}
                touched={touched}
              />
            </div>

            <div>
              <TextareaField
                label="Home Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                icon={MapPin}
                placeholder="Enter your home address (optional)"
                rows={4}
                fieldErrors={errors}
                touched={touched}
              />
            </div>

            <div>
              <InputField
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                icon={Phone}
                placeholder="Enter your phone number"
                fieldErrors={errors}
                touched={touched}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              isLoading={loading}
              size="large"
            >
              Save Changes
            </Button>
          </div>
        </form>
        </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;