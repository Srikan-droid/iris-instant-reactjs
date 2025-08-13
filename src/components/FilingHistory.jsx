import React, { useState, useMemo } from 'react';
import FileStatusRow from './FileStatusRow';

function FilingHistory({ history, onDownload }) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    companyName: '',
    dateFrom: '',
    dateTo: ''
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Generate a unique 6-digit request ID for each file (deterministic for demo)
  const getRequestId = (id) => {
    // Use a hash of the id, or just slice the last 6 digits for demo
    return ("000000" + (parseInt(id, 10) % 1000000)).slice(-6);
  };

  // Get unique statuses for filter dropdown
  const uniqueStatuses = useMemo(() => {
    const statuses = [...new Set(history.map(item => item.status))];
    return statuses.sort();
  }, [history]);

  // Get unique company names for filter dropdown
  const uniqueCompanyNames = useMemo(() => {
    const companies = [...new Set(history.map(item => item.details.companyName).filter(Boolean))];
    return companies.sort();
  }, [history]);

  // Filter history based on all filters
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const requestId = getRequestId(item.id);
      const uploadDate = new Date(item.date);
      const searchLower = filters.search.toLowerCase();
      
      // General search - search across all fields
      if (filters.search && !(
        requestId.includes(filters.search) ||
        item.details.companyName?.toLowerCase().includes(searchLower) ||
        item.filename.toLowerCase().includes(searchLower) ||
        item.status.toLowerCase().includes(searchLower) ||
        item.details.description?.toLowerCase().includes(searchLower)
      )) {
        return false;
      }

      // Status filter
      if (filters.status && item.status !== filters.status) {
        return false;
      }

      // Company name filter
      if (filters.companyName && item.details.companyName !== filters.companyName) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (uploadDate < fromDate) {
          return false;
        }
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (uploadDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [history, filters]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHistory = filteredHistory.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      companyName: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // Mobile-friendly card layout component
  const MobileFileCard = ({ item, requestId }) => (
    <div className="mobile-file-card">
      <div className="mobile-card-header">
        <div className="mobile-request-id">{requestId}</div>
        <div className="mobile-status">
          <span className={`status-badge ${item.status === 'Processing' ? 'status-processing' : item.status === 'Completed' ? 'status-completed' : 'status-default'}`}>
            {item.status}
          </span>
        </div>
      </div>
      <div className="mobile-card-content">
        <div className="mobile-info-row">
          <span className="mobile-label">Company:</span>
          <span className="mobile-value">{item.details.companyName}</span>
        </div>
        <div className="mobile-info-row">
          <span className="mobile-label">File:</span>
          <span className="mobile-value filename-text">{item.filename}</span>
        </div>
        <div className="mobile-info-row">
          <span className="mobile-label">Uploaded:</span>
          <span className="mobile-value">{new Date(item.date).toLocaleDateString()}</span>
        </div>
        {item.details.description && (
          <div className="mobile-info-row">
            <span className="mobile-label">Description:</span>
            <span className="mobile-value">{item.details.description}</span>
          </div>
        )}
      </div>
      <div className="mobile-card-actions">
        <div className="mobile-download-buttons">
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
        <button 
          className="webform-btn"
          onClick={() => alert('Webform for ' + requestId)}
        >
          WebForm
        </button>
      </div>
    </div>
  );

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = getPageNumbers();

    return (
      <div className="pagination">
        <div className="pagination-info">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredHistory.length)} of {filteredHistory.length} entries
        </div>
        
        <div className="pagination-controls">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="pagination-btn prev-btn"
            title="Previous Page"
          >
            ‹
          </button>
          
          {pageNumbers.map(pageNum => (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              className={`pagination-btn page-btn ${currentPage === pageNum ? 'active' : ''}`}
            >
              {pageNum}
            </button>
          ))}
          
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="pagination-btn next-btn"
            title="Next Page"
          >
            ›
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="filing-history">
      <div className="filing-history-header">
        <h2>File History</h2>
        <button 
          onClick={toggleFilters}
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
      
      {/* Filter Section */}
      {showFilters && (
        <div className="filter-section">
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="search">Search:</label>
              <input
                id="search"
                type="text"
                placeholder="Search across all fields..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="status">Status:</label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="companyName">Company Name:</label>
              <select
                id="companyName"
                value={filters.companyName}
                onChange={(e) => handleFilterChange('companyName', e.target.value)}
                className="filter-select"
              >
                <option value="">All Companies</option>
                {uniqueCompanyNames.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="dateFrom">Date From:</label>
              <input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="dateTo">Date To:</label>
              <input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <button
                onClick={clearFilters}
                className="clear-filters-btn"
                disabled={!hasActiveFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          {hasActiveFilters && (
            <div className="filter-summary">
              <span>Showing {filteredHistory.length} of {history.length} records</span>
            </div>
          )}
        </div>
      )}

      {/* Desktop Table View */}
      <div className="desktop-table-view">
        <table>
          <thead>
            <tr>
              <th>Company Name</th>
              <th>File Name</th>
              <th>Request ID</th>
              <th>Status</th>
              <th>Uploaded On</th>
              <th>View</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            {currentHistory.length === 0 ? (
              <tr>
                <td colSpan="7">
                  {hasActiveFilters ? 'No records match the current filters.' : 'No filings yet.'}
                </td>
              </tr>
            ) : (
              currentHistory.map(item => (
                <FileStatusRow
                  key={item.id}
                  item={item}
                  onDownload={onDownload}
                  requestId={getRequestId(item.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-card-view">
        {currentHistory.length === 0 ? (
          <div className="mobile-empty-state">
            {hasActiveFilters ? 'No records match the current filters.' : 'No filings yet.'}
          </div>
        ) : (
          currentHistory.map(item => (
            <MobileFileCard
              key={item.id}
              item={item}
              requestId={getRequestId(item.id)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      <Pagination />
    </div>
  );
}

export default FilingHistory;