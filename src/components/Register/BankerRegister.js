import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone, FaLock, FaBuilding } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import apiFetch from '../../utils/api';

export default function BankerRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Full name is required');
      return false;
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    
    if (!formData.password) {
      toast.error('Password is required');
      return false;
    }
    
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      toast.error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim(),
        password: formData.password,
        role: 'Banker'
      };

      await apiFetch('/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      toast.success('Registration successful!.');
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 120
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: '50px 40px 40px 40px',
        width: '100%',
        maxWidth: 700,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: 80,
            height: 80,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0px',
            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
          }}>
            <FaBuilding size={32} color="#fff" />
          </div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#1a202c',
            margin: 0,
            marginBottom: 8
          }}>
            Banker Registration
          </h1>
          <p style={{
            color: '#718096',
            fontSize: 16,
            margin: 0
          }}>
            Join our banking partner network
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          {/* Name and Email Row */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
            {/* Name Field */}
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#2d3748',
                marginBottom: 8
              }}>
                Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <FaUser style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#a0aec0',
                  fontSize: 14
                }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 44px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 12,
                    fontSize: 16,
                    transition: 'border-color 0.2s',
                    outline: 'none',
                    background: '#f7fafc'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            {/* Email Field */}
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#2d3748',
                marginBottom: 8
              }}>
                Email Address <span style={{ color: '#a0aec0', fontWeight: 400 }}>(Optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <FaEnvelope style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#a0aec0',
                  fontSize: 14
                }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 44px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 12,
                    fontSize: 16,
                    transition: 'border-color 0.2s',
                    outline: 'none',
                    background: '#f7fafc'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>
          </div>

          {/* Phone Field - Full Width */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: '#2d3748',
              marginBottom: 8
            }}>
              Phone Number *
            </label>
            <div style={{ position: 'relative' }}>
              <FaPhone style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#a0aec0',
                fontSize: 14
              }} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  border: '2px solid #e2e8f0',
                  borderRadius: 12,
                  fontSize: 16,
                  transition: 'border-color 0.2s',
                  outline: 'none',
                  background: '#f7fafc'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          {/* Password and Confirm Password Row */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 32 }}>
            {/* Password Field */}
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#2d3748',
                marginBottom: 8
              }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <FaLock style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#a0aec0',
                  fontSize: 14
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a secure password"
                  style={{
                    width: '100%',
                    padding: '14px 50px 14px 44px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 12,
                    fontSize: 16,
                    transition: 'border-color 0.2s',
                    outline: 'none',
                    background: '#f7fafc'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#a0aec0',
                    fontSize: 16
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#2d3748',
                marginBottom: 8
              }}>
                Confirm Password *
              </label>
              <div style={{ position: 'relative' }}>
                <FaLock style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#a0aec0',
                  fontSize: 14
                }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  style={{
                    width: '100%',
                    padding: '14px 50px 14px 44px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 12,
                    fontSize: 16,
                    transition: 'border-color 0.2s',
                    outline: 'none',
                    background: '#f7fafc'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#a0aec0',
                    fontSize: 16
                  }}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
              transform: loading ? 'none' : 'translateY(0)',
              marginBottom: 20
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }
            }}
          >
            {loading ? 'Creating Account...' : 'Create Banker Account'}
          </button>

          
        </form>

        {/* Password Requirements */}
        <div style={{
          marginTop: 24,
          padding: 16,
          background: '#f7fafc',
          borderRadius: 8,
          border: '1px solid #e2e8f0'
        }}>
          <p style={{ fontSize: 12, color: '#4a5568', margin: 0, fontWeight: 600 }}>
            Password Requirements:
          </p>
          <ul style={{ fontSize: 11, color: '#718096', margin: '4px 0 0 0', paddingLeft: 16 }}>
            <li>At least 8 characters long</li>
            <li>One uppercase letter</li>
            <li>One lowercase letter</li>
            <li>One number</li>
          </ul>
        </div>
      </div>

      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}