import { useState, useEffect } from 'react';
import { adminDashboardAPI } from '../api/admin';
import { useAdminAuth } from '../context/AdminAuthContext';
import TableSkeleton from './TableSkeleton';

const AdminsTable = () => {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { adminUser } = useAdminAuth();

  const fetchAdmins = async () => {
    try {
      const data = await adminDashboardAPI.getAdmins();
      setAdmins(data);
    } catch (err) {
      setError('Failed to load admins data.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleApprove = async (adminId) => {
    try {
      await adminDashboardAPI.approveAdmin(adminId);
      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to approve admin');
    }
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    try {
      await adminDashboardAPI.deleteAdmin(adminId);
      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete admin');
    }
  };

  if (isLoading) return <TableSkeleton columns={5} />;
  if (error) return <div className="error-message">{error}</div>;

  const isSuperAdmin = adminUser?.role === 'superadmin';

  return (
    <div style={{ marginTop: '1rem', marginBottom: '3rem' }}>
      <div
        className="responsive-table"
        style={{ overflowX: 'auto', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '1rem' }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', textAlign: 'center' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-accent)' }}>
              <th style={{ padding: '1rem' }}>ID</th>
              <th style={{ padding: '1rem' }}>Username</th>
              <th style={{ padding: '1rem' }}>Registration Date</th>
              {isSuperAdmin && <th style={{ padding: '1rem' }}>Status</th>}
              {isSuperAdmin && <th style={{ padding: '1rem' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} style={{ borderBottom: '1px solid #333' }}>
                <td data-label="ID" style={{ padding: '1rem' }}>
                  {admin.id}
                </td>
                <td data-label="Username" style={{ padding: '1rem' }}>
                  {admin.username}
                </td>
                <td data-label="Registration Date" style={{ padding: '1rem' }}>
                  {new Date(admin.created_at).toLocaleString()}
                </td>
                {isSuperAdmin && (
                  <td data-label="Status" style={{ padding: '1rem' }}>
                    {admin.is_approved ? (
                      <span
                        style={{
                          color: '#00ff88',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(0,255,136,0.1)',
                        }}
                      >
                        Approved
                      </span>
                    ) : (
                      <span
                        style={{
                          color: '#ffcc00',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255,204,0,0.1)',
                        }}
                      >
                        Pending
                      </span>
                    )}
                  </td>
                )}
                {isSuperAdmin && (
                  <td data-label="Actions" style={{ padding: '1rem' }}>
                    {!admin.is_approved && (
                      <button
                        onClick={() => handleApprove(admin.id)}
                        className="btn-primary"
                        style={{ padding: '0.3rem 0.8rem', fontSize: '0.9rem', marginRight: '0.5rem' }}
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(admin.id)}
                      style={{
                        padding: '0.3rem 0.8rem',
                        fontSize: '0.9rem',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '999px',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={isSuperAdmin ? '5' : '3'} style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>
                  No admins registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminsTable;
