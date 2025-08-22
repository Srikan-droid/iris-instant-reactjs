import React, { useState } from 'react';

function ShareModal({ isOpen, onClose, onShare, fileName }) {
  const [emails, setEmails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmails = (emailString) => {
    if (!emailString.trim()) {
      return { isValid: false, message: 'Please enter at least one email address' };
    }

    const emailList = emailString.split(',').map(email => email.trim()).filter(email => email);
    
    if (emailList.length === 0) {
      return { isValid: false, message: 'Please enter at least one valid email address' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      return { 
        isValid: false, 
        message: `Invalid email address(es): ${invalidEmails.join(', ')}` 
      };
    }

    return { isValid: true, emails: emailList };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateEmails(emails);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Share with each email address
      for (const email of validation.emails) {
        await onShare(email);
      }
      setEmails('');
      onClose();
    } catch (error) {
      setError('Failed to share file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmails('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Share File</h3>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p>Share <strong>{fileName}</strong> with:</p>
            
            <div className="form-group">
              <label htmlFor="share-emails">Email Addresses:</label>
              <textarea
                id="share-emails"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="Enter email addresses separated by commas (e.g., user1@example.com, user2@example.com)"
                className="form-input"
                disabled={isLoading}
                autoFocus
                rows={3}
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
              <small style={{ color: '#6c757d', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                You can enter multiple email addresses separated by commas
              </small>
            </div>
            
            {error && <div className="error-message">{error}</div>}
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ShareModal;
