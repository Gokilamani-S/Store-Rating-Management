import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function StoreOwnerDashboard() {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState({ averageRating: 0, ratings: [] });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stores/owner-dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Ensure averageRating is numeric
        data.averageRating = Number(data.averageRating) || 0;
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data');
    }
  };

  const handleSort = (field) => {
    let direction = 'desc';
    if (sortField === field && sortDirection === 'desc') {
      direction = 'asc';
    }
    setSortField(field);
    setSortDirection(direction);

    const sortedRatings = [...dashboardData.ratings].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      if (field === 'rating') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (field === 'created_at' || field === 'updated_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setDashboardData({
      ...dashboardData,
      ratings: sortedRatings
    });
  };

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
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to update password');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? '' : 'empty'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div>
      {(error || success) && (
        <div className={`${error ? 'error-message' : 'success-message'}`} style={{ marginBottom: '20px' }}>
          {error || success}
        </div>
      )}

      {/* Header Actions */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">Store Owner Dashboard</h2>
          <div className="section-actions">
            <button className="btn-secondary" onClick={() => setShowPasswordModal(true)}>
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Average Rating Card */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{(Number(dashboardData.averageRating) || 0).toFixed(1)}</span>
          <div className="stat-label">Average Rating</div>
          <div className="rating-stars" style={{ marginTop: '10px', justifyContent: 'center' }}>
            {renderStars(Math.round(Number(dashboardData.averageRating) || 0))}
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-number">{dashboardData.ratings.length}</span>
          <div className="stat-label">Total Reviews</div>
        </div>
      </div>

      {/* Ratings Table */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">Customer Reviews</h2>
          <div className="section-actions">
            <button className="btn-secondary" onClick={() => handleSort('created_at')}>
              Sort by Date {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button className="btn-secondary" onClick={() => handleSort('rating')}>
              Sort by Rating {sortField === 'rating' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button className="btn-secondary" onClick={() => handleSort('userName')}>
              Sort by User {sortField === 'userName' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {dashboardData.ratings.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Rating</th>
                  <th>Submitted Date</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.ratings.map(rating => (
                  <tr key={rating.id}>
                    <td>{rating.userName}</td>
                    <td>
                      <div className="rating-stars">
                        {renderStars(Number(rating.rating))}
                        <span className="rating-value">({rating.rating}/5)</span>
                      </div>
                    </td>
                    <td>{new Date(rating.created_at).toLocaleDateString()}</td>
                    <td>
                      {rating.updated_at !== rating.created_at 
                        ? new Date(rating.updated_at).toLocaleDateString()
                        : 'Never updated'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <h3>No reviews yet</h3>
            <p>Your store hasn't received any ratings yet.</p>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
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
    </div>
  );
}

export default StoreOwnerDashboard;
