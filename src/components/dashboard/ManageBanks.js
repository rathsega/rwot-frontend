import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaHome, FaEnvelope, FaPhone, FaProductHunt, FaTimes, FaSearch } from 'react-icons/fa';
import apiFetch from "../../utils/api";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ManageBanks = () => {
  const [banks, setBanks] = useState([]);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    products: []
  });
  const [newProduct, setNewProduct] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBanks();
  }, []);

  useEffect(() => {
    filterBanks();
  }, [searchTerm, banks]);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/banks', { method: 'GET' });
      const banksData = response.banks || response || [];
      setBanks(banksData);
      setFilteredBanks(banksData);
    } catch (error) {
      toast.error('Failed to fetch banks');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterBanks = () => {
    if (!searchTerm.trim()) {
      setFilteredBanks(banks);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = banks.filter(bank => {
      const products = Array.isArray(bank.products) 
        ? bank.products 
        : JSON.parse(bank.products || '[]');
      
      return (
        bank.name.toLowerCase().includes(searchLower) ||
        bank.email.toLowerCase().includes(searchLower) ||
        bank.phone.toLowerCase().includes(searchLower) ||
        products.some(product => product.toLowerCase().includes(searchLower))
      );
    });

    setFilteredBanks(filtered);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Bank name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone is required');
      return false;
    }
    if (formData.products.length === 0) {
      toast.error('At least one product is required');
      return false;
    }

    // Check for duplicates
    const isDuplicate = banks.some(bank => {
      if (editingBank && bank.id === editingBank.id) return false;
      
      return (
        bank.name.toLowerCase() === formData.name.toLowerCase() &&
        bank.email.toLowerCase() === formData.email.toLowerCase() &&
        formData.products.some(product =>
          (Array.isArray(bank.products) ? bank.products : JSON.parse(bank.products || '[]')).includes(product)
        )
      );
    });

    if (isDuplicate) {
      toast.error('Duplicate record: Bank name, email, or product combination already exists');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (editingBank) {
        await apiFetch(`/banks/${editingBank.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        toast.success('Bank updated successfully');
      } else {
        await apiFetch('/banks', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        toast.success('Bank added successfully');
      }
      
      fetchBanks();
      resetForm();
    } catch (error) {
      toast.error(editingBank ? 'Failed to update bank' : 'Failed to add bank');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bank) => {
    setEditingBank(bank);
    setFormData({
      name: bank.name,
      email: bank.email,
      phone: bank.phone,
      products: Array.isArray(bank.products) ? bank.products : JSON.parse(bank.products || '[]')
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bank?')) return;

    try {
      setLoading(true);
      await apiFetch(`/banks/${id}`, { method: 'DELETE' });
      toast.success('Bank deleted successfully');
      fetchBanks();
    } catch (error) {
      toast.error('Failed to delete bank');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', products: [] });
    setNewProduct('');
    setEditingBank(null);
    setShowModal(false);
  };

  const addProduct = () => {
    if (!newProduct.trim()) {
      toast.error('Product name cannot be empty');
      return;
    }
    
    if (formData.products.includes(newProduct.trim())) {
      toast.error('Product already exists');
      return;
    }

    setFormData(prev => ({
      ...prev,
      products: [...prev.products, newProduct.trim()]
    }));
    setNewProduct('');
  };

  const removeProduct = (productToRemove) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(product => product !== productToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addProduct();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <h1 style={{ color: '#333', fontSize: '2.2em', margin: 0 }}>
          <FaHome style={{ marginRight: '10px', color: '#2979ff', verticalAlign: 'middle' }} />
          Manage Banks
        </h1>
        
        {/* Search Bar */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          alignItems: 'center',
          flex: '1',
          maxWidth: '500px',
          justifyContent: 'flex-end'
        }}>
          <div style={{ position: 'relative', flex: '1', maxWidth: '350px' }}>
            <input
              type="text"
              placeholder="Search by name, email, phone, or product..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 40px 10px 15px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2979ff'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
            <FaSearch style={{
              position: 'absolute',
              right: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#666',
              fontSize: '16px'
            }} />
          </div>

          {searchTerm && (
            <button
              onClick={clearSearch}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#b91c1c'}
              onMouseOut={(e) => e.target.style.background = '#dc2626'}
            >
              Clear
            </button>
          )}

          <button
            onClick={() => setShowModal(true)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            <FaPlus /> Add Bank
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div style={{ 
        marginBottom: '15px', 
        fontSize: '14px', 
        color: '#666',
        fontWeight: '500'
      }}>
        Showing {filteredBanks.length} of {banks.length} banks
        {searchTerm && ` (filtered by "${searchTerm}")`}
      </div>

      {/* Banks Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <th style={{ 
                padding: '16px', 
                textAlign: 'left', 
                fontWeight: '600', 
                color: 'white',
                fontSize: '14px',
                letterSpacing: '0.5px'
              }}>Bank Name</th>
              <th style={{ 
                padding: '16px', 
                textAlign: 'left', 
                fontWeight: '600', 
                color: 'white',
                fontSize: '14px',
                letterSpacing: '0.5px'
              }}>Email</th>
              <th style={{ 
                padding: '16px', 
                textAlign: 'left', 
                fontWeight: '600', 
                color: 'white',
                fontSize: '14px',
                letterSpacing: '0.5px'
              }}>Phone</th>
              <th style={{ 
                padding: '16px', 
                textAlign: 'left', 
                fontWeight: '600', 
                color: 'white',
                fontSize: '14px',
                letterSpacing: '0.5px'
              }}>Products</th>
              <th style={{ 
                padding: '16px', 
                textAlign: 'center', 
                fontWeight: '600', 
                color: 'white',
                fontSize: '14px',
                letterSpacing: '0.5px',
                width: '120px'
              }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBanks.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  color: '#999',
                  fontSize: '16px'
                }}>
                  {searchTerm ? 'No banks found matching your search' : 'No banks available'}
                </td>
              </tr>
            ) : (
              filteredBanks.map((bank, index) => (
                <tr 
                  key={bank.id} 
                  style={{ 
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                >
                  <td style={{ padding: '16px', fontWeight: '500', color: '#333' }}>{bank.name}</td>
                  <td style={{ padding: '16px', color: '#666' }}>{bank.email}</td>
                  <td style={{ padding: '16px', color: '#666' }}>{bank.phone}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(Array.isArray(bank.products) ? bank.products : JSON.parse(bank.products || '[]')).map((product, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                            color: '#1976d2',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            border: '1px solid #90caf9'
                          }}
                        >
                          {product}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <button
                        onClick={() => handleEdit(bank)}
                        style={{
                          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          minWidth: '36px',
                          minHeight: '36px'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 8px rgba(67, 233, 123, 0.3)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                        }}
                        title="Edit Bank"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(bank.id)}
                        style={{
                          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          minWidth: '36px',
                          minHeight: '36px'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 8px rgba(245, 87, 108, 0.3)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                        }}
                        title="Delete Bank"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '550px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{ margin: 0, color: '#333', fontSize: '24px', fontWeight: '700' }}>
                {editingBank ? 'Edit Bank' : 'Add New Bank'}
              </h2>
              <button
                onClick={resetForm}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseOver={(e) => e.target.style.color = '#dc2626'}
                onMouseOut={(e) => e.target.style.color = '#666'}
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  <FaHome style={{ marginRight: '6px', color: '#2979ff' }} /> Bank Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2979ff'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  <FaEnvelope style={{ marginRight: '6px', color: '#2979ff' }} /> Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2979ff'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  <FaPhone style={{ marginRight: '6px', color: '#2979ff' }} /> Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2979ff'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  required
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#333',
                  fontSize: '14px'
                }}>
                  <FaProductHunt style={{ marginRight: '6px', color: '#2979ff' }} /> Products *
                </label>
                
                {/* Add Product Input */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="text"
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter product name"
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2979ff'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                  <button
                    type="button"
                    onClick={addProduct}
                    style={{
                      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Add
                  </button>
                </div>

                {/* Display Added Products */}
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '8px', 
                  minHeight: '50px',
                  padding: '12px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '2px dashed #e2e8f0'
                }}>
                  {formData.products.length === 0 ? (
                    <p style={{ 
                      color: '#999', 
                      fontSize: '13px', 
                      margin: 0,
                      width: '100%',
                      textAlign: 'center'
                    }}>
                      No products added yet
                    </p>
                  ) : (
                    formData.products.map((product, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                          color: '#1976d2',
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: '13px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          border: '1px solid #90caf9'
                        }}
                      >
                        {product}
                        <button
                          type="button"
                          onClick={() => removeProduct(product)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#1976d2',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '12px'
                          }}
                          title="Remove product"
                        >
                          <FaTimes />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    background: '#fff',
                    color: '#666',
                    border: '2px solid #e2e8f0',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#f8f9fa';
                    e.target.style.borderColor = '#cbd5e0';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#fff';
                    e.target.style.borderColor = '#e2e8f0';
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: loading 
                      ? '#cbd5e0' 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    boxShadow: loading ? 'none' : '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                >
                  {loading ? 'Saving...' : (editingBank ? 'Update Bank' : 'Add Bank')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ManageBanks;