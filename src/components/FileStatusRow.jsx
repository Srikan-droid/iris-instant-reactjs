import React, { useState } from 'react';
import ShareModal from './ShareModal';

function FileStatusRow({ item, onDownload, requestId, serialNumber, onShare, sharedInfo }) {
  const [showShareModal, setShowShareModal] = useState(false);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Processing':
        return 'status-processing';
      case 'Completed':
        return 'status-completed';
      default:
        return 'status-default';
    }
  };

  const handleShare = async (email) => {
    await onShare(item.id, email);
  };

  const renderActionColumn = () => {
    if (sharedInfo) {
      // For Review History - show who shared and when
      return (
        <div className="shared-info">
          <div className="shared-by">Shared by: {sharedInfo.fromUserEmail}</div>
          <div className="shared-date">
            {new Date(sharedInfo.sharedAt).toLocaleDateString()}
          </div>
        </div>
      );
    } else {
      // For File History - show Share button and info button for shares
      const shares = item.shares || [];
      
      return (
        <div className="action-column">
          <button
            className="share-btn"
            onClick={() => setShowShareModal(true)}
            title="Share this file"
          >
            📤 Share
          </button>
          {shares.length > 0 && (
            <div className="info-button-container">
              <button className="info-button-blue">
                i
              </button>
              <div className="description-popup">
                <div className="popup-content">
                  <h4>Share Details</h4>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Shared with:</strong>
                  </div>
                  {shares.map((share, index) => (
                    <div key={index} style={{ 
                      marginBottom: '8px', 
                      padding: '4px 0',
                      borderBottom: index < shares.length - 1 ? '1px solid #f0f0f0' : 'none'
                    }}>
                      <div style={{ fontWeight: '500', color: '#333' }}>
                        {share.toUserEmail}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        {new Date(share.sharedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <>
      <tr>
        <td className="serial-number-cell">{serialNumber}</td>
        <td>{item.details.companyName}</td>
        <td>
          <div className="filename-cell">
            <span className="filename-text">{item.filename}</span>
            <div className="info-button-container">
              <button 
                className="info-button-blue"
              >
                i
              </button>
              <div className="description-popup">
                <div className="popup-content">
                  <h4>File Details</h4>
                  <p><strong>Description:</strong> {item.details.description || 'No description'}</p>
                </div>
              </div>
            </div>
          </div>
        </td>
        <td className="request-id-cell">{requestId}</td>
        <td className={`status-cell ${getStatusClass(item.status)}`}>
          <span className="status-badge">{item.status}</span>
        </td>
        <td>{new Date(item.date).toLocaleString()}</td>
        <td>
          <button 
            className="webform-btn"
            onClick={() => alert('Webform for ' + requestId)}
          >
            WebForm
          </button>
        </td>
        <td>
          <div className="download-buttons">
            <button
              onClick={() => onDownload(item.id)}
              disabled={item.status !== 'Completed'}
              className="download-btn xbrl"
              title="Download XBRL"
            >
              📊 XBRL
            </button>
            <button
              onClick={() => onDownload(item.id)}
              disabled={item.status !== 'Completed'}
              className="download-btn json"
              title="Download JSON"
            >
              📄 JSON
            </button>
          </div>
        </td>
        <td className="action-cell">
          {renderActionColumn()}
        </td>
      </tr>
      
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={handleShare}
        fileName={item.filename}
      />
    </>
  );
}

export default FileStatusRow;