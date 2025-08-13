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

  // Initialize profile data based on user type
  useEffect(() => {
    if (user) {
      if (user.user === 'gmail') {
        setProfileData({
          fullName: 'Rachel McAdams', // Mock Gmail user name
          email: 'notebookchick@gmail.com', // Mock Gmail email
          phone: '123-456-7890'
        });
        setTempValues({
          fullName: 'Rachel McAdams',
          email: 'notebookchick@gmail.com',
          phone: '123-456-7890'
        });
      } else if (user.user === 'outlook') {
        setProfileData({
          fullName: 'John Smith', // Mock Outlook user name
          email: 'john.smith@outlook.com', // Mock Outlook email
          phone: '123-456-7890'
        });
        setTempValues({
          fullName: 'John Smith',
          email: 'john.smith@outlook.com',
          phone: '123-456-7890'
        });
      } else if (user.user === 'password') {
        setProfileData({
          fullName: 'User Account', // Mock password user name
          email: user.email || '',
          phone: '123-456-7890'
        });
        setTempValues({
          fullName: 'User Account',
          email: user.email || '',
          phone: '123-456-7890'
        });
      } else if (user.user === 'guest') {
        setProfileData({
          fullName: user.name || '',
          email: user.email || '',
          phone: '123-456-7890'
        });
        setTempValues({
          fullName: user.name || '',
          email: user.email || '',
          phone: '123-456-7890'
        });
      }
    }
  }, [user]);

  const handleEdit = (field) => {
    setEditing(prev => ({ ...prev, [field]: true }));
    setTempValues(prev => ({ ...prev, [field]: profileData[field] }));
  };

  const handleSave = (field) => {
    setProfileData(prev => ({ ...prev, [field]: tempValues[field] }));
    setEditing(prev => ({ ...prev, [field]: false }));
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
        setProfileImage(e.target.result);
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
              <div className="subscription-plans">
                <div className="plan-card basic">
                  <div className="plan-header">
                    <h3>FREE</h3>
                    <div className="plan-price">
                      <span className="price">$0</span>
                    </div>
                  </div>
                  <div className="plan-features">
                    <div className="feature">First Feature Here</div>
                    <div className="feature">Second Feature Here</div>
                    <div className="feature">Third Feature Here</div>
                  </div>
                  <button className="plan-btn basic-btn">Get Started</button>
                </div>

                <div className="plan-card standard">
                  <div className="popular-badge">MOST POPULAR</div>
                  <div className="plan-header">
                    <h3>PRO</h3>
                    <div className="plan-price">
                      <span className="price">$149.99</span>
                    </div>
                  </div>
                  <div className="plan-features">
                    <div className="feature">First Feature Here</div>
                    <div className="feature">Second Feature Here</div>
                    <div className="feature">Third Feature Here</div>
                    <div className="feature">Fourth Feature Here</div>
                    <div className="feature">Fifth Feature Here</div>
                  </div>
                  <button className="plan-btn standard-btn">Get Started</button>
                </div>

                <div className="plan-card premium">
                  <div className="plan-header">
                    <h3>PREMIUM</h3>
                    <div className="plan-price">
                      <span className="price">$249.99</span>
                    </div>
                  </div>
                  <div className="plan-features">
                    <div className="feature">First Feature Here</div>
                    <div className="feature">Second Feature Here</div>
                    <div className="feature">Third Feature Here</div>
                    <div className="feature">Fourth Feature Here</div>
                    <div className="feature">Fifth Feature Here</div>
                    <div className="feature">Sixth Feature Here</div>
                  </div>
                  <button className="plan-btn premium-btn">Get Started</button>
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