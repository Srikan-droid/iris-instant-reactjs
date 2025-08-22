import React, { useState, useEffect, useRef } from 'react';

function Profile({ user }) {
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('basic');
  
  const [editing, setEditing] = useState({
    fullName: false,
    email: false,
    phone: false
  });
  
  const [tempValues, setTempValues] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  // New state for plans and payment history
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [couponCode, setCouponCode] = useState('');
  const [discountedPlans, setDiscountedPlans] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Mock payment history data
  const [paymentHistory] = useState([
    {
      id: 1,
      date: '2024-01-15',
      description: 'PRO Plan - Monthly Subscription',
      amount: 149.99,
      status: 'Completed',
      transactionId: 'TXN-2024-001'
    },
    {
      id: 2,
      date: '2024-01-01',
      description: 'PRO Plan - Monthly Subscription',
      amount: 149.99,
      status: 'Completed',
      transactionId: 'TXN-2024-002'
    },
    {
      id: 3,
      date: '2023-12-15',
      description: 'PRO Plan - Monthly Subscription',
      amount: 149.99,
      status: 'Completed',
      transactionId: 'TXN-2023-015'
    },
    {
      id: 4,
      date: '2023-12-01',
      description: 'PRO Plan - Monthly Subscription',
      amount: 149.99,
      status: 'Completed',
      transactionId: 'TXN-2023-014'
    },
    {
      id: 5,
      date: '2023-11-15',
      description: 'PRO Plan - Monthly Subscription',
      amount: 149.99,
      status: 'Completed',
      transactionId: 'TXN-2023-013'
    }
  ]);

  // Helper function to get storage key for profile data
  const getProfileStorageKey = (userEmail) => {
    return `profile_data_${userEmail}`;
  };

  // Helper function to save profile data to localStorage
  const saveProfileData = (data) => {
    if (user) {
      const userEmail = getUserEmail();
      const storageKey = getProfileStorageKey(userEmail);
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
  };

  // Helper function to load profile data from localStorage
  const loadProfileData = () => {
    if (user) {
      const userEmail = getUserEmail();
      const storageKey = getProfileStorageKey(userEmail);
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          return JSON.parse(savedData);
        } catch (error) {
          console.error('Error parsing saved profile data:', error);
          localStorage.removeItem(storageKey);
        }
      }
    }
    return null;
  };

  // Helper function to get user email
  const getUserEmail = () => {
    if (!user) return '';
    if (user.user === 'guest') return user.email;
    if (user.user === 'gmail') return 'user@gmail.com';
    if (user.user === 'outlook') return 'user@outlook.com';
    if (user.user === 'password') return user.email;
    return 'user@gmail.com';
  };

  // Initialize profile data based on user type and saved data
  useEffect(() => {
    if (user) {
      // First, try to load saved profile data
      const savedData = loadProfileData();
      
      if (savedData) {
        // Use saved data if available
        setProfileData(savedData);
        setTempValues(savedData);
      } else {
        // Use default mock data based on user type
        let defaultData = {
          fullName: '',
          email: '',
          phone: '123-456-7890'
        };

        if (user.user === 'gmail') {
          defaultData = {
            fullName: 'Rachel McAdams',
            email: 'notebookchick@gmail.com',
            phone: '123-456-7890'
          };
        } else if (user.user === 'outlook') {
          defaultData = {
            fullName: 'John Smith',
            email: 'john.smith@outlook.com',
            phone: '123-456-7890'
          };
        } else if (user.user === 'password') {
          defaultData = {
            fullName: 'User Account',
            email: user.email || '',
            phone: '123-456-7890'
          };
        } else if (user.user === 'guest') {
          defaultData = {
            fullName: 'Guest User',
            email: user.email || 'guest@example.com',
            phone: '123-456-7890'
          };
        }

        setProfileData(defaultData);
        setTempValues(defaultData);
        saveProfileData(defaultData);
      }
    }
  }, [user]);

  // Handle coupon code application
  const handleCouponApply = () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      setCouponSuccess('');
      return;
    }

    // Mock coupon validation - in real app, this would be an API call
    const validCoupons = {
      'SAVE20': { discount: 0.20, message: '20% discount applied!' },
      'SAVE50': { discount: 0.50, message: '50% discount applied!' },
      'WELCOME10': { discount: 0.10, message: '10% welcome discount applied!' }
    };

    const coupon = validCoupons[couponCode.toUpperCase()];
    
    if (coupon) {
      setCouponSuccess(coupon.message);
      setCouponError('');
      
      // Apply discount to plans
      setDiscountedPlans({
        pro: 149.99 * (1 - coupon.discount),
        premium: 249.99 * (1 - coupon.discount),
        discount: coupon.discount
      });
    } else {
      setCouponError('Invalid coupon code. Please try again.');
      setCouponSuccess('');
      setDiscountedPlans(null);
    }
  };

  // Handle plan selection
  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  // Handle get started button click
  const handleGetStarted = (plan) => {
    if (plan === 'free') {
      // Free plan is already selected, show message
      alert('You are already on the FREE plan!');
      return;
    }
    
    // For paid plans, this would typically redirect to payment
    alert(`Redirecting to payment for ${plan.toUpperCase()} plan...`);
  };

  const handleEdit = (field) => {
    setEditing(prev => ({ ...prev, [field]: true }));
    setTempValues(prev => ({ ...prev, [field]: profileData[field] }));
  };

  const handleSave = (field) => {
    const updatedProfileData = { ...profileData, [field]: tempValues[field] };
    setProfileData(updatedProfileData);
    setEditing(prev => ({ ...prev, [field]: false }));
    
    // Save the updated profile data to localStorage
    saveProfileData(updatedProfileData);
  };

  const handleCancel = (field) => {
    setEditing(prev => ({ ...prev, [field]: false }));
    setTempValues(prev => ({ ...prev, [field]: profileData[field] }));
  };

  const handleInputChange = (field, value) => {
    setTempValues(prev => ({ ...prev, [field]: value }));
  };

  const handleVerifyEmail = () => {
    alert('Verification email sent to ' + profileData.email);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Image file size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        setProfileImage(imageData);
        
        // Save profile image to localStorage
        if (user) {
          const userEmail = getUserEmail();
          const imageStorageKey = `profile_image_${userEmail}`;
          localStorage.setItem(imageStorageKey, imageData);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleRemovePhoto = () => {
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Remove profile image from localStorage
    if (user) {
      const userEmail = getUserEmail();
      const imageStorageKey = `profile_image_${userEmail}`;
      localStorage.removeItem(imageStorageKey);
    }
  };

  const renderField = (field, label, type = 'text', showVerify = false) => (
    <div className="profile-field">
      <label>{label}:</label>
      <div className="field-container">
        {editing[field] ? (
          <>
            {field === 'fullName' ? (
              <div className="name-input-group">
                <select className="title-select">
                  <option value="Ms.">Ms.</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                </select>
                <input
                  type={type}
                  value={tempValues[field]}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  className="profile-input name-input"
                  placeholder="Enter full name"
                />
              </div>
            ) : (
              <input
                type={type}
                value={tempValues[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                className="profile-input"
              />
            )}
            <div className="field-actions">
              <button 
                onClick={() => handleSave(field)}
                className="save-btn"
              >
                Save
              </button>
              <button 
                onClick={() => handleCancel(field)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            {field === 'fullName' ? (
              <div className="name-display">
                <span className="title-display">Ms.</span>
                <span className="field-value name-value">{profileData[field]}</span>
              </div>
            ) : field === 'email' ? (
              <div className="email-display">
                <span className="email-icon">📧</span>
                <span className="field-value email-value">{profileData[field]}</span>
              </div>
            ) : field === 'phone' ? (
              <div className="phone-display">
                <span className="phone-icon">📞</span>
                <span className="field-value phone-value">{profileData[field]}</span>
              </div>
            ) : (
              <span className="field-value">{profileData[field]}</span>
            )}
            <div className="field-actions">
              <button 
                onClick={() => handleEdit(field)}
                className="edit-btn"
              >
                Edit
              </button>
              {showVerify && field === 'email' && user?.user === 'guest' && (
                <button 
                  onClick={handleVerifyEmail}
                  className="verify-btn"
                >
                  Verify
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Left Navigation */}
        <div className="profile-nav">
          <div className="profile-picture" onClick={handleImageClick}>
            <img 
              src={profileImage || "https://via.placeholder.com/80x80/1976d2/ffffff?text=👤"} 
              alt="Profile" 
              className="profile-avatar"
            />
            <div className="profile-image-overlay">
              <span>📷</span>
            </div>
            <div className="upload-tooltip">Click to upload</div>
          </div>
          {profileImage && (
            <div className="profile-photo-actions">
              <button 
                type="button" 
                className="remove-photo-btn" 
                onClick={handleRemovePhoto}
              >
                Remove Photo
              </button>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <nav className="profile-menu">
            <div 
              className={`nav-item ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              <span className="nav-indicator"></span>
              Basic Details
            </div>
            <div 
              className={`nav-item ${activeTab === 'plans' ? 'active' : ''}`}
              onClick={() => setActiveTab('plans')}
            >
              <span className="nav-indicator"></span>
              My Plans
            </div>
            <div 
              className={`nav-item ${activeTab === 'paymentHistory' ? 'active' : ''}`}
              onClick={() => setActiveTab('paymentHistory')}
            >
              <span className="nav-indicator"></span>
              Payment History
            </div>
          </nav>
        </div>

        {/* Right Content */}
        <div className="profile-content">
          {activeTab === 'basic' && (
            <div className="profile-section">
              <h2>Basic Details</h2>
              
              {renderField('fullName', 'Full Name')}
              {renderField('email', 'Email', 'email', true)}
              {renderField('phone', 'Phone Number', 'tel')}
              
              <div className="profile-actions">
                <button className="update-btn">
                  Update
                  <span className="arrow">→</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="profile-section">
              <h2>My Plans</h2>
              
              {/* Coupon Code Section */}
              <div className="coupon-section" style={{ marginBottom: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#495057' }}>Have a Coupon Code?</h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label htmlFor="coupon-code" style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#495057', marginBottom: '6px' }}>
                      Coupon Code:
                    </label>
                    <input
                      id="coupon-code"
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px',
                        fontSize: '0.95rem',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <button
                    onClick={handleCouponApply}
                    style={{
                      padding: '10px 16px',
                      background: '#1976d2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      transition: 'background 0.2s',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <div style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '8px', padding: '8px 12px', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px' }}>
                    {couponError}
                  </div>
                )}
                {couponSuccess && (
                  <div style={{ color: '#155724', fontSize: '0.85rem', marginTop: '8px', padding: '8px 12px', background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px' }}>
                    {couponSuccess}
                  </div>
                )}
              </div>

              <div className="subscription-plans">
                <div className={`plan-card basic ${selectedPlan === 'free' ? 'selected' : ''}`} onClick={() => handlePlanSelect('free')}>
                  <div className="plan-header">
                    <h3>FREE</h3>
                    <div className="plan-price">
                      <span className="price">$0</span>
                    </div>
                  </div>
                  <div className="plan-features">
                    <div className="feature">Up to 5 file uploads per month</div>
                    <div className="feature">Basic XBRL conversion</div>
                    <div className="feature">Email support</div>
                  </div>
                  <button 
                    className="plan-btn basic-btn" 
                    disabled={true}
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  >
                    Current Plan
                  </button>
                </div>

                <div className={`plan-card standard ${selectedPlan === 'pro' ? 'selected' : ''}`} onClick={() => handlePlanSelect('pro')}>
                  <div className="popular-badge">MOST POPULAR</div>
                  <div className="plan-header">
                    <h3>PRO</h3>
                    <div className="plan-price">
                      <span className="price">
                        {discountedPlans ? `$${discountedPlans.pro.toFixed(2)}` : '$149.99'}
                      </span>
                      {discountedPlans && (
                        <span style={{ fontSize: '0.9rem', textDecoration: 'line-through', opacity: 0.7 }}>
                          $149.99
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="plan-features">
                    <div className="feature">Unlimited file uploads</div>
                    <div className="feature">Advanced XBRL conversion</div>
                    <div className="feature">Priority support</div>
                    <div className="feature">Custom templates</div>
                    <div className="feature">API access</div>
                  </div>
                  <button 
                    className="plan-btn standard-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGetStarted('pro');
                    }}
                  >
                    Get Started
                  </button>
                </div>

                <div className={`plan-card premium ${selectedPlan === 'premium' ? 'selected' : ''}`} onClick={() => handlePlanSelect('premium')}>
                  <div className="plan-header">
                    <h3>PREMIUM</h3>
                    <div className="plan-price">
                      <span className="price">
                        {discountedPlans ? `$${discountedPlans.premium.toFixed(2)}` : '$249.99'}
                      </span>
                      {discountedPlans && (
                        <span style={{ fontSize: '0.9rem', textDecoration: 'line-through', opacity: 0.7 }}>
                          $249.99
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="plan-features">
                    <div className="feature">Everything in PRO</div>
                    <div className="feature">White-label solutions</div>
                    <div className="feature">Dedicated support</div>
                    <div className="feature">Custom integrations</div>
                    <div className="feature">Advanced analytics</div>
                    <div className="feature">SLA guarantee</div>
                  </div>
                  <button 
                    className="plan-btn premium-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGetStarted('premium');
                    }}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'paymentHistory' && (
            <div className="profile-section">
              <h2>Payment History</h2>
              
              <div className="payment-history-container" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div className="payment-history-header" style={{ background: '#f8f9fa', padding: '16px 20px', borderBottom: '1px solid #e9ecef' }}>
                  <h3 style={{ margin: '0', fontSize: '1.1rem', color: '#495057' }}>Transaction History</h3>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#6c757d' }}>
                    View all your payment transactions and billing history
                  </p>
                </div>
                
                <div className="payment-history-table" style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                      <tr style={{ background: '#e3f2fd', borderBottom: '2px solid #1976d2' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600', color: '#1976d2', width: '15%' }}>Date</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600', color: '#1976d2', width: '35%' }}>Description</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.9rem', fontWeight: '600', color: '#1976d2', width: '15%' }}>Amount</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600', color: '#1976d2', width: '15%' }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600', color: '#1976d2', width: '20%' }}>Transaction ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((payment, index) => (
                        <tr key={payment.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = '#f8f9fa'} onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = '#fff'}>
                          <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: '#495057' }}>
                            {new Date(payment.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: '#333', fontWeight: '500' }}>
                            {payment.description}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.9rem', fontWeight: '600', color: '#1976d2' }}>
                            ${payment.amount.toFixed(2)}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              backgroundColor: '#d4edda',
                              color: '#155724',
                              border: '1px solid #c3e6cb'
                            }}>
                              {payment.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6c757d', fontFamily: 'monospace' }}>
                            {payment.transactionId}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {paymentHistory.length === 0 && (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6c757d', fontStyle: 'italic' }}>
                    No payment history found. Your transactions will appear here once you make a payment.
                  </div>
                )}
              </div>
              
              <div className="payment-summary" style={{ marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#495057' }}>Payment Summary</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: '0', fontSize: '0.9rem', color: '#6c757d' }}>Total Transactions: {paymentHistory.length}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#6c757d' }}>
                      Total Amount: ${paymentHistory.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}
                    </p>
                  </div>
                  <button style={{
                    padding: '8px 16px',
                    background: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'background 0.2s'
                  }}>
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile; 