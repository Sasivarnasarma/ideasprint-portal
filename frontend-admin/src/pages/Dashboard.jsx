import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminDashboardAPI } from '../api/admin';

const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({ total_registrations: 0, total_proposals: 0, total_admins: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await adminDashboardAPI.getMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div style={{ color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', margin: 0 }}>Dashboard Overview</h2>
      </div>

      {isLoading ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.8rem',
            marginBottom: '3rem',
            maxWidth: '350px',
            margin: '0 auto',
          }}
        >
          <div className="skeleton skeleton-card" style={{ height: '140px' }}></div>
          <div className="skeleton skeleton-card" style={{ height: '140px' }}></div>
          <div className="skeleton skeleton-card" style={{ height: '140px' }}></div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.8rem',
            marginBottom: '3rem',
            maxWidth: '350px',
            margin: '0 auto',
          }}
        >
          <div
            onClick={() => navigate('/teams')}
            className="auth-card"
            style={{ padding: '1.8rem', textAlign: 'center', cursor: 'pointer' }}
          >
            <h3 style={{ color: '#aaa', margin: 0, fontSize: '1.1rem' }}>Total Teams</h3>
            <p style={{ fontSize: '2.8rem', margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>
              {metrics.total_registrations}
            </p>
          </div>
          <div
            onClick={() => navigate('/submissions')}
            className="auth-card"
            style={{ padding: '1.8rem', textAlign: 'center', cursor: 'pointer' }}
          >
            <h3 style={{ color: '#aaa', margin: 0, fontSize: '1.1rem' }}>Submitted Proposals</h3>
            <p style={{ fontSize: '2.8rem', margin: '0.5rem 0 0 0', fontWeight: 'bold', color: 'var(--color-accent)' }}>
              {metrics.total_proposals}
            </p>
          </div>
          <div
            onClick={() => navigate('/admins')}
            className="auth-card"
            style={{ padding: '1.8rem', textAlign: 'center', cursor: 'pointer' }}
          >
            <h3 style={{ color: '#aaa', margin: 0, fontSize: '1.1rem' }}>Total Admins</h3>
            <p style={{ fontSize: '2.8rem', margin: '0.5rem 0 0 0', fontWeight: 'bold' }}>{metrics.total_admins}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
