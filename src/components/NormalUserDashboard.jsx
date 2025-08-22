import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function NormalUserDashboard() {
  const { token } = useAuth();
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Fetch stores
  const fetchStores = async () => {
    try {
      const url = `http://localhost:5000/api/stores?search=${search}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStores(data);
      } else {
        console.error('Failed to fetch stores');
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStores();
    }, 500); // wait 500ms after typing
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  useEffect(() => {
    fetchStores();
  }, []);

  // Sorting
  const handleSort = (field) => {
    let direction = 'asc';
    if (sortField === field && sortDirection === 'asc') direction = 'desc';
    setSortField(field);
    setSortDirection(direction);

    const sortedStores = [...stores].sort((a, b) => {
      let aValue = field === 'averageRating' ? Number(a[field] || 0) : a[field];
      let bValue = field === 'averageRating' ? Number(b[field] || 0) : b[field];

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setStores(sortedStores);
  };

  // Handle rating submission
  const handleRating = async (storeId, rating) => {
    try {
      const response = await fetch('http://localhost:5000/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ storeId, rating })
      });

      if (response.ok) {
        setSuccess('Rating submitted successfully!');
        fetchStores(); // Refresh stores after rating
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit rating');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Failed to submit rating');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Render stars for average rating
  const renderStars = (rating) => {
    const stars = [];
    const value = Math.round(Number(rating) || 0);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= value ? '' : 'empty'}`}>★</span>
      );
    }
    return stars;
  };

  // Render rating input for user
  const renderRatingInput = (storeId, currentRating) => {
    const stars = [];
    const value = Number(currentRating) || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleRating(storeId, i)}
          className={`star-btn ${i <= value ? 'active' : ''}`}
        >
          ★
        </button>
      );
    }
    return <div className="rating-input">{stars}</div>;
  };

  // Password change handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword.length < 8 || passwordData.newPassword.length > 16) {
      setError('Password must be between 8 and 16 characters');
      return;
    }
    if (!/(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(passwordData.newPassword)) {
      setError('Password must include at least one uppercase letter and one special character');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password updated successfully!');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '' });
      } else {
        setError(data.error || 'Failed to update password');
      }
    } catch (err) {
      setError('Failed to update password');
    }
  };

  return (
    <div>
      {(error || success) && (
        <div className={`${error ? 'error-message' : 'success-message'}`} style={{ marginBottom: '20px' }}>
          {error || success}
        </div>
      )}

      {/* Header */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">My Dashboard</h2>
          <div className="section-actions">
            <input
              type="text"
              placeholder="Search stores by name or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button className="btn-secondary" onClick={() => setShowPasswordModal(true)}>
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Stores */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">All Stores</h2>
          <div className="section-actions">
            <button className="btn-secondary" onClick={() => handleSort('name')}>
              Sort by Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button className="btn-secondary" onClick={() => handleSort('averageRating')}>
              Sort by Rating {sortField === 'averageRating' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        <div className="stores-grid">
          {stores.map(store => (
            <div key={store.id} className="store-card">
              <h3 className="store-name">{store.name}</h3>
              <p className="store-address">{store.address || 'No address provided'}</p>

              <div className="store-rating">
                <div className="average-rating">
                  <span>Average Rating:</span>
                  <div className="rating-stars">
                    {renderStars(store.averageRating)}
                    <span className="rating-value">({Number(store.averageRating || 0).toFixed(1)})</span>
                  </div>
                </div>
              </div>

              <div className="user-rating-section">
                <div className="your-rating">
                  {store.userRating ? `Your Rating: ${store.userRating}/5` : "You haven't rated this store"}
                </div>
                <div>
                  <strong>Rate this store:</strong>
                  {renderRatingInput(store.id, store.userRating)}
                </div>
              </div>
            </div>
          ))}

          {stores.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No stores found. Try adjusting your search.
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Change Password</h2>
              <button className="close-btn" onClick={() => setShowPasswordModal(false)}>×</button>
            </div>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password (8-16 chars, 1 uppercase, 1 special char)</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                  minLength="8"
                  maxLength="16"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .star-btn {
          background: none;
          border: none;
          font-size: 20px;
          color: #e9ecef;
          cursor: pointer;
          margin: 0 2px;
          transition: color 0.2s;
        }
        .star-btn.active,
        .star-btn:hover {
          color: #ffc107;
        }
      `}</style>
    </div>
  );
}

export default NormalUserDashboard;
