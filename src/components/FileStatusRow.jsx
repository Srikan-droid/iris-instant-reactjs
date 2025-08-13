import React from 'react';

function FileStatusRow({ item, onDownload, requestId }) {
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

  return (
    <tr>
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
    </tr>
  );
}

export default FileStatusRow;