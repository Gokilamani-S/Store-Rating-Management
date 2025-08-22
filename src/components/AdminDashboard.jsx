import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [storeSearch, setStoreSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [userFormData, setUserFormData] = useState({ name: '', email: '', password: '', address: '', role: 'normal' });
  const [storeFormData, setStoreFormData] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [storeOwners, setStoreOwners] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Initial fetch
  useEffect(() => {
    fetchDashboardStats();
    fetchUsers();
    fetchStores();
    fetchStoreOwners();
  }, []);

  useEffect(() => { fetchUsers(); }, [userSearch, roleFilter]);
  useEffect(() => { fetchStores(); }, [storeSearch]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) { console.error('Failed to fetch dashboard stats', err); }
  };

  const fetchUsers = async () => {
    try {
      const url = `http://localhost:5000/api/admin/users?search=${userSearch}&role=${roleFilter}`;
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) { console.error('Failed to fetch users', err); }
  };

  const fetchStores = async () => {
    try {
      const url = `http://localhost:5000/api/admin/stores?search=${storeSearch}`;
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setStores(data);
      }
    } catch (err) { console.error('Failed to fetch stores', err); }
  };

  const fetchStoreOwners = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users?role=store_owner', { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setStoreOwners(data);
      }
    } catch (err) { console.error('Failed to fetch store owners', err); }
  };

  const handleSort = (field, data, setData) => {
    let direction = 'asc';
    if (sortField === field && sortDirection === 'asc') direction = 'desc';
    setSortField(field);
    setSortDirection(direction);

    const sortedData = [...data].sort((a, b) => {
      if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setData(sortedData);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = { ...userFormData, email: userFormData.email.toLowerCase().trim() };
      const response = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('User created successfully!');
        setShowUserModal(false);
        setUserFormData({ name: '', email: '', password: '', address: '', role: 'normal' });
        fetchUsers();
        fetchDashboardStats();
        if (userFormData.role === 'store_owner') fetchStoreOwners();
      } else setError(data.error);
    } catch (err) { console.error(err); setError('Failed to create user'); }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = { ...storeFormData, email: storeFormData.email.toLowerCase().trim() };
      const response = await fetch('http://localhost:5000/api/admin/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Store created successfully!');
        setShowStoreModal(false);
        setStoreFormData({ name: '', email: '', address: '', owner_id: '' });
        fetchStores();
        fetchDashboardStats();
      } else setError(data.error);
    } catch (err) { console.error(err); setError('Failed to create store'); }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) stars.push(<span key={i} className={`star ${i <= rating ? '' : 'empty'}`}>★</span>);
    return stars;
  };

  return (
    <div>
      {(error || success) && (
        <div className={`${error ? 'error-message' : 'success-message'}`} style={{ marginBottom: '20px' }}>
          {error || success}
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card"><span className="stat-number">{stats.totalUsers}</span><div className="stat-label">Total Users</div></div>
        <div className="stat-card"><span className="stat-number">{stats.totalStores}</span><div className="stat-label">Total Stores</div></div>
        <div className="stat-card"><span className="stat-number">{stats.totalRatings}</span><div className="stat-label">Total Ratings</div></div>
      </div>

      {/* Users */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">Users Management</h2>
          <div className="section-actions">
            <input type="text" placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="search-input" />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="filter-select">
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="normal">Normal</option>
              <option value="store_owner">Store Owner</option>
            </select>
            <button className="btn-primary" onClick={() => setShowUserModal(true)}>Add User</button>
          </div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name', users, setUsers)}>Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('email', users, setUsers)}>Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                <th>Address</th>
                <th onClick={() => handleSort('role', users, setUsers)}>Role {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                <th>Rating</th>
                <th onClick={() => handleSort('created_at', users, setUsers)}>Created At {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.address || 'N/A'}</td>
                  <td>{user.role.replace('_', ' ').toUpperCase()}</td>
                  <td>{user.role === 'store_owner' ? <div className="rating-stars">{renderStars(user.rating != null ? Math.round(user.rating) : 0)}<span className="rating-value">({user.rating != null ? Number(user.rating).toFixed(1) : '0.0'})</span></div> : 'N/A'}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stores */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">Stores Management</h2>
          <div className="section-actions">
            <input type="text" placeholder="Search stores..." value={storeSearch} onChange={e => setStoreSearch(e.target.value)} className="search-input" />
            <button className="btn-primary" onClick={() => setShowStoreModal(true)}>Add Store</button>
          </div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name', stores, setStores)}>Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                <th onClick={() => handleSort('email', stores, setStores)}>Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                <th>Address</th>
                <th>Owner</th>
                <th>Rating</th>
                <th onClick={() => handleSort('created_at', stores, setStores)}>Created At {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
              </tr>
            </thead>
            <tbody>
              {stores.map(store => (
                <tr key={store.id}>
                  <td>{store.name}</td>
                  <td>{store.email}</td>
                  <td>{store.address || 'N/A'}</td>
                  <td>{store.owner_name || 'No Owner'}</td>
                  <td><div className="rating-stars">{renderStars(store.rating != null ? Math.round(store.rating) : 0)}<span className="rating-value">({store.rating != null ? Number(store.rating).toFixed(1) : '0.0'})</span></div></td>
                  <td>{new Date(store.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Add New User</h2>
              <button className="close-btn" onClick={() => setShowUserModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Full Name (20-60 characters)</label>
                <input type="text" value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})} required minLength="20" maxLength="60"/>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} required/>
              </div>
              <div className="form-group">
                <label>Password (8-16 chars, 1 uppercase, 1 special char)</label>
                <input type="password" value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} required minLength="8" maxLength="16"/>
              </div>
              <div className="form-group">
                <label>Address (Max 400 characters)</label>
                <textarea value={userFormData.address} onChange={e => setUserFormData({...userFormData, address: e.target.value})} maxLength="400"/>
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value})}>
                  <option value="normal">Normal</option>
                  <option value="admin">Admin</option>
                  <option value="store_owner">Store Owner</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowUserModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Store Modal */}
      {showStoreModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Add New Store</h2>
              <button className="close-btn" onClick={() => setShowStoreModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateStore}>
              <div className="form-group">
                <label>Store Name (20-60 characters)</label>
                <input type="text" value={storeFormData.name} onChange={e => setStoreFormData({...storeFormData, name: e.target.value})} required minLength="20" maxLength="60"/>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={storeFormData.email} onChange={e => setStoreFormData({...storeFormData, email: e.target.value})} required/>
              </div>
              <div className="form-group">
                <label>Address (Max 400 characters)</label>
                <textarea value={storeFormData.address} onChange={e => setStoreFormData({...storeFormData, address: e.target.value})} maxLength="400"/>
              </div>
              <div className="form-group">
                <label>Store Owner</label>
                <select value={storeFormData.owner_id} onChange={e => setStoreFormData({...storeFormData, owner_id: e.target.value})}>
                  <option value="">Select Store Owner</option>
                  {storeOwners.map(owner => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowStoreModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Store</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
